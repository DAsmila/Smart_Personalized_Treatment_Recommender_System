const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  prediction: { type: Number, required: true },
  probability: { type: Number, required: true },
  recommendations: [{ type: String }],
  doctorApproved: { type: Boolean, default: false },
  doctorNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const patientRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    features: {
      type: Object,
      required: true,
    },
    predictions: [predictionSchema],

    // ✅ Added this field
    age: {
      type: Number,
      default: null,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
