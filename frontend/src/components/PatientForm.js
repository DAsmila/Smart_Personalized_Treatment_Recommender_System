import React, { useState } from "react";

export default function PatientForm({ onResult }) {
  const [f, setF] = useState({
    Pregnancies: 0,
    Glucose: 120,
    BloodPressure: 70,
    SkinThickness: 20,
    Insulin: 79,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.5,
    Age: 30,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);

  const handleChange = (e) => setF({ ...f, [e.target.name]: Number(e.target.value) });

  const submit = async () => {
    setLoading(true);
    setPrediction(null);

    try {
      // ✅ Change this URL to match your actual Flask port
      const response = await fetch("http://127.0.0.1:5000/predict/diabetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Flask response:", data);

      if (data && data.prediction !== undefined) {
        const diagnosis =
          data.prediction === 1 ? "🩺 Diabetes Detected" : "✅ No Diabetes Detected";

        alert(`${diagnosis}\nProbability: ${(data.probability * 100).toFixed(2)}%`);

        setPrediction(diagnosis);
        setProbability(data.probability);
        onResult && onResult(data);
      } else {
        alert("⚠️ No prediction returned from backend.");
      }
    } catch (err) {
      console.error("❌ Connection or response error:", err);
      alert("Error connecting to backend or ML service. Check Flask terminal for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-form">
      <h3>Diabetes Prediction Form</h3>

      <div className="form-grid">
        {Object.keys(f).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <input
              name={key}
              value={f[key]}
              onChange={handleChange}
              type="number"
              step="any"
            />
          </div>
        ))}
      </div>

      <button onClick={submit} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {prediction && (
        <div className="prediction-result">
          <h4>Prediction Result:</h4>
          <p>
            {prediction} <br />
            Probability: {(probability * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}                             PatientForm.js