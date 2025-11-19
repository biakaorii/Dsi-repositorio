from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
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
        
        # Criar DataFrame com os dados recebidos
        input_data = pd.DataFrame([{
            'ano': float(data['ano']),
            'paginas': float(data['paginas']),
            'querem_ler': float(data['queremLer']),
            'autor': str(data['autor']),
            'editora': str(data['editora']),
            'GeneroPrimario': str(data['generoPrimario']),
            'SubGenero': str(data['subGenero'])
        }])
        
        # Aplicar one-hot encoding (mesmo processo do treinamento)
        input_encoded = pd.get_dummies(
            input_data, 
            columns=['autor', 'editora', 'GeneroPrimario', 'SubGenero'],
            drop_first=True,
            prefix=['autor', 'editora', 'genero_primario', 'subgenero']
        )
        
        # Limpar nomes das colunas (mesmo do treinamento)
        input_encoded.columns = input_encoded.columns.str.replace('[', '_', regex=False)\
            .str.replace(']', '_', regex=False)\
            .str.replace('<', '_', regex=False)\
            .str.replace('>', '_', regex=False)\
            .str.replace('"', '', regex=False)\
            .str.replace(':', '_', regex=False)\
            .str.replace(',', '_', regex=False)\
            .str.replace('{', '_', regex=False)\
            .str.replace('}', '_', regex=False)
        
        # Garantir que todas as colunas do modelo estejam presentes
        # (adicionar colunas faltantes com 0)
        model_columns = model.estimator.feature_names_in_
        for col in model_columns:
            if col not in input_encoded.columns:
                input_encoded[col] = 0
        
        # Reordenar colunas na mesma ordem do treinamento
        input_encoded = input_encoded[model_columns]
        
        # Fazer predição
        prediction = model.predict(input_encoded)[0]
        result = int(prediction)
        
        print(f"📊 Predição: {result}")
        
        return jsonify({
            'prediction': result,
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
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
