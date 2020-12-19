const express 	= require('express');
const router  = express.Router();
const fileModel = require('../models/Files.js');

router.get('/',(req,res)=>{
    
    fileModel.get(['king','trashed'],(results)=>{
        res.render('trashbox',{results});
    });

});

module.exports=router;