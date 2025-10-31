# train_models.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib

# --- 1️⃣ Diabetes Model ---
print("Training Diabetes Model...")
data = pd.DataFrame({
    'Pregnancies': [1, 2, 0, 5, 3, 4, 1, 0, 2, 6],
    'Glucose': [120, 150, 90, 200, 180, 160, 100, 85, 140, 190],
    'BloodPressure': [70, 80, 65, 90, 85, 88, 72, 60, 75, 95],
    'SkinThickness': [20, 35, 18, 45, 30, 25, 22, 15, 28, 40],
    'Insulin': [79, 130, 60, 200, 150, 110, 85, 70, 120, 180],
    'BMI': [25.6, 30.1, 22.4, 35.5, 29.0, 31.2, 24.0, 21.5, 27.5, 33.8],
    'DiabetesPedigreeFunction': [0.5, 0.7, 0.3, 1.2, 0.9, 0.8, 0.4, 0.2, 0.6, 1.0],
    'Age': [30, 45, 25, 60, 50, 55, 28, 22, 40, 65],
    'Outcome': [0, 1, 0, 1, 1, 1, 0, 0, 1, 1]
})
X = data.drop(columns=['Outcome'])
y = data['Outcome']
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
model_diabetes = LogisticRegression()
model_diabetes.fit(X_scaled, y)
joblib.dump(model_diabetes, 'model_diabetes.pkl')
print("✅ Saved model_diabetes.pkl")

# --- 2️⃣ Heart Disease Model ---
print("Training Heart Model...")
heart_data = pd.DataFrame({
    'Age': [40, 55, 65, 50, 35, 60, 45, 70, 58, 48],
    'Cholesterol': [240, 300, 280, 220, 190, 310, 250, 320, 270, 210],
    'BloodPressure': [130, 140, 150, 120, 110, 160, 135, 155, 145, 125],
    'MaxHeartRate': [150, 130, 120, 160, 170, 110, 140, 100, 115, 155],
    'Oldpeak': [1.0, 2.5, 3.0, 0.8, 0.5, 3.2, 1.5, 2.8, 2.2, 1.0],
    'Outcome': [0, 1, 1, 0, 0, 1, 0, 1, 1, 0]
})
Xh = heart_data.drop(columns=['Outcome'])
yh = heart_data['Outcome']
scaler_h = StandardScaler()
Xh_scaled = scaler_h.fit_transform(Xh)
model_heart = LogisticRegression()
model_heart.fit(Xh_scaled, yh)
joblib.dump(model_heart, 'model_heart.pkl')
print("✅ Saved model_heart.pkl")

# --- 3️⃣ Cancer Model ---
print("Training Cancer Model...")
cancer_data = pd.DataFrame({
    'RadiusMean': [14, 20, 10, 18, 12, 16, 15, 22, 17, 11],
    'TextureMean': [17, 25, 13, 21, 15, 19, 18, 27, 20, 14],
    'PerimeterMean': [90, 130, 70, 110, 80, 100, 95, 140, 105, 75],
    'AreaMean': [600, 1200, 400, 1000, 500, 800, 700, 1300, 900, 450],
    'SmoothnessMean': [0.1, 0.12, 0.09, 0.11, 0.08, 0.1, 0.095, 0.13, 0.11, 0.085],
    'Outcome': [0, 1, 0, 1, 0, 1, 0, 1, 1, 0]
})
Xc = cancer_data.drop(columns=['Outcome'])
yc = cancer_data['Outcome']
scaler_c = StandardScaler()
Xc_scaled = scaler_c.fit_transform(Xc)
model_cancer = LogisticRegression()
model_cancer.fit(Xc_scaled, yc)
joblib.dump(model_cancer, 'model_cancer.pkl')
print("✅ Saved model_cancer.pkl")

print("\n🎯 All models trained and saved successfully!")
