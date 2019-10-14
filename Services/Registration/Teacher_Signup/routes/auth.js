const express = require('express')
const Teachers = require('../model/teachers');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const cannister = require('../config/cannister')
const router = express.Router();

/****** Registering Managment  Users  ******/
router.post('/register', async (req,res) => {
   const userList = req.body.payLoad;
   let i = 0;
    for (const user of userList) {
        //check email exists or not
     //  const emailExist = await Teachers.findOne({email : user.email});
      /*  if(emailExist){
            cannister.metadata.service = 'Registration';
            cannister.metadata.timeStamp = Date.now();
            cannister.metadata.subService = 'ManagementSignUp';
            cannister.metadata.payLoadType = 'JSON'
            cannister.payLoad[i] = { "Serial Number": i+1, "email" : user.email , "Desc" : "Please retry from the data beloging to this no"};
            cannister.payLoadType = "JSON";
            cannister.error.code = "ERR001";
            cannister.error.description = "Management already Exists";
            return res.status(400).send(cannister);
        }*/
        //Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password,salt)
        
        //Create a new Management user
        const newuser = new Teachers({
            name : user.name,
            dob : user.dob,
            gender : user.gender,
            country : user.country,
            city : user.city,
            address : user.address,
            phoneUno : user.phone1,
            phonetwo : user.phone2,
            bloodgroup : user.bloodgroup,
            email : user.email,
            password : hashPassword
        });
        // Adding the Teacher to table
        try{
            const savedUser = await newuser.save();
        } catch(err){
            cannister.metadata.service = 'Registration';
            cannister.metadata.timeStamp = Date.now();
            cannister.metadata.subService = 'ManagementSignUp';
            cannister.metadata.payLoadType = 'JSON'
            cannister.payLoad[i] = { "Serial Number": i+1, "email" : user.email , "desc" : "Please retry from the data beloging to this no"};
            cannister.payLoadType = "JSON";
            cannister.error.code = "ERR001";
            cannister.error.description = "Unaable to save user. Please Try again";
            return res.status(400).send(cannister);
            
        }
        //Adding each saved management user to payload
        cannister.payLoad[i] = { "Serial Number": i+1 , "email" : user.email, "desc" : "added to db!!"};
        i = i +1;
    }
  
    cannister.metadata.service = 'Registration';
    cannister.metadata.timeStamp = Date.now();
    cannister.metadata.subService = 'ManagementSignUp';
    cannister.metadata.payLoadType = 'JSON'
    cannister.payLoadType = "JSON";
    cannister.error.code = "SUCC001";
    cannister.error.description = "All users are saved";
    return res.status(200).send(cannister);
});


/******* LOGIN FOR MANAGEMENT USERS ******/

router.post('/login', (req, res) => {
     passport.authenticate( 'local',
       { session: false },
       (error, user) => {
         if (!user || error) {
           cannister.metadata.service = 'Login';
           cannister.metadata.timeStamp = Date.now();
           cannister.payLoad[0] = { error };
           cannister.payLoadType = "JSON";
           cannister.error.code = "ERR001";
           cannister.error.description = "Incorrect username or password";
           return res.send(cannister);
         }
         /** This is what ends up in our JWT */
         const payload = {
           email : user.email,
           expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS)
         };
         /** assigns payload to req.user */
         req.login(payload, {session: false}, (error) => {
         if (error) {
             res.status(400).send({ error });
         }
         
        /** Constructing jwt token */
        const token = jwt.sign(JSON.stringify(payload), process.env.Token_secret);
        
        /** Setting Cannister values  */
          cannister.metadata.service = 'Login';
          cannister.metadata.timeStamp = Date.now();
          cannister.payLoad[0] = { "user": user.email , "token" : token };
          cannister.payLoadType = "JSON";
          cannister.metadata.payLoadType = 'JSON'
          cannister.payLoadType = "JSON";
          cannister.error.code = "SUCC001";
          cannister.error.description = "Success";
           return res.status(200).send(cannister);
         });
       },
     )(req, res);
   });

  

module.exports = router;