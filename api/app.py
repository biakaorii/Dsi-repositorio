from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Carregar o modelo
# Tenta carregar do diretório api/ ou do diretório pai (meuApp/utils/)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'xgb_rating_predictor.pkl')
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'meuApp', 'utils', 'xgb_rating_predictor.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Modelo carregado com sucesso!")
except Exception as e:
    print(f"❌ Erro ao carregar modelo: {e}")
    model = None

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Modelo não carregado'}), 500
        
        data = request.get_json()
        
        features = [
            float(data['ano']),
            float(data['paginas']),
            float(data['queremLer']),
            float(data['autor']),
            float(data['editora']),
            float(data['generoPrimario']),
            float(data['subGenero'])
        ]
        
        X = np.array([features])
        prediction = model.predict(X)[0]
        result = int(prediction)
        
        print(f"📊 Predição: {result}")
        
        return jsonify({
            'prediction': result,
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 400

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print("🚀 Iniciando servidor Flask...")
    print(f"📁 Procurando modelo em: {MODEL_PATH}")
    app.run(host='0.0.0.0', port=port, debug=False)
