import joblib

# Change this to test each model
model = joblib.load('model_diabetes.pkl')
print("✅ Model loaded successfully")

try:
    print("Feature names:", model.feature_names_in_)
except AttributeError:
    print("❌ Model does not have feature_names_in_ attribute. It might have been trained without feature names.")
