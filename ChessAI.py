# https://towardsdatascience.com/train-your-own-chess-ai-66b9ca8d71e4
import keras
from keras.models import Sequential
from keras.layers import Dense, Activation

def create_model():
    input_shape = (6*8*8,)
    model = Sequential()
    # Input layer
    model.add(Dense(3000, input_shape=input_shape, activation='relu')) 
    # Hidden Layers
    model.add(Dense(3000, activation='relu'))
    model.add(Dense(3000, activation='relu'))
    model.add(Dense(3000, activation='relu'))
    # Output Layer
    model.add(Dense(4096, activation='softmax'))

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy']) # Could also use Adadelta if adam doesnt work too well
    return model

def save_model(model, filename):
    # Save the model architecture to a JSON file
    model_json = model.to_json()
    if filename.endswith('.json'):
        json_filename = filename
        h5_filename = filename[:-5] + '.h5'
    else:
        json_filename = filename + '.json'
        h5_filename = filename + '.h5'
    
    # Ensure the filename uses the correct file separators for the OS
    json_filename = json_filename.replace('\\', '/')
    h5_filename = h5_filename.replace('\\', '/')
    
    # Write the JSON data to the file
    with open(json_filename, 'w') as json_file:
        json_file.write(model_json)
    
    # Save the weights to an H5 file
    model.save_weights(h5_filename)
    
    print(f"Model architecture saved to {json_filename}")
    print(f"Model weights saved to {h5_filename}")

def compile_model(model):
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

## Need load model def?
def load_model(filename):
    if filename.endswith('.json'):
        json_filename = filename
        h5_filename = filename[:-5] + '.h5'
    else: # assume local filename root only
        json_filename = 'model/' + filename + '.json'
        h5_filename = 'model/' + filename + '.h5'
    json_filename.replace('\\', '/')
    h5_filename.replace('\\', '/')
    with open(json_filename, 'r') as json_file:
        model_json = json_file.read()
        json_file.close()
    model = keras.models.model_from_json(model_json)
    model.load_weights(h5_filename)
    compile_model(model)
    return model
    