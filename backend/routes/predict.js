// routes/predict.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const PatientRecord = require('../models/PatientRecord');
const auth = require('../middleware/auth');
require('dotenv').config();

router.post('/:condition', auth, async (req, res) => {
  try {
    const condition = req.params.condition.toLowerCase();
    const data = req.body.features || req.body;

    // Feature sets
    const featureSets = {
      diabetes: [
        'Pregnancies', 'Glucose', 'BloodPressure',
        'SkinThickness', 'Insulin', 'BMI',
        'DiabetesPedigreeFunction', 'Age'
      ],
      heart: ['Age', 'Cholesterol', 'BP'],
      cancer: null
    };

    // Handle /predict/all
    if (condition === "all" || condition === "disease") {
      const flaskUrl = `${process.env.ML_SERVICE_BASE_URL || "http://localhost:5000"}/predict/disease`;
      const response = await axios.post(flaskUrl, data, {
        headers: { "Content-Type": "application/json" },
      });

      const newRecord = new PatientRecord({
        userId: req.user.id,
        features: data,
        age: data.Age || null,
        predictions: [
          {
            condition: "All Diseases",
            prediction: 1,
            probability: 0.9,
            recommendations: response.data.results || [],
          },
        ],
      });
      await newRecord.save();

      return res.json({
        success: true,
        message: "Predictions for all diseases saved successfully",
        results: response.data.results || response.data,
      });
    }

    // Validate condition
    if (!featureSets.hasOwnProperty(condition)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported condition: ${condition}`,
      });
    }

    // Validate fields
    if (featureSets[condition]) {
      const missing = featureSets[condition].filter(
        (f) => data[f] === undefined || data[f] === ''
      );
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing input fields: ${missing.join(', ')}`,
        });
      }
    }

    // Prepare payload
    const payload = {};
    if (featureSets[condition]) {
      for (const feature of featureSets[condition]) {
        payload[feature] = Number(data[feature]) || 0;
      }
    } else {
      Object.assign(payload, data);
    }

    console.log(`🔹 Sending ${condition} payload to Flask:`, payload);

    // Flask URL
    const base = process.env.ML_SERVICE_BASE_URL || "http://localhost:5000";
    const flaskUrl = `${base}/predict/${condition}`;
    const response = await axios.post(flaskUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Flask Response:", response.data);

    const { prediction, probability, recommendations, consult } = response.data;

    // ✅ Save to MongoDB (now with top-level `age`)
    const newRecord = new PatientRecord({
      userId: req.user.id,
      features: payload,
      age: payload.Age || data.Age || null, // ✅ Store Age separately
      predictions: [
        {
          condition,
          prediction,
          probability: probability || 0.85,
          recommendations: recommendations || [],
          doctorApproved: false,
          doctorNotes: "",
        },
      ],
    });

    await newRecord.save();

    res.json({
      success: true,
      condition,
      prediction,
      probability: probability || 0,
      recommendations: recommendations || [],
      consult: consult || "Consult your physician.",
      message: "Prediction saved successfully.",
    });
  } catch (err) {
    console.error("❌ Error in /api/predict:", err.message);

    if (err.response) {
      console.error("Flask error response:", err.response.data);
      return res.status(500).json({
        success: false,
        message: err.response.data.error || "Flask ML service error",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error or Flask service not reachable.",
    });
  }
});

module.exports = router;
