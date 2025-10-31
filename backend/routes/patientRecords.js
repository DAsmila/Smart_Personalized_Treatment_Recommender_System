const express = require("express");
const router = express.Router();
const PatientRecord = require("../models/PatientRecord");

// --- Get all patient records (for doctor dashboard) ---
router.get("/patients", async (req, res) => {
  try {
    const records = await PatientRecord.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const patients = records.map((rec) => {
      const latest =
        Array.isArray(rec.predictions) && rec.predictions.length > 0
          ? rec.predictions[rec.predictions.length - 1]
          : null;

      // 🧩 Ensure probability is always parsed correctly
      let probabilityValue = "N/A";
      if (latest?.probability !== undefined && latest?.probability !== null) {
        const prob = Number(latest.probability);
        if (!isNaN(prob)) {
          probabilityValue = (prob * 100).toFixed(2) + "%";
        }
      }

      return {
        id: rec._id,
        name: rec.userId?.name || "Unknown Patient",
        email: rec.userId?.email || "N/A",
        age: latest?.age || rec.age || "N/A",
        condition: latest?.condition || "Diabetes", // default condition
        prediction:
          latest?.prediction === 1
            ? "Positive"
            : latest?.prediction === 0
            ? "Negative"
            : latest?.prediction || "N/A",
        probability: probabilityValue,
        recommendations: latest?.recommendations || [],
        doctorApproved: latest?.doctorApproved || false,
        doctorNotes: latest?.doctorNotes || "",
        createdAt: rec.createdAt,
        updatedAt: latest?.createdAt || rec.updatedAt || rec.createdAt,
      };
    });

    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    console.error("❌ Error fetching patient records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient records",
      error: error.message,
    });
  }
});

module.exports = router;
