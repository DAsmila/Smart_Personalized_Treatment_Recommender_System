from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
import os
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)

# --- Load Models ---
def load_object(path):
    try:
        obj = joblib.load(os.path.join(BASE_DIR, path))
        print(f"✅ Loaded: {path}")
        return obj
    except Exception as e:
        print(f"❌ Error loading {path}: {e}")
        return None


# Load models
diabetes_model = load_object("model_diabetes.pkl")
heart_model = load_object("model_heart.pkl")
cancer_model = load_object("model_cancer.pkl")

MODELS = {
    "diabetes": diabetes_model,
    "heart": heart_model,
    "cancer": cancer_model
}

# --- Feature sets ---
FEATURES = {
    "diabetes": [
        'Pregnancies', 'Glucose', 'BloodPressure',
        'SkinThickness', 'Insulin', 'BMI',
        'DiabetesPedigreeFunction', 'Age'
    ],
    "heart": ['Age', 'Cholesterol', 'BP'],
    "cancer": None
}

# --- Load or set fallback recommendations ---
kb_path = os.path.join(BASE_DIR, "data", "treatment_kb.json")
if os.path.exists(kb_path):
    with open(kb_path) as f:
        kb = json.load(f)
else:
    kb = {}
    print("⚠️ No treatment_kb.json found — using fallback recommendations.")


@app.route("/")
def home():
    return jsonify({
        "message": "🧠 ML Service Running Successfully!",
        "available_models": list(MODELS.keys())
    })


# --- Helper: Prediction ---
def make_prediction(model, features, data, condition):
    if model is None:
        return {"error": f"Model for {condition} not loaded"}

    try:
        # Auto-infer features if not provided
        if features is None and hasattr(model, "feature_names_in_"):
            features = list(model.feature_names_in_)

        # Build input DataFrame
        row = [float(data.get(f, 0)) for f in features]
        df = pd.DataFrame([row], columns=features)

        # Make prediction (0 or 1)
        pred = int(model.predict(df)[0])

        # ---- Probability Fix ----
        prob = 0.0
        if hasattr(model, "predict_proba"):
            try:
                probs = model.predict_proba(df)[0]
                print(f"🧪 {condition} raw probabilities:", probs)
                if len(probs) > 1:
                    prob = float(probs[1])  # probability of class 1
                else:
                    prob = float(probs[0])
            except Exception as e:
                print(f"⚠️ Probability fetch error for {condition}: {e}")
                prob = 0.0

        # Clamp probability safely between 0–1
        if not isinstance(prob, (int, float)) or np.isnan(prob):
            prob = 0.0
        prob = max(0.0, min(prob, 1.0))

        # Diagnosis message
        diagnosis = (
            f"⚠️ {condition.capitalize()} Detected"
            if pred == 1
            else f"✅ No {condition.capitalize()} Detected"
        )

        # Get recommendations (from KB or fallback)
        recs_data = kb.get(condition, {}).get("recommendations", [])
        if not recs_data:
            if condition == "diabetes":
                recs_data = [
                    "Maintain a balanced diet rich in vegetables and whole grains.",
                    "Exercise for at least 30 minutes daily.",
                    "Monitor blood glucose regularly.",
                    "Avoid sugary drinks and refined carbs.",
                    "Consult an endocrinologist for personalized advice."
                ]
            elif condition == "heart":
                recs_data = [
                    "Avoid smoking and excessive alcohol.",
                    "Exercise regularly to strengthen your heart.",
                    "Reduce salt intake and manage stress.",
                    "Maintain healthy cholesterol and blood pressure levels."
                ]
            elif condition == "cancer":
                recs_data = [
                    "Avoid tobacco and limit alcohol use.",
                    "Eat fruits and vegetables daily.",
                    "Exercise and maintain a healthy weight.",
                    "Go for regular screenings and check-ups."
                ]
            else:
                recs_data = ["No specific recommendations available."]

        return {
            "condition": condition,
            "prediction": "Positive" if pred == 1 else "Negative",
            "probability": round(prob, 4),  # ✅ return proper numeric value
            "diagnosis": diagnosis,
            "recommendations": recs_data
        }

    except Exception as e:
        print(f"❌ Error predicting {condition}: {e}")
        return {"error": str(e)}


# --- Predict Single Disease ---
@app.route("/predict/<condition>", methods=["POST"])
def predict(condition):
    try:
        condition = condition.lower()
        if condition not in MODELS:
            return jsonify({"success": False, "error": f"Invalid condition: {condition}"}), 400

        data = request.get_json() or {}
        print(f"📥 Received data for {condition}:", data)

        result = make_prediction(MODELS[condition], FEATURES.get(condition), data, condition)

        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 400

        print(f"📤 Response for {condition}: {result}")
        return jsonify({"success": True, **result})

    except Exception as e:
        print(f"❌ Error in /predict/{condition}: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# --- Predict All Diseases Together ---
@app.route("/predict/disease", methods=["POST"])
def predict_all():
    try:
        data = request.get_json() or {}
        print("📥 Received all-disease prediction request:", data)

        results = {}
        for condition, model in MODELS.items():
            results[condition] = make_prediction(model, FEATURES.get(condition), data, condition)

        return jsonify({"success": True, "results": results})

    except Exception as e:
        print("❌ Error in /predict/disease:", e)
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
