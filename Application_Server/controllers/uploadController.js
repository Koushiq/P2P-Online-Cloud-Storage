const express 	= require('express');
const router  = express.Router();
const fileBufferHash = require('object-hash');
const processFiles = require('../services/processFileService.js');
const fileModel = require('../models/Files.js');
const fs = require('fs');
const getFileService = require('../services/getFileService.js');

router.get('/',function(req,res){

    fileModel.get(['king','alive'],(results)=>{
        res.render('upload',{results});
    });

});


router.get('/download/:id',function(req,res){
    
    //get file hash from db 
    fileModel.getFileHash([req.params.id,'alive'],(results)=>{
        getFileService.initFile({results},function(fileFound){
            if(fileFound=='invalid')
            {
               
            }
            
        });
    });
    res.redirect('/');

});


router.get('/delete/:id',function(req,res){
    console.log('here');
    console.log(req.params.id);
    let data  = [req.params.id,'king']; // insert username from cookie here
    fileModel.delete(data,(results)=>{
       console.log('results '+results);
    });
    res.redirect('/');
});


router.post('/',function(req,res){

    if(req.files!=null)
    {
        console.log('inside controller ',req.files.uploads);
        req.files.uploads['sha1']=fileBufferHash(req.files.uploads.data);
        var data = req.files.uploads.name; data = data.split('.');
       
        req.files.uploads['extension']= data[data.length-1];

        fileModel.insert(req.files.uploads,(dbStatus)=>{
            console.log("db status is "+dbStatus);
        });

        processFiles.processFiles(req.files.uploads,(status)=>{
            if(status!=false)
            {
                console.log("file copied");
                console.log(status);
                
                
            }
            else
            {
                console.log("not copied");
            }
        });
        
    }
    res.redirect('/');
});



module.exports = router;