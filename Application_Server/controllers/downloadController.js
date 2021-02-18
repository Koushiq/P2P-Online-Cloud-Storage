const express 	= require('express');
const router  = express.Router();
const fileModel = require('../models/Files.js');
const fs = require('fs');


//Redirect to upload
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


//Download specific file
router.get('/:id',function (req,res){
    let id= req.params.id;
    fileModel.getFileHash([id,'alive'],function (results){ //Get file hash from requested file ID

        fs.readFile('download.json',(err,data)=>{ //Read download.json (download.json is a cache log for downloaded files)
                let fileHash = results[0].Filehash; //Assign requested file hash
                let fileName = results[0].Filename; //Assign requested file name
                let downloadLog = JSON.parse(data); //Parse json data.
                console.log('inside fs read file ',downloadLog);
                console.log(fileHash);
                console.log(fileName);
                if(downloadLog[fileHash]!=null && downloadLog[fileHash]>Date.now()) //Check if cache has expired or not.
                {
                    res.render('download.ejs',{fileHash,fileName}); //Serve download page for requested file. Since it is in cache.
                }
                else
                {
                    res.send(`<script>alert('Link expired'); window.location.href="/upload"; </script>`); //Cache duration expired.
                }
        });

    });


});


module.exports = router;