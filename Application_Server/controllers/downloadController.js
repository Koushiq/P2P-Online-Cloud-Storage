const express 	= require('express');
const router  = express.Router();
const fileModel = require('../models/Files.js');

router.get('/',function (req,res){
    res.redirect('/upload');
});


router.get('/:id',function (req,res){
    let id= req.params.id;
    fileModel.getFileHash([id,'alive'],function (results){
        let fileHash = results[0].Filehash;
        let fileName = results[0].Filename;
        res.render('download.ejs',{fileHash,fileName});

    });


});


module.exports = router;