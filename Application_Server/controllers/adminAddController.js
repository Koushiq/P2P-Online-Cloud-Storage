const express 	= require('express');
const router  = express.Router();
const adminModel = require('../models/Admins');


//Serve add admin form.
router.get('/',(req,res)=>{
    let errLog={errors:[]};
    res.render('adminadd',{errLog});
});

//post/insert admin add form.

router.post('/', (req, res)=>{
    let adminInfo = {};

    adminInfo['fullname'] = req.body.fullname;
    adminInfo['username'] = req.body.username;
    adminInfo['password'] = req.body.password;
    adminInfo['role']     = 'admin';
console.log(adminInfo);
    adminModel.insertAdmin(adminInfo, (status)=>{
        if(status){
            console.log("Admin Inserted");
            res.send(`<script>alert('Admin Inserted');window.location.href="/superadminhome";</script> `);
        }else{
            res.send(`<script>alert('Username Already exsits');window.location.href="/superadminhome";</script> `);
        }
    });
});

module.exports = router;