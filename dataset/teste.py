import pandas as pd

df = pd.read_csv('dados.csv')

print(df['genero'].unique())
print(df.describe())