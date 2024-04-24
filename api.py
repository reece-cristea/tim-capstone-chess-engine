from flask import Flask
from main import ChessGame
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

game = ChessGame()

@app.route('/reset')
def reset():
    game.resetGame()
    print(game.board)
    return json.dumps({ "error" : 0})

@app.route('/move/<algebraic_move>')
def move(algebraic_move):
    player_move = game.make_move(algebraic_move)
    print(player_move)
    print(game.board)
    ai_move = game.generate_model_move()
    print(ai_move)
    print(game.board) 
    return json.dumps(ai_move)

if __name__ == "__main__":
    app.run(debug=True, ssl_context="adhoc")