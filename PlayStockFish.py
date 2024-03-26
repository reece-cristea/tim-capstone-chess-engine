import chess
import chess.engine
import chess.pgn
import matplotlib.pyplot as plt
import numpy as np
import os
from keras.models import model_from_json
from keras.utils import to_categorical
from TrainChessAI import featurize_board

# Assuming ChessAI.py contains a load_model function that correctly initializes and loads a model
from ChessAI import load_model

# Path to your Stockfish engine executable
stockfish_path = 'D:\\ChessBot\\stockfish\\stockfish-windows-x86-64-avx2.exe'
training_data = []

def stockfish_move(board):
    with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
        result = engine.play(board, chess.engine.Limit(time=0.1))
        return result.move.uci()

def generate_model_move(model, board, stats, show_output=False):
    input_format = featurize_board(board.fen(), rotate=not board.turn)
    input_format = input_format.reshape(-1, 491)

    y = model.predict(input_format).reshape((64, 64))
    if show_output:
        plt.imshow(y, cmap='Greys')
    iterations = 0
    max_iterations = 64 * 64

    while iterations < max_iterations:
        from_square, to_square = np.unravel_index(y.argmax(), y.shape)
        move = chess.Move(from_square, to_square)
        if board.piece_type_at(from_square) == chess.PAWN and chess.square_rank(to_square) in [0, 7]:
            move = chess.Move(from_square, to_square, chess.QUEEN)
        if board.is_legal(move):
            stats['legal_moves'] += 1
            if board.is_en_passant(move):
                stats['en_passant_captures'] += 1
            if board.is_castling(move):
                stats['castles'] += 1
            return move
        else:
            stats['illegal_moves'] += 1
        y[from_square, to_square] = 0
        iterations += 1
    return None

def add_to_training_data(board_fen, move):
    input_features = featurize_board(board_fen, rotate=False)
    input_features = input_features.reshape(-1, 491)
    move_index = np.ravel_multi_index((move.from_square, move.to_square), (64, 64))
    output_target = to_categorical(move_index, num_classes=4096).reshape((4096,))
    training_data.append((input_features, output_target))

def train_model(model):
    if not training_data:
        print("No training data available.")
        return
    
    X, Y = zip(*training_data)
    X = np.array(X).reshape(-1, 491)
    Y = np.array(Y)
    
    model.fit(X, Y, epochs=3, batch_size=64, validation_split=0.1)
    print("Model training complete.")
    
    training_data.clear()

    # Save the improved model
    save_model(model, 'my_trained_chess_ai_updated')

def save_model(model, filename):
    base_path = "Model/"
    model_json = model.to_json()
    if not filename.endswith('.json'):
        filename += '.json'
    json_filename = os.path.join(base_path, filename)
    h5_filename = os.path.join(base_path, filename.replace('.json', '.h5'))

    with open(json_filename, "w") as json_file:
        json_file.write(model_json)
    model.save_weights(h5_filename)
    print(f"Saved model to {json_filename} and weights to {h5_filename}")

def play_game(model, game_number, is_ai_white):
    board = chess.Board()
    stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}
    game = chess.pgn.Game()
    game.headers["Event"] = "AI vs Stockfish Match"
    game.headers["White"] = "My Chess AI" if is_ai_white else "Stockfish"
    game.headers["Black"] = "Stockfish" if is_ai_white else "My Chess AI"
    node = game

    while not board.is_game_over(claim_draw=True):
        print(board)
        if (board.turn == chess.WHITE and is_ai_white) or (board.turn == chess.BLACK and not is_ai_white):
            move = generate_model_move(model, board, stats, show_output=True)
            if move:
                board.push(move)
                add_to_training_data(board.fen(), move)
        else:
            sf_move = stockfish_move(board)
            move = chess.Move.from_uci(sf_move)
            board.push(move)
            print(f"Stockfish move: {sf_move}")
        node = node.add_variation(move)

    game_result = board.result(claim_draw=True)
    game.headers["Result"] = game_result
    print(f"Game over: {game.headers['Result']} - {game.headers['White']} vs {game.headers['Black']}")

    matches_folder = "Matches"
    os.makedirs(matches_folder, exist_ok=True)
    pgn_filename = os.path.join(matches_folder, f"AI_vs_Stockfish_Match_{game_number}.pgn")
    with open(pgn_filename, "w", encoding="utf-8") as pgn_file:
        exporter = chess.pgn.FileExporter(pgn_file)
        game.accept(exporter)
    
    print(f"Game saved to {pgn_filename}")

    # Train the model using the data collected during the game
    train_model(model)

    return game_result

def main():
    model = load_model('my_trained_chess_ai')
    total_games = 2000
    ai_wins = 0
    stockfish_wins = 0
    draws = 0

    for game_number in range(1, total_games + 1):
        print(f"Starting game {game_number} of {total_games}")
        is_ai_white = game_number % 2 == 0
        result = play_game(model, game_number, is_ai_white)
        if (result == "1-0" and is_ai_white) or (result == "0-1" and not is_ai_white):
            ai_wins += 1
        elif (result == "0-1" and is_ai_white) or (result == "1-0" and not is_ai_white):
            stockfish_wins += 1
        else:
            draws += 1

    print(f"Total games: {total_games}")
    print(f"AI wins: {ai_wins}")
    print(f"Stockfish wins: {stockfish_wins}")
    print(f"Draws: {draws}")

if __name__ == "__main__":
    main()
