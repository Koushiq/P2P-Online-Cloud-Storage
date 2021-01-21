const express 	= require('express');
const router  = express.Router();
const fileModel = require('../models/Files.js');

router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});

router.get('/',(req,res)=>{
    
    fileModel.get(['king','trashed'],(results)=>{
        res.render('trashbox',{results});
    });

});

module.exports=router;