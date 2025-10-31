const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req,res) => {
  try {
    const {name,email,password,role} = req.body;
    if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({error:'User exists'});
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);
    const user = await User.create({name,email,password:hash,role});
    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});
    res.json({token,user:{id:user._id,name:user.name,role:user.role,email:user.email}});
  } catch(e){ console.error(e); res.status(500).json({error:'Signup failed'}); }
});

router.post('/login', async (req,res) => {
  try {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password,user.password);
    if(!ok) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});
    res.json({token,user:{id:user._id,name:user.name,role:user.role,email:user.email}});
  } catch(e){ console.error(e); res.status(500).json({error:'Login failed'}); }
});

module.exports = router;
