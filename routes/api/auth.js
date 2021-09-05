const express = require('express');
const router = express.Router();
const  auth = require('../../middleware/auth');
const User=require('../../models/User');
const jwt =require('jsonwebtoken');
const config = require('config');
const bcrypt=require('bcryptjs');
const {check, validationResult}=require("express-validator/check");
 

//@route GET api/auth
//@desc Test route
//@access public()
router.get('/',auth,async(req,res)=>{ 
   try{
       const user= await User.findById(req.user.id).select('-password');
       res.json(user);
   }
   catch(err){
       console.error(err.message);
       res.status(500).send('server error');


   } 
});
//@route POST api/auth
//@desc authenticate user
//@access public()
router.post('/',[
    
    check('email','please include a valid email').isEmail(),
    check('password','password is required')
    .exists()
    ],
    async(req,res)=>{
        console.log(req.body);//initialise bdy parser
        const errors= validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }
         const{email, password}=req.body;// destructure
    
         try
         {  //see if the user exists
             let user = await User.findOne({email});
             if(!user)
             {
                return res.
                status(400).json({errors:[{msg:'Invalid credentials email'}]}); 
             }
    
    
             const isMatch =await bcrypt.compare(password,user.password);
             if(!isMatch)
             {
                return res.status(400).json({errors:[{msg:'Invalid credentialssss'}]}); 
             }
        //Json web token, becuase the user can be logged in
    
        const payload={
            user:{
                id:user.id
            }
        }
         jwt.sign(
             payload,
             config.get('jwtSecret'),
             {expiresIn:36000},//expiration
             (err,token)=>{
                 if(err) throw err;
                 res.json({token});
             }// get a token or error, if token is got its send to the client
             );
    
        /* res.send('User registered'); */
         }
         catch(err){
             console.error(err.message);
             res.status(500).send('Server error');
         }
    }
        
        );
module.exports=router;