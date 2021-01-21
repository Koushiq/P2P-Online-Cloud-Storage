const express 	= require('express');
const router  = express.Router();
const fileModel = require('../models/Files.js');
const fs = require('fs');
router.get('/',function (req,res){
    res.redirect('/upload');
});
router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});



router.get('/:id',function (req,res){
    let id= req.params.id;
    fileModel.getFileHash([id,'alive'],function (results){

        fs.readFile('download.json',(err,data)=>{
                let fileHash = results[0].Filehash;
                let fileName = results[0].Filename;
                let downloadLog = JSON.parse(data);
                console.log('inside fs read file ',downloadLog);
                console.log(fileHash);
                console.log(fileName);
                if(downloadLog[fileHash]!=null && downloadLog[fileHash]>Date.now())
                {
                    res.render('download.ejs',{fileHash,fileName});
                }
                else
                {
                    res.send(`<script>alert('Link expired'); window.location.href="/upload"; </script>`);
                }
        });

    });


});


module.exports = router;