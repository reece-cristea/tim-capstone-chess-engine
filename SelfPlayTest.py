import chess
import chess.pgn
from TrainChessAI import featurize_board  # Ensure this module correctly handles 490 features
from ChessAI import load_model, create_model, save_model
import numpy as np
import matplotlib.pyplot as plt
from keras.utils import to_categorical
import os

# Global list to store game data for training
training_data = []

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

def add_to_training_data(board_fen, move, model_output):
    input_features = featurize_board(board_fen, rotate=False)
    input_features = input_features.reshape(-1, 490)  # Adjust to match the updated model's input shape
    move_index = np.ravel_multi_index((move.from_square, move.to_square), (64, 64))
    output_target = to_categorical(move_index, num_classes=4096).reshape((4096,))
    
    training_data.append((input_features, output_target))

def train_model_from_self_play(model, epochs=3, batch_size=64):
    if not training_data:
        print("No training data available.")
        return
    
    X, Y = zip(*training_data)
    X = np.array(X).reshape(-1, 490)  # Adjust dimensions as needed for your model
    Y = np.array(Y)
    
    model.fit(X, Y, epochs=epochs, batch_size=batch_size, validation_split=0.1)
    print("Model training complete.")

def generate_model_move(model, board, stats, show_output=False):
    input_format = featurize_board(board.fen(), rotate=not board.turn)
    input_format = input_format.reshape(-1, 490)  # Adjust to match the updated model's expected input shape
    
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
        
        # Collect data for training
        add_to_training_data(board.fen(), move, model_output)
        
        return move
    else:
        stats['illegal_moves'] += 1
        return None

def play_self(model, game_limit=1):
    matches_directory = "Matches"  # Name of the directory to save games
    os.makedirs(matches_directory, exist_ok=True)  # Create directory if it doesn't exist

    for game_number in range(game_limit):
        board = chess.Board()
        game = chess.pgn.Game()
        game.headers["Event"] = "Self-play Session"
        game.headers["White"] = "Chess AI (White)"
        game.headers["Black"] = "Chess AI (Black)"
        node = game

        stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}

        while not board.is_game_over(claim_draw=True):
            move = generate_model_move(model, board, stats)
            if move:
                board.push(move)
                node = node.add_variation(move)
            else:
                break

        print(game)
        game_file_path = os.path.join(matches_directory, f"self_play_game_{game_number}.pgn")  # Modify this line
        with open(game_file_path, "w") as f:
            print(game, file=f)

        print(f"Game {game_number+1} completed. Stats: {stats}")

        # Train the model with data collected from the game
        train_model_from_self_play(model)
        # Clear training data for next game
        training_data.clear()

if __name__ == "__main__":
    choice = input("Do you want to 'Create' a new model or 'Continue' using an old one? ").strip().lower()
    directory = 'Model/'
    filename = 'my_trained_chess_ai'

    if choice == 'create':
        model = create_model()  # Ensure this function is updated to create a model with the correct input shape
        print("Created a new model.")
        save_model(model, filename)  # Ensure you have a function to save the model
    elif choice == 'continue':
        model = load_model(filename)
        print("Loaded existing model.")
    else:
        print("Invalid choice. Exiting the program.")
        exit()  # Exit the program if the user input is not recognized

    play_self(model, game_limit=100)