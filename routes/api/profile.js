const express = require('express');
const router = express.Router();// express routers

//@route GET api/profile
//@desc Test route
//@access public()
router.get('/',(req,res)=>res.send('Profile route'));

module.exports=router;