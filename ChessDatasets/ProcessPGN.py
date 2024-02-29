import chess
import chess.pgn

def convertToCustomFormat(board):
    pieces = {'r': 'r', 'n': 'n', 'b': 'b', 'q': 'q', 'k': 'k', 'p': 'p',
              'R': 'R', 'N': 'N', 'B': 'B', 'Q': 'Q', 'K': 'K', 'P': 'P', '.': '.'}
    rows = []
    for rank in reversed(range(8)):
        row = ' '.join(pieces.get((board.piece_at(chess.square(file, rank)).symbol() if board.piece_at(chess.square(file, rank)) else '.'), '.') for file in range(8))
        rows.append(row)
    return '\n'.join(rows)

def main():
    with open('ChessDataset.pgn') as pgn, open('ConvertedChessDataset.txt', 'w') as output_file:
        game_num = 1
        while True:
            game = chess.pgn.read_game(pgn)
            if game is None:
                break

            output_file.write(f"Game {game_num}:")
            board = game.board()
            for move_num, move in enumerate(game.mainline_moves(), start=1):
                board.push(move)
                output_file.write(f"\nPosition after move {move_num} ({'white' if move_num % 2 != 0 else 'black'}):")
                output_file.write(convertToCustomFormat(board))
                output_file.write("\n" + "-"*30)

            output_file.write("\n" + "="*30 + "\n")  # Separator between games
            game_num += 1

if __name__ == "__main__":
    main()            