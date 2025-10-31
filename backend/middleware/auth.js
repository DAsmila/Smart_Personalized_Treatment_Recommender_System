const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const header = req.header('Authorization');
  if(!header) return res.status(401).json({error:'No token'});
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) { res.status(401).json({error:'Invalid token'}); }
}
