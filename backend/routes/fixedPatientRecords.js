// routes/fixedPatientRecords.js
const express = require("express");
const router = express.Router();
const PatientRecord = require("../models/PatientRecord");

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

      // ✅ Safe probability
      let probabilityValue = "N/A";
      if (latest?.probability !== undefined && latest?.probability !== null) {
        const prob = parseFloat(latest.probability);
        if (!isNaN(prob)) {
          probabilityValue = prob <= 1 ? prob * 100 : prob;
        }
      }

      // ✅ Safe age handling (backend or inside prediction)
      const ageValue =
        latest?.age || rec.age || rec.userId?.age || "N/A";

      return {
        id: rec._id,
        name: rec.userId?.name || "Unknown Patient",
        email: rec.userId?.email || "N/A",
        age: ageValue,
        condition: latest?.condition || "Unknown",
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

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
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
