require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connection active");
});

// ✅ Import Routes
const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const patientRoutes = require("./routes/patient");
const doctorRoutes = require("./routes/doctor");
const fixedPatientRecords = require("./routes/fixedPatientRecords"); // ✅ the fixed one

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);

// ✅ Use only the FIXED version for patient records
app.use("/api/patient-records", fixedPatientRecords);

// ✅ Root health check
app.get("/", (req, res) => {
  res.send("🚀 Smart Treatment System API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
