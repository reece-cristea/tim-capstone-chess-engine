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
    INPUTS = 491
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
        directory = os.path.join('data')
        if not os.path.exists(directory):
            os.makedirs(directory)
        meta = np.array([self.rows], dtype=int)
        np.savez_compressed(os.path.join(directory, filename), X=self.X[:self.rows, :], Y=self.Y[:self.rows, :], meta=meta)

def parse_training_set(directory, training_set, save_path):
    directory = "Data/"
    all_games_parsed = True

    for filename in os.listdir(directory):
        if filename.endswith('.pgn'):
            filepath = os.path.join(directory, filename)
            print(f"Processing file: {filename}")
            if not parse_games(training_set, filepath):
                all_games_parsed = False
                print(f"Failed to fully process {filename}")
                break
            
    if all_games_parsed:
        training_set.save_to_file(save_path)
        print("All training data processed and saved.")
    else:
        print("Training data may be incomplete due to errors.")        
                

def parse_games(training_set, filename):
    with open(filename, 'r', encoding='utf-8') as pgn:
        while True:
            game = chess.pgn.read_game(pgn)
            if game is None:
                break

            # Adding a filter for high Elo ratings if available
            '''
            white_elo = int(game.headers.get('WhiteElo', '0'))  # Default to 0 if not available
            black_elo = int(game.headers.get('BlackElo', '0'))  # Default to 0 if not available

            # Skip the game if either player's Elo is below 2200
            if white_elo < 2200 or black_elo < 2200:
                continue
            ''' 
            result = game.headers['Result']
            if result not in ['1-0', '0-1']:  # Continue skipping draws for now
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

def control_of_center(board):
    center_squares = [chess.D4, chess.E4, chess.D5, chess.E5]
    control_features = np.zeros(2)  # One for each color
    for square in center_squares:
        attackers_white = len(board.attackers(chess.WHITE, square))
        attackers_black = len(board.attackers(chess.BLACK, square))
        control_features[0] += attackers_white
        control_features[1] += attackers_black
    return control_features

def count_pawns(board, color):
    return len(board.pieces(chess.PAWN, color))

def evaluate_pawn_structure(board):
    features = {
        'white_passed': 0,
        'black_passed': 0,
        'white_doubled': 0,
        'black_doubled': 0,
        'white_isolated': 0,
        'black_isolated': 0,
    }
    
    for color in [chess.WHITE, chess.BLACK]:
        all_pawns = list(board.pieces(chess.PAWN, color))
        file_counts = [0] * 8 
        
        for square in all_pawns:
            file = chess.square_file(square)
            file_counts[file] += 1
        
        for square in all_pawns:
            file = chess.square_file(square)
            rank = chess.square_rank(square)
            
            passed = True
            for enemy_rank in range(rank + 1, 8) if color == chess.WHITE else range(0, rank):
                if board.piece_at(chess.square(file, enemy_rank)) and board.piece_at(chess.square(file, enemy_rank)).color != color:
                    passed = False
                    break
            if passed:
                features[f'{"white" if color == chess.WHITE else "black"}_passed'] += 1
                
            isolated = True
            for adj_file in [file - 1, file + 1]:
                if 0 <= adj_file < 8 and file_counts[adj_file] > 0:
                    isolated = False
                    break
            if isolated:
                features[f'{"white" if color == chess.WHITE else "black"}_isolated'] += 1

        features[f'{"white" if color == chess.WHITE else "black"}_doubled'] = sum(count > 1 for count in file_counts)
    pawn_structure_features = np.array(list(features.values()))
    return pawn_structure_features

def calculate_piece_mobility(board):
    mobility = {
        'white_pawn': 0, 'black_pawn': 0,
        'white_knight': 0, 'black_knight': 0,
        'white_bishop': 0, 'black_bishop': 0,
        'white_rook': 0, 'black_rook': 0,
        'white_queen': 0, 'black_queen': 0,
        'white_king': 0, 'black_king': 0,
    }

    for piece_type in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN, chess.KING]:
        for color in [chess.WHITE, chess.BLACK]:

            pieces = board.pieces(piece_type, color)
            for square in pieces:

                legal_moves = board.generate_legal_moves(from_mask=chess.BB_SQUARES[square])

                color_prefix = 'white' if color == chess.WHITE else 'black'
                piece_name = {
                    chess.PAWN: 'pawn', chess.KNIGHT: 'knight', chess.BISHOP: 'bishop',
                    chess.ROOK: 'rook', chess.QUEEN: 'queen', chess.KING: 'king'
                }[piece_type]
                mobility[f'{color_prefix}_{piece_name}'] += len(list(legal_moves))
    mobility_features = np.array(list(mobility.values()))
    return mobility_features

def evaluate_king_safety(board):
    safety_scores = {
        'white_king_safety': 0,
        'black_king_safety': 0,
    }

    for color in [chess.WHITE, chess.BLACK]:
        king_square = board.king(color)
        king_vicinity = [king_square + i for i in [-9, -8, -7, -1, 1, 7, 8, 9] if chess.square_rank(king_square + i) <= 7 and chess.square_rank(king_square + i) >= 0 and chess.square_file(king_square + i) <= 7 and chess.square_file(king_square + i) >= 0]


        pawn_shield = 0
        attacks = 0


        for square in king_vicinity:
            piece = board.piece_at(square)
            if piece and piece.piece_type == chess.PAWN and piece.color == color:
                pawn_shield += 1

  
        enemy_color = chess.WHITE if color == chess.BLACK else chess.BLACK
        for square in king_vicinity:
            if board.is_attacked_by(enemy_color, square):
                attacks += 1


        safety_score = pawn_shield - attacks
        color_key = 'white_king_safety' if color == chess.WHITE else 'black_king_safety'
        safety_scores[color_key] = safety_score
    king_safety_features = np.array(list(safety_scores.values()))
    return king_safety_features

def evaluate_captures(board):

    captures = {
        'white_pawn': 0, 'black_pawn': 0,
        'white_knight': 0, 'black_knight': 0,
        'white_bishop': 0, 'black_bishop': 0,
        'white_rook': 0, 'black_rook': 0,
        'white_queen': 0, 'black_queen': 0,
        'white_king': 0, 'black_king': 0,
    }

    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:

            legal_moves = board.generate_legal_moves(from_mask=chess.BB_SQUARES[square])
            for move in legal_moves:
                if board.is_capture(move):

                    color_prefix = 'white' if piece.color == chess.WHITE else 'black'
                    piece_name = {
                        chess.PAWN: 'pawn', chess.KNIGHT: 'knight', chess.BISHOP: 'bishop',
                        chess.ROOK: 'rook', chess.QUEEN: 'queen', chess.KING: 'king'
                    }[piece.piece_type]
                    captures[f'{color_prefix}_{piece_name}'] += 1


    capture_features = np.array(list(captures.values()), dtype=np.int8)

    return capture_features

def evaluate_check(board):
    check_features = np.zeros(2, dtype=np.int8)  


    if board.is_check() and board.turn == chess.BLACK:
        check_features[0] = 1  

    if board.is_check() and board.turn == chess.WHITE:
        check_features[1] = 1  

    return check_features

def material_advantage(board):
    
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9
    }
    

    white_material = 0
    black_material = 0
    
    for piece in board.piece_map().values():
        if piece.piece_type != chess.KING: 
            value = piece_values[piece.piece_type]
            if piece.color == chess.WHITE:
                white_material += value
            else:
                black_material += value
                

    return white_material - black_material

def piece_coordination(board):
    coordination_score = 0
    
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and piece.color == board.turn:
            defenders = board.attackers(board.turn, square)
            coordination_score += len(defenders)

            if square in [chess.D4, chess.E4, chess.D5, chess.E5]:
                coordination_score += 2 * len(defenders)
    
    opponent_king_square = board.king(not board.turn)
    if opponent_king_square is not None:
        opponent_king_adjacent_squares = [
            opponent_king_square + offset for offset in [-9, -8, -7, -1, 1, 7, 8, 9]
            if 0 <= opponent_king_square + offset < 64
            and abs(chess.square_file(opponent_king_square) - chess.square_file(opponent_king_square + offset)) <= 1
        ]
        
        for square in opponent_king_adjacent_squares:
            if square and board.is_attacked_by(board.turn, square):
                coordination_score += 3

    return coordination_score

def evaluate_potential_checkmate_moves(board):
    checkmate_potential_scores = []
    legal_moves = list(board.legal_moves)
    for move in legal_moves:
        board.push(move)

        score = 0
        if board.is_checkmate():
            # Assign an extremely high score to moves that lead to checkmate.
            score += 10000
        else:
            # Continue to evaluate moves using the comprehensive metrics already developed.
            score += material_advantage(board)
            score += np.sum(evaluate_king_safety(board))
            score += np.sum(control_of_center(board))
            score += piece_coordination(board)
            # Optionally include other metrics here as well.
        
        checkmate_potential_scores.append((score, move))
        
        board.pop()

    # Sort moves by their score to prioritize those with higher scores, especially checkmates.
    checkmate_potential_scores.sort(reverse=True, key=lambda x: x[0])

    return checkmate_potential_scores

def evaluate_potential_checkmate_moves_as_feature(board):
    checkmate_potential_scores = evaluate_potential_checkmate_moves(board)
    if checkmate_potential_scores:
        # If there are scores, take the highest one.
        top_score = checkmate_potential_scores[0][0]
    else:
        # If there are no moves, you might want to use a default value, e.g., 0.
        top_score = 0
    return np.array([top_score], dtype=np.float32)

def evaluate_castling_rights(board):
    castling_rights = np.zeros(4, dtype=np.int8)  
    
    castling_rights[0] = 1 if board.has_castling_rights(chess.WHITE) and board.has_kingside_castling_rights(chess.WHITE) else 0
    castling_rights[1] = 1 if board.has_castling_rights(chess.WHITE) and board.has_queenside_castling_rights(chess.WHITE) else 0
    castling_rights[2] = 1 if board.has_castling_rights(chess.BLACK) and board.has_kingside_castling_rights(chess.BLACK) else 0
    castling_rights[3] = 1 if board.has_castling_rights(chess.BLACK) and board.has_queenside_castling_rights(chess.BLACK) else 0

    return castling_rights

def encode_en_passant(board):
    en_passant_features = np.zeros(64, dtype=np.int8)

    ep_square = board.ep_square
    if ep_square is not None:
        en_passant_features[ep_square] = 1

    return en_passant_features

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
            features[plane, rank, file] = 1 if piece.color == chess.WHITE else -1
    features = features.flatten()

    # Calculate additional features
    mobility_features = calculate_piece_mobility(board)
    king_safety_features = evaluate_king_safety(board)
    center_control_features = control_of_center(board)
    pawn_structure_features = evaluate_pawn_structure(board)
    capture_features = evaluate_captures(board)
    check_features = evaluate_check(board)
    material_advantage_features = np.array([material_advantage(board)], dtype=np.int8)
    piece_coordination_features = np.array([piece_coordination(board)], dtype=np.int8)
    castling_rights_features = evaluate_castling_rights(board)
    en_passant_features = encode_en_passant(board).flatten()  # Ensuring it's a 1D array
    checkmate_features = evaluate_potential_checkmate_moves_as_feature(board)


    # Concatenate all feature arrays into a single 1D array
    extended_features = np.concatenate([
        features,  
        mobility_features, 
        king_safety_features, 
        center_control_features, 
        pawn_structure_features,
        capture_features,
        check_features,
        material_advantage_features,
        piece_coordination_features,
        castling_rights_features,
        en_passant_features,
        checkmate_features
    ])

    return extended_features

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