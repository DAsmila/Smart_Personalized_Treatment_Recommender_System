import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import PatientForm from "./components/PatientForm";
import DoctorDashboard from "./components/DoctorDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // --- If user not logged in ---
  if (!user)
    return (
      <div className="auth-container">
        <h2 className="app-title">Smart Treatment System</h2>
        <h3>Login / Signup</h3>
        <div className="auth-forms">
          <AuthForm mode="signup" onSuccess={setUser} />
          <AuthForm mode="login" onSuccess={setUser} />
        </div>
      </div>
    );

  // --- Main dashboard after login ---
  return (
    <div className="app-container">
      <h2 className="welcome-text">
        Welcome <span>{user.name}</span> ({user.role})
      </h2>

      {/* --- Doctor Dashboard --- */}
      {user.role === "doctor" && <DoctorDashboard user={user} />}

      {/* --- Patient Dashboard --- */}
      {user.role === "patient" && (
        <>
          <PatientForm
            onResult={(result) => {
              setRecord(result);
              setPrediction(result);
            }}
          />

          {/* --- Record Preview --- */}
          {record && (
            <div className="record-box">
              <h3>🗂 Record Data</h3>
              <pre>{JSON.stringify(record, null, 2)}</pre>
            </div>
          )}

          {/* --- Prediction Result --- */}
          {prediction && prediction.prediction !== undefined && (
            <div className="result-box">
              <h3>🩺 Prediction Result</h3>
              <p>
                <strong>Prediction:</strong> {prediction.prediction}
              </p>
              <p>
                <strong>Probability:</strong>{" "}
                {typeof prediction.probability === "number"
                  ? `${(prediction.probability * 100).toFixed(2)}%`
                  : "N/A"}
              </p>

              {prediction.recommendations &&
                prediction.recommendations.length > 0 && (
                  <>
                    <h4>Recommended Actions:</h4>
                    <ul>
                      {prediction.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
