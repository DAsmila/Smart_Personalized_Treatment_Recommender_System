import React, { useEffect, useState } from "react";

const DoctorDashboard = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch patient data
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/patient-records/patients");
      const data = await res.json();

      if (data.patients) {
        console.log("📦 Received patients from backend:", data.patients);
        setPatients(data.patients);
      } else {
        console.warn("⚠️ Unexpected response:", data);
        setPatients([]);
      }
    } catch (err) {
      console.error("❌ Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch initially + auto-refresh every 10s
  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Function to safely format probability
  const formatProbability = (prob) => {
    if (prob === undefined || prob === null) return "N/A";

    let num = parseFloat(
      typeof prob === "string" ? prob.replace("%", "").trim() : prob
    );

    if (isNaN(num)) return "N/A";

    // If the backend sends 0.87 → convert to 87%
    if (num <= 1) num *= 100;

    return `${num.toFixed(2)}%`;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h2>👨‍⚕️ Welcome {user?.name || "Doctor"}</h2>
      <hr />

      <h3 style={{ marginTop: "20px" }}>🧬 Patient Information</h3>

      {loading ? (
        <p>Loading patient details...</p>
      ) : patients.length === 0 ? (
        <p>No patient records found.</p>
      ) : (
        <div style={{ marginTop: "15px" }}>
          {patients.map((p, index) => (
            <div
              key={index}
              style={{
                background: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h4>👤 {p.name || "Unknown Patient"}</h4>
              <p><strong>Age:</strong> {p.age || "N/A"}</p>
              <p><strong>Condition:</strong> {p.condition || "Not diagnosed"}</p>
              <p><strong>Prediction:</strong> {p.prediction || "N/A"}</p>
              <p><strong>Probability:</strong> {formatProbability(p.probability)}</p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {p.updatedAt
                  ? new Date(p.updatedAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
