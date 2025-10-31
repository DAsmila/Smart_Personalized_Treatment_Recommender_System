// routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const PatientRecord = require("../models/PatientRecord");

// --- Get all patient records (for doctors) ---
router.get("/patients", async (req, res) => {
  try {
    const records = await PatientRecord.find()
      .populate("userId", "name email") // fetch patient name & email from User collection
      .sort({ createdAt: -1 });

    // Format each record with latest prediction
    const patients = records.map((rec) => {
      const latest = rec.predictions?.[rec.predictions.length - 1];

      return {
        id: rec._id,
        name: rec.userId?.name || "Unknown Patient",
        email: rec.userId?.email || "N/A",
        condition: latest?.condition || "Unknown",
        prediction:
          latest?.prediction === 1
            ? "Positive"
            : latest?.prediction === 0
            ? "Negative"
            : "N/A",
        probability:
          typeof latest?.probability === "number"
            ? `${(latest.probability * 100).toFixed(2)}%`
            : "N/A",
        recommendations: latest?.recommendations || [],
        doctorApproved: latest?.doctorApproved || false,
        doctorNotes: latest?.doctorNotes || "",
        updatedAt: latest?.createdAt || rec.createdAt,
      };
    });

    res.json({ success: true, patients });
  } catch (error) {
    console.error("❌ Error fetching patients:", error);
    res.status(500).json({ success: false, error: "Failed to fetch patients" });
  }
});

module.exports = router;
