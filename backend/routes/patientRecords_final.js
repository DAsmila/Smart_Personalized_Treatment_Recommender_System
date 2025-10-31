const express = require("express");
const router = express.Router();
const PatientRecord = require("../models/PatientRecord");

// 🩺 GET all patient records (for doctors)
router.get("/patients", async (req, res) => {
  try {
    const records = await PatientRecord.find()
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });

    const patients = records.map((rec) => {
      const latest =
        rec.predictions && rec.predictions.length > 0
          ? rec.predictions[rec.predictions.length - 1]
          : null;

      // ✅ Probability conversion logic
      let probabilityValue = "N/A";
      if (latest?.probability !== undefined && latest?.probability !== null) {
        let prob = parseFloat(latest.probability);

        // Handle cases like 85 (already percent) or 0.85 (decimal)
        if (!isNaN(prob)) {
          if (prob > 1) prob = prob / 100;
          probabilityValue = `${(prob * 100).toFixed(2)}%`;
        }
      }

      return {
        id: rec._id,
        name: rec.userId?.name || "Unknown Patient",
        email: rec.userId?.email || "N/A",
        age: latest?.age || "N/A",
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
        updatedAt: latest?.createdAt || rec.updatedAt,
      };
    });

    res.status(200).json({ success: true, patients });
  } catch (err) {
    console.error("❌ Error fetching patient records:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch patient data" });
  }
});

// 🧩 POST - Save a new patient prediction
router.post("/patients", async (req, res) => {
  try {
    let { userId, condition, prediction, probability, recommendations, age } =
      req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId in request" });
    }

    // ✅ Normalize probability safely
    if (probability === undefined || probability === null) {
      probability = 0;
    }
    let probNum = parseFloat(probability);
    if (isNaN(probNum)) probNum = 0;
    if (probNum > 1) probNum = probNum / 100;

    // ✅ Ensure prediction is readable (Positive / Negative)
    let predLabel = prediction;
    if (prediction === 1) predLabel = "Positive";
    else if (prediction === 0) predLabel = "Negative";

    // 🔍 Find or create a record
    let record = await PatientRecord.findOne({ userId });
    if (!record) {
      record = new PatientRecord({ userId, predictions: [] });
    }

    // 🔹 Add new entry
    const newPrediction = {
      condition: condition || "Unknown",
      prediction: predLabel,
      probability: probNum,
      recommendations: recommendations || [],
      age: age || null,
      createdAt: new Date(),
    };

    record.predictions.push(newPrediction);
    await record.save();

    console.log("✅ Saved prediction:", newPrediction);

    res.status(200).json({
      success: true,
      message: "Prediction saved successfully",
      record,
    });
  } catch (err) {
    console.error("❌ Error saving patient record:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save patient data" });
  }
});

module.exports = router;
