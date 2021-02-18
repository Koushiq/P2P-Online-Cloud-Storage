const express 	= require('express');
const router  = express.Router();
const usersModel = require('../models/Users.js');
const { body, validationResult } = require('express-validator');
let date = new Date().toISOString().
  replace(/T/, ' ').
  replace(/\..+/, '') ;
let user ='';

//Render registration page.
router.get('/',(req,res)=>{
    let errLog={errors:[]};
    res.render('registration',{errLog});
});

//Validate and register user.
router.post('/',
body('username').isLength({min:4}).withMessage('Username can not empty or shorter than 4'),
body('firstname').isLength({min:4}).withMessage('Firstname can not empty or shorter than 4').isAlpha().withMessage('Only Characters allowed in Firstname'),
body('lastname').isLength({min:4}).withMessage('Lastname can not empty or shorter than 4').isAlpha().withMessage('Only Characters allowed in Lastname'),
body('password').isLength({ min: 4 }).withMessage('Password can not empty or shorter than 4'),
body('dob').isDate().withMessage('Invalid Date'),

(req,res)=>{

    const errors = validationResult(req);
    usersModel.get(req.body.username,function(result){
        if(result.length>0)
        {
            res.send(`<script>alert('username exits'); window.location.href="/registration"; </script>`);
        }
        else
        {
            if(errors.isEmpty())
            {
                let user={};
                user['Username']=req.body.username;
                user['Firstname']=req.body.firstname;
                user['Lastname']=req.body.lastname;
                user['Password']=req.body.password;
                user['Dob']=req.body.dob;
                user['RegisteredAt']=date;
                user['ProfileStatus']='approved';
                usersModel.insert(user,(status)=>{
                    if(status)
                    {
                        console.log('inserted ');
                    }
                    else
                    {
                        console.log('not inserted');
                    }
                });
            }
            else
            {
                let errLog = JSON.parse(JSON.stringify(errors));
                res.render('registration',{errLog});
            }
        }
    });

});


module.exports= router;