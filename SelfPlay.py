import chess
import chess.pgn
from TrainChessAI import featurize_board
from ChessAI import load_model, create_model, save_model
import numpy as np
import matplotlib.pyplot as plt


def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def get_move_score(model_output, move):
    from_square = move.from_square
    to_square = move.to_square
    # Assuming model_output is a 2D array with shape (64, 64)
    score = model_output[from_square, to_square]
    return score

def probabilistic_move_selection(model_output, board):
    legal_moves = list(board.legal_moves)
    scores = np.array([get_move_score(model_output, move) for move in legal_moves])
    
    # Apply softmax to convert scores to probabilities
    probabilities = softmax(scores)
    
    # Ensure probabilities sum to 1 (necessary if any preprocessing was applied)
    probabilities /= probabilities.sum()
    
    # Choose a move based on the probabilities
    chosen_index = np.random.choice(len(legal_moves), p=probabilities)
    return legal_moves[chosen_index]

def generate_model_move(model, board, stats, show_output=False):
    input_format = featurize_board(board.fen(), rotate=not board.turn)
    input_format = input_format.reshape(-1, 384)  # Match your model's expected input shape
    
    model_output = model.predict(input_format).reshape((64, 64))
    if show_output:
        plt.imshow(model_output, cmap='Greys')
        plt.show()
    
    move = probabilistic_move_selection(model_output, board)
    if move:
        stats['legal_moves'] += 1
        if board.is_en_passant(move):
            stats['en_passant_captures'] += 1
        if board.is_castling(move):
            stats['castles'] += 1
        return move
    else:
        stats['illegal_moves'] += 1
        return None

def play_self(model, game_limit=1):
    for game_number in range(game_limit):
        board = chess.Board()
        game = chess.pgn.Game()
        game.headers["Event"] = "Self-play Session"
        game.headers["White"] = "Chess AI (White)"
        game.headers["Black"] = "Chess AI (Black)"
        node = game

        stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}

        while not board.is_game_over(claim_draw=True):
            move = generate_model_move(model, board, stats)  # Use the provided function to generate moves
            if move:
                board.push(move)
                node = node.add_variation(move)
            else:
                break  # If no legal moves are found, or generate_model_move returns None

        # Optionally save or print the game
        print(game)
        with open(f"self_play_game_{game_number}.pgn", "w") as f:
            print(game, file=f)

        print(f"Game {game_number+1} completed. Stats: {stats}")

if __name__ == "__main__":
    # User choice for creating a new model or using an existing one
    choice = input("Do you want to 'Create' a new model or 'Continue' using an old one? ").strip().lower()
    directory = 'Model/'
    filename = 'my_trained_chess_ai'

    if choice == 'create':
        model = create_model()
        print("Created a new model.")
        # Optionally, save the newly created model
        save_model(model, filename)  # Ensure you have a function to save the model
    elif choice == 'continue':
        model = load_model(filename)
        print("Loaded existing model.")
    else:
        print("Invalid choice. Exiting the program.")
        exit()  # Exit the program if the user input is not recognized

    play_self(model, game_limit=10)