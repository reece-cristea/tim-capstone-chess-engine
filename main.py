import chess
from ChessAI import load_model
from TrainChessAI import featurize_board
import matplotlib.pyplot as plt
import numpy as np

model = load_model('my_trained_chess_ai')

def get_human_move(board):
    """
    Prompt the human player for a move in algebraic notation, validate it,
    and return the corresponding move if it's legal.
    """
    move = None
    while move is None:
        user_input = input("Enter your move in algebraic notation (e.g., e2e4): ")
        try:
            move = board.parse_san(user_input)
            if move not in board.legal_moves:
                print("That move is not legal. Please try again.")
                move = None
            else:
                print("Move accepted.")
        except ValueError:
            print("Invalid format or move. Please enter a move in algebraic notation (e.g., e2e4).")
    return move
    
def generate_model_move(model, board, stats, show_output=False):
    assert board.turn  # Must be White's turn
    input_format = featurize_board(board.fen(), rotate=False)
    # Reshape the input to match the model's expected input shape
    input_format = input_format.reshape(-1, 384)  # Assuming your model expects a flat array of 384 elements

    y = model.predict(input_format).reshape((64, 64))
    if show_output:
        plt.imshow(y, cmap='Greys')
    iterations = 0
    max_iterations = 64 * 64  # Prevent infinite loops

    while iterations < max_iterations:
        from_square, to_square = np.unravel_index(y.argmax(), y.shape)
        move = chess.Move(from_square, to_square)
        if board.piece_type_at(from_square) == chess.PAWN and chess.square_rank(to_square) == 7:
            move.promotion = chess.QUEEN  # Always promote to queen for now
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
    return None  # If no legal moves are found
    
def play_game(board, model):
    stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}
    while not board.is_game_over():
        print(board)
        if board.turn == chess.WHITE:
            move = generate_model_move(model, board, stats)
            if move and board.is_legal(move):
                board.push(move)
                stats['legal_moves'] += 1
            else:
                print(f"Illegal move generated: {move}")
                stats['illegal_moves'] += 1
                # Handle illegal move situation here (e.g., try generating another move, end the game, etc.)
        else:
            move = get_human_move(board)  # Assuming get_human_move returns a legal move
            if move and board.is_legal(move):
                board.push(move)
            else:
                print(f"Illegal human move: {move}")


class ChessGame:
    def __init__(self):
        self.board = chess.Board()
        self.stats = {'legal_moves': 0, 'illegal_moves': 0, 'en_passant_captures': 0, 'castles': 0}
        self.model = load_model('my_trained_chess_ai')

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
        return move
    
    def generate_model_move(self, show_output=False):
        assert self.board.turn  # Must be White's turn
        input_format = featurize_board(self.board.fen(), rotate=False)
        # Reshape the input to match the model's expected input shape
        input_format = input_format.reshape(-1, 384)  # Assuming your model expects a flat array of 384 elements

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
                return move
            else:
                self.stats['illegal_moves'] += 1
            y[from_square, to_square] = 0
            iterations += 1
        return None  # If no legal moves are found


if __name__ == "__main__":
    mainBoard = chess.Board()
    play_game(mainBoard, model)

'''
if __name__ == "__main__":
    mainBoard = chess.Board()
    playing = True
    while(playing):
        print(mainBoard)

        if mainBoard.is_checkmate():
            playing = False
            if mainBoard.turn == False:
                print("White has checkmate! Good game!")
            if mainBoard.turn == True:
                print("Black has checkmate! Good game!")
            continue

        moveFrom = ""
        moveTo = ""
        if mainBoard.turn == True:
           print("White's turn")
           moveFrom = input("Move From: ")
           moveTo = input("Move To: ")
        else:
           print("Black's turn")
           moveFrom = input("Move From: ")
           moveTo = input("Move To: ")
        
        move = chess.Move.from_uci(moveFrom + moveTo)
        while move not in mainBoard.legal_moves:
            print("Not a legal move. Please enter a legal move.")
            moveFrom = input("Move From: ")
            moveTo = input("Move To: ")
            move = chess.Move.from_uci(moveFrom + moveTo)
            

        mainBoard.push(move)
        print("-----------------")
'''