const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Route: POST /api/predict
router.post('/predict', async (req, res) => {
  try {
    const { age, glucose, bmi, insulin, pregnancies, bloodpressure } = req.body;

    // Send data to Flask ML service
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      age,
      glucose,
      bmi,
      insulin,
      pregnancies,
      bloodpressure
    });

    // Return ML prediction to frontend
    res.json({
      success: true,
      prediction: response.data.prediction,
      treatment: response.data.treatment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error connecting to ML service" });
  }
});

module.exports = router;
