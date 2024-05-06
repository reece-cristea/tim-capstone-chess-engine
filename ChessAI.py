import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation

def create_model():
    coreFeatures = 8 * 8 *6
    bbFeatures = 13
    completeFeatures = coreFeatures + bbFeatures
    model = Sequential()
    # Input layer
    model.add(Dense(3000, input_shape=(491,), activation='relu')) 
    # Hidden Layers
    model.add(Dense(3000, activation='relu'))
    model.add(Dense(3000, activation='relu'))
    model.add(Dense(3000, activation='relu'))
    # Output Layer
    model.add(Dense(4096, activation='softmax'))

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy']) # Could also use Adadelta if adam doesnt work too well
    return model

def save_model(model, filename):
    base_path = "Model/"  
    # Save the model architecture to a JSON file
    model_json = model.to_json()
    if filename.endswith('.json'):
        json_filename = base_path + filename  # Prepend the path to the filename
        h5_filename = base_path + filename[:-5] + '.h5'
    else:
        json_filename = base_path + filename + '.json'
        h5_filename = base_path + filename + '.h5'
    
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
    base_path = "Model/"
    if filename.endswith('.json'):
        json_filename = base_path + filename  
        h5_filename = base_path + filename[:-5] + '.h5'
    else:
        json_filename = base_path + filename + '.json'
        h5_filename = base_path + filename + '.h5'

    json_filename = json_filename.replace('\\', '/')
    h5_filename = h5_filename.replace('\\', '/')
    with open(json_filename, 'r') as json_file:
        model_json = json_file.read()
        
    model = keras.models.model_from_json(model_json)
    model.load_weights(h5_filename)
    compile_model(model)
    
    return model
    