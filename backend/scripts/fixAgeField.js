require('dotenv').config();
const mongoose = require('mongoose');
const PatientRecord = require('../models/PatientRecord');

const fixAges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const records = await PatientRecord.find({});

    let updatedCount = 0;

    for (const record of records) {
      if (!record.age && record.features && record.features.Age !== undefined) {
        record.age = record.features.Age;
        await record.save();
        updatedCount++;
        console.log(`Updated record ${record._id} → age = ${record.age}`);
      }
    }

    console.log(`✅ Done! Updated ${updatedCount} record(s).`);
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error fixing age fields:', err);
    mongoose.connection.close();
  }
};

fixAges();
