import chess
import chess.pgn
import numpy as np
import os
from ChessAI import save_model

PAWN = 0
ROOK = 1
KNIGHT = 2
BISHOP = 3
QUEEN = 4
KING = 5

WHITE = True
BLACK = False

class chessAiTrainer():
    # Pieces on 8x8 board 
    INPUTS = 6 * 8 * 8
    # Possible moves even illegal ones
    MOVES = 64 * 64

    def __init__(self, max_rows):
        self.X = np.zeros((max_rows, self.INPUTS), dtype='int8')  
        self.Y = np.zeros((max_rows, self.MOVES), dtype='int8')  
        self.rows = 0
        self.max_rows = max_rows

    def reset(self):
        self.rows = 0

    def get(self):
        return self.X[:self.rows, :], self.Y[:self.rows, :]
    
    def is_full(self):
        return self.rows >= self.max_rows

    def add_from_file(self, filename):
        data = np.load(filename)
        return self.add_from_data(data)
    
    def add_from_data(self, data):
        data_rows = data['meta'][0]
        if self.rows + data_rows > self.max_rows:
            return False
        self.X[self.rows:self.rows + data_rows, :] = data['X'][:data_rows, :]
        self.Y[self.rows:self.rows + data_rows, :] = data['Y'][:data_rows, :]
        self.rows += data_rows
        return True
    
    def add_from_folder(self, foldername, printonly=False):
        total_rows = 0
        for filename in os.listdir(foldername):
            if not filename.endswith('.npz'):
                continue
            filepath = os.path.join(foldername, filename)
            data = np.load(filepath)
            data_rows = data['meta'][0]
            print(f"{data_rows} rows in {filename}")
            total_rows += data_rows
            if printonly:
                continue
            if not self.add_from_data(data):
                print("Training set full, not adding this file.")
                break
        print(f"{total_rows} total rows ({float(total_rows) * (self.INPUTS + self.MOVES) / (1024 ** 3):.2f}GB expanded)")

    def add_row(self, x, y):
        if self.is_full():
            return False
        x_flattened = x.flatten()
        y_flattened = y.flatten()
        self.X[self.rows, :] = x_flattened
        self.Y[self.rows, :] = y_flattened
        self.rows += 1
        return True

    def save_to_file(self, filename):
        meta = np.array([self.rows], dtype=int)
        np.savez_compressed(os.path.join('data\\', filename), X=self.X[:self.rows, :], Y=self.Y[:self.rows, :], meta=meta)

def parse_training_set(directory, training_set, save_path):
    for filename in os.listdir(directory):
        if filename.endswith('.pgn'):
            filepath = os.path.join(directory, filename)
            if parse_games(training_set, filepath):
                training_set.save_to_file(save_path)

def parse_games(training_set, filename):
    with open(filename) as pgn:
        while True:
            game = chess.pgn.read_game(pgn)
            if game is None:
                break
            result = game.headers['Result']
            if result not in ['1-0', '0-1']:  # Skip draws
                continue
            train_player = WHITE if result == '1-0' else BLACK
            if not parse_game(training_set, game, train_player):
                return False
    return True

def parse_game(training_set, game, train_player):
    board = game.board()
    for move in game.mainline_moves():
        board_fen = board.fen()
        rotate = board.turn != train_player
        x, y = parse_turn(board_fen, move, rotate)
        if not training_set.add_row(x, y):
            return False
        board.push(move)
    return True

def parse_turn(board_fen, move, rotate):
    x = featurize_board(board_fen, rotate)
    y = outputize_move(move, rotate)
    return x, y

def featurize_board(board_fen, rotate):
    board = chess.Board(board_fen)
    features = np.zeros((6, 8, 8), dtype=np.int8)
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            plane = piece_type_to_plane(piece.piece_type)
            rank, file = divmod(square, 8)
            if rotate:
                rank = 7 - rank
                file = 7 - file
            features[plane, rank, file] = 1 if piece.color == WHITE else -1
    return features

def outputize_move(move, rotate):
    target = np.zeros((64, 64), dtype=np.int8)
    from_square = move.from_square
    to_square = move.to_square
    if rotate:
        from_square = chess.square_mirror(from_square)
        to_square = chess.square_mirror(to_square)
    target[from_square, to_square] = 1
    return target

def piece_type_to_plane(piece_type):
    if piece_type == chess.PAWN:
        return PAWN
    elif piece_type == chess.ROOK:
        return ROOK
    elif piece_type == chess.KNIGHT:
        return KNIGHT
    elif piece_type == chess.BISHOP:
        return BISHOP
    elif piece_type == chess.QUEEN:
        return QUEEN
    elif piece_type == chess.KING:
        return KING
    else:
        raise ValueError("Unknown piece type: {}".format(piece_type))