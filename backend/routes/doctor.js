const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PatientRecord = require('../models/PatientRecord');

router.post('/approve', auth, async (req,res) => {
  try {
    if(req.user.role !== 'doctor') return res.status(403).json({error:'Not authorized'});
    const { recordId, predictionIndex, notes } = req.body;
    const rec = await PatientRecord.findById(recordId);
    if(!rec) return res.status(404).json({error:'Not found'});
    rec.predictions[predictionIndex].doctorApproved = true;
    rec.predictions[predictionIndex].doctorNotes = notes || '';
    await rec.save();
    res.json({ success:true, record: rec });
  } catch(e){ console.error(e); res.status(500).json({error:'Approve failed'}) }
});

router.get('/pending', auth, async (req,res) => {
  if(req.user.role!=='doctor') return res.status(403).json({error:'Not authorized'});
  const records = await PatientRecord.find({ 'predictions.0': { $exists: true } }).sort({createdAt:-1}).limit(50);
  res.json(records);
});

module.exports = router;
