import chess
from ChessAI import load_model
from TrainChessAI import featurize_board
import matplotlib.pyplot as plt
import numpy as np

class ChessGame:
    def __init__(self):
        self.board = chess.Board()
        self.stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}
        self.model = load_model('my_trained_chess_ai')
        
    def resetGame(self):
        self.board = chess.Board()
        return

    def make_move(self, algebraic_move):
        """
        Prompt the human player for a move in algebraic notation, validate it,
        and return the corresponding move if it's legal.
        """
        move = None
        try:
            move = self.board.parse_san(algebraic_move)
            if move not in self.board.legal_moves:
                print("That move is not legal. Please try again.")
                move = None
            else:
                print("Move accepted.")
        except ValueError:
            print("Invalid format or move. Please enter a move in algebraic notation (e.g., e2e4).")
        self.board.push(move)
        return move
    
    def generate_model_move(self, show_output=False):
        assert not self.board.turn  # Must be White's turn
        input_format = featurize_board(self.board.fen(), rotate=False)
        # Reshape the input to match the model's expected input shape
        input_format = input_format.reshape(-1, 491)  # Assuming your model expects a flat array of 384 elements

        y = self.model.predict(input_format).reshape((64, 64))
        if show_output:
            plt.imshow(y, cmap='Greys')
        iterations = 0
        max_iterations = 64 * 64  # Prevent infinite loops

        while iterations < max_iterations:
            from_square, to_square = np.unravel_index(y.argmax(), y.shape)
            move = chess.Move(from_square, to_square)
            if self.board.piece_type_at(from_square) == chess.PAWN and chess.square_rank(to_square) == 7:
                move.promotion = chess.QUEEN  # Always promote to queen for now
            if self.board.is_legal(move):
                self.stats['legal_moves'] += 1
                if self.board.is_en_passant(move):
                    self.stats['en_passant_captures'] += 1
                if self.board.is_castling(move):
                    self.stats['castles'] += 1
                self.board.push(move)
                return move.uci()
            else:
                self.stats['illegal_moves'] += 1
            y[from_square, to_square] = 0
            iterations += 1
        return None  # If no legal moves are found
