import os
from flask import Flask, send_from_directory
from main import ChessGame
import json
from flask_cors import CORS


app = Flask(__name__, static_folder='frontend/chess/build')
CORS(app)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


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
    app.run(host='0.0.0.0', use_reloader=False, port=8000, threaded=True)