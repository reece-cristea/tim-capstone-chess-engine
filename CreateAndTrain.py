from ChessAI import create_model, save_model, load_model
from TrainChessAI import chessAiTrainer, parse_training_set
import os

user_choice = input("Do you want to 'Create' or 'Continue'? ").strip().lower()

if user_choice == 'create':
    model = create_model()
    print("Making new model.")
elif user_choice == 'continue':
    print("Using Previous model")
    directory = 'Model/'
    filename = 'my_trained_chess_ai'
    model = load_model(filename)
else:
    print("Invalid input. Please enter 'Create' or 'Continue'.")

max_rows = 10000  
trainer = chessAiTrainer(max_rows)


directory = 'Data/' 
save_path = 'processed_training_data.npz'


parse_training_set(directory, trainer, save_path)

X, Y = trainer.get()


model.fit(X, Y, epochs=5, batch_size=64, validation_split=0.1)


filename = 'my_trained_chess_ai'
save_model(model, filename)