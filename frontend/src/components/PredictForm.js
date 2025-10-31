import React, { useState } from "react";

const PredictForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔹 Sending data:", form);

    try {
      const res = await fetch("http://localhost:4000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("✅ Response:", data);
      setResult(data);
    } catch (err) {
      console.error("❌ Error calling backend:", err);
      alert("Error connecting to backend");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Diabetes Prediction</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(form).map((key) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            <label>
              {key.charAt(0).toUpperCase() + key.slice(1)}:
              <input
                type="number"
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        ))}
        <button type="submit">Predict</button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#eaf7ea",
            border: "1px solid #a4d4a4",
            borderRadius: "8px",
          }}
        >
          <strong>Prediction:</strong> {result.prediction} <br />
          <strong>Probability:</strong>{" "}
          {(result.probability * 100).toFixed(2)}% <br />
          <strong>Recommendations:</strong>
          <ul>
            {result.recommendations &&
              result.recommendations.map((r, i) => (
                <li key={i}>
                  {r.title}: {r.details}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictForm;
