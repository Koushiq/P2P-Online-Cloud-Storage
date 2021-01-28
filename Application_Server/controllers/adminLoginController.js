const express 	= require('express');
const router  = express.Router();
const adminsModel = require('../models/Admins.js');
const { body, validationResult } = require('express-validator');

router.get('/',function(req,res){

    let errLog={errors:[]};
    res.render('adminLogin',{errLog});

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
        res.render('adminLogin',{errLog});
    }
    else
    {
        adminsModel.getAdmin(user,function(result){
            if(result.length>0)
            {
                let stringResult = JSON.parse (JSON.stringify(result));
                // set cookie
                res.cookie('username', user['Username'], {expire: 360000 + Date.now()});
                if(stringResult[0]['role'] === 'superadmin'){
                    res.redirect('/superadminhome');
                }
                else{
                    res.redirect('/adminhome');
                }

            }
            else
            {
                res.send(`<script>alert('Invalid Usename or Password');window.location.href="/adminLogin";</script> `);
            }
        });
    }
});


module.exports = router;