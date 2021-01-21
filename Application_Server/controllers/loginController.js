const express 	= require('express');
const router  = express.Router();
const usersModel = require('../models/Users.js');
const { body, validationResult } = require('express-validator');

router.get('/',function(req,res){

    let errLog={errors:[]};
    res.render('login',{errLog});

});

router.post('/',
body('username').isLength({min:1}).withMessage('Username can not empty'),
body('password').isLength({ min: 1 }).withMessage('Password can not empty'),
function(req,res){
    let user={};
    user['Username']=req.body.username;
    user['Password']=req.body.password;
    const errors = validationResult(req);
    let errLog = JSON.parse(JSON.stringify(errors));

    if(!errors.isEmpty())
    {
        res.render('login',{errLog});
    }
    else
    {
        usersModel.getUser(user,function(result){
            if(result.length>0)
            {
                // set cookie 
                res.cookie('username', user['Username'], {expire: 360000 + Date.now()}); 
                res.redirect('/upload');
            }
            else
            {
                res.send(`<script>alert('Invalid Usename or Password');window.location.href="/login";</script> `);
            }
        });
    }
});


module.exports = router;