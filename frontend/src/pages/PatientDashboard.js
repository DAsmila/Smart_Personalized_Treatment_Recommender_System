import React, { useState } from "react";

function PatientDashboard() {
  const [form, setForm] = useState({
    age: "",
    glucose: "",
    bmi: "",
    insulin: "",
    pregnancies: "",
    bloodpressure: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    const { age, glucose, bmi, insulin, pregnancies, bloodpressure } = form;
    if (!age || !glucose || !bmi || !insulin || !pregnancies || !bloodpressure) {
      alert("⚠️ Please fill all fields before predicting.");
      return;
    }

    const payload = {
      age: Number(age),
      glucose: Number(glucose),
      bmi: Number(bmi),
      insulin: Number(insulin),
      pregnancies: Number(pregnancies),
      bloodpressure: Number(bloodpressure),
    };

    console.log("🔹 Sending to backend:", payload);

    try {
      const response = await fetch("http://localhost:4000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("✅ Got response:", data);

      if (data.success) setResult(data);
      else setResult({ error: data.message });
    } catch (err) {
      console.error("❌ Predict request failed:", err);
      setResult({ error: "Prediction failed. Check backend console." });
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>Welcome (patient)</h2>
      <div>
        <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />
        <input name="glucose" value={form.glucose} onChange={handleChange} placeholder="Glucose" />
        <input name="bmi" value={form.bmi} onChange={handleChange} placeholder="BMI" />
        <input name="insulin" value={form.insulin} onChange={handleChange} placeholder="Insulin" />
        <input name="pregnancies" value={form.pregnancies} onChange={handleChange} placeholder="Pregnancies" />
        <input name="bloodpressure" value={form.bloodpressure} onChange={handleChange} placeholder="Blood Pressure" />
        <button onClick={handlePredict}>Predict</button>
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <p><strong>Prediction:</strong> {result.prediction === 1 ? "Positive" : "Negative"}</p>
              <p><strong>Probability:</strong> {(result.probability * 100).toFixed(2)}%</p>
              <h4>Recommendations:</h4>
              <ul>
                {result.recommendations?.map((r, i) => (
                  <li key={i}>{r.title}: {r.details}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
