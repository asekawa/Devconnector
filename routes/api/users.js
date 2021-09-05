const express = require('express');
const router = express.Router();
const {check, validationResult}=require("express-validator/check");
const User = require('../../models/User');
const gravatar=require('gravatar');

const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const config = require('config');


//@route POST api/users
//@desc Register user
//@access public()
router.post('/',[
check('name','Name is required').not().isEmpty(),
check('email','please include a valid email').isEmail(),
check('password','please enter a password with 6 or more characters').isLength({min:6})
],
async(req,res)=>{
    console.log(req.body);//initialise bdy parser
    const errors= validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
     const{name, email, password}=req.body;// destructure

     try
     {  //see if the user exists
         let user = await User.findOne({email});
         if(user)
         {
            return res.status(400).json({errors:[{msg:'User already exits'}]}); 
         }
 
    //get users gravatar

    const avatar=gravatar.url(email,{
        s:'200',
        r:"pg",
        d:'404'
    })
    
    // creating a new user instance
    user = new User(
        {
            name, 
            email,
            avatar,
            password
        }
    );
    //Encrypt password
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(password,salt);
    await user.save();// save user in database

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