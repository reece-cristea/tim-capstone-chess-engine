from ChessAI import create_model, save_model, load_model
from TrainChessAI import chessAiTrainer, parse_training_set
import os

model = create_model()

max_rows = 10000  
trainer = chessAiTrainer(max_rows)


directory = '.' 
save_path = 'processed_training_data.npz'

parse_training_set(directory, trainer, save_path)

X, Y = trainer.get()

model.fit(X, Y, epochs=10, batch_size=64, validation_split=0.1)

filename = 'my_trained_chess_ai'
save_model(model, filename)