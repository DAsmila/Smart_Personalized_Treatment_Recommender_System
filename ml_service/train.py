import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score

df = pd.read_csv('data/diabetes.csv')
X = df.drop('Outcome', axis=1)
y = df['Outcome']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipe = Pipeline([('scaler', StandardScaler()), ('clf', XGBClassifier(use_label_encoder=False, eval_metric='logloss'))])
pipe.fit(X_train, y_train)

pred = pipe.predict(X_test)
probs = pipe.predict_proba(X_test)[:,1]
print(classification_report(y_test, pred))
print('AUC:', roc_auc_score(y_test, probs))

joblib.dump(pipe, 'model_diabetes.pkl')
print('Saved model_diabetes.pkl')
