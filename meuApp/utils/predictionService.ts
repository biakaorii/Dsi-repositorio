// Serviço de previsão de popularidade
// Como React Native não suporta nativamente arquivos .pkl do Python,
// vamos implementar uma solução alternativa usando uma API ou lógica baseada em regras

interface BookData {
  ano: number;
  paginas: number;
  queremLer: number;
  autor: string;
  editora: string;
  generoPrimario: string;
  subGenero: string;
}

// Função para fazer a previsão
// NOTA: Esta é uma implementação placeholder. 
// Para usar o modelo .pkl real, você precisa:
// 1. Criar uma API backend em Python (Flask/FastAPI) que carregue o modelo
// 2. Fazer uma requisição HTTP para essa API
// 3. Ou usar TensorFlow.js se converter o modelo para esse formato

export const predictPopularity = async (data: BookData): Promise<0 | 1> => {
  try {
    // CONFIGURAÇÃO DA API:
    // 1. Google Colab (Recomendado): Cole a URL do ngrok aqui
    //    Exemplo: 'https://abc123.ngrok-free.app/api/predict'
    // 2. Local Android Emulator: 'http://10.0.2.2:5000/api/predict'
    // 3. Local iOS/Web: 'http://localhost:5000/api/predict'
    
    // TODO: Substitua pela URL gerada no Colab
    const API_URL = '';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido na predição');
    }
    
    return result.prediction as 0 | 1;
  } catch (error) {
    console.error('Erro ao fazer previsão:', error);
    throw new Error('Não foi possível conectar à API. Certifique-se de que o servidor está rodando.');
  }
};

// Função auxiliar para cálculo simples (remover quando integrar com modelo real)
const calculateSimpleScore = (data: BookData): number => {
  let score = 0;

  // Ano mais recente = mais popular
  if (data.ano >= 2020) score += 0.2;
  else if (data.ano >= 2015) score += 0.15;
  else if (data.ano >= 2010) score += 0.1;

  // Número de pessoas que querem ler
  if (data.queremLer > 1000) score += 0.3;
  else if (data.queremLer > 500) score += 0.2;
  else if (data.queremLer > 100) score += 0.1;

  // Páginas (faixa ideal)
  if (data.paginas >= 200 && data.paginas <= 400) score += 0.2;
  else if (data.paginas >= 150 && data.paginas <= 500) score += 0.15;
  else score += 0.1;

  // Gêneros populares
  const popularGenres = ['fantasia', 'romance', 'ficção', 'suspense', 'terror'];
  if (popularGenres.some(g => data.generoPrimario.toLowerCase().includes(g))) {
    score += 0.15;
  }

  // Editoras conhecidas (exemplo)
  const knownPublishers = ['rocco', 'companhia das letras', 'intrinseca', 'record', 'darkside'];
  if (knownPublishers.some(e => data.editora.toLowerCase().includes(e))) {
    score += 0.15;
  }

  return Math.min(score, 1); // Máximo 1
};

// Para integração real com o modelo Python, crie uma API:
/*
# exemplo_api.py (Flask)
from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Carregar o modelo
with open('xgb_rating_predictor.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Preparar os dados no formato que o modelo espera
    features = pd.DataFrame([{
        'ano': data['ano'],
        'paginas': data['paginas'],
        'querem_ler': data['queremLer'],
        'autor': data['autor'],
        'editora': data['editora'],
        'GeneroPrimario': data['generoPrimario'],
        'SubGenero': data['subGenero']
    }])
    
    # Fazer a previsão
    prediction = model.predict(features)[0]
    
    return jsonify({'prediction': int(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
*/
