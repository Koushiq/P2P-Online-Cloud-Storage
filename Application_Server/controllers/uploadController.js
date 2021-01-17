const express 	= require('express');
const router  = express.Router();
const fileBufferHash = require('object-hash');
const processFiles = require('../services/processFileService.js');
const fileModel = require('../models/Files.js');
const fs = require('fs');
const getFileService = require('../services/getFileService.js');
const socketService= require('../services/socketService2.js');
let dhtData = JSON.parse(fs.readFileSync('dht.json'));

router.get('/',function(req,res){

    fileModel.get(['king','alive'],(results)=>{
        res.render('upload',{results});
    });

});


router.get('/download/:id',function(req,res){
    
    //get file hash from db 
    fileModel.getFileHash([req.params.id,'alive'],(results)=>{
        let fileHash = results[0].Filehash;
        let fileName = results[0].Filename;
        console.log(results);
        console.log(dhtData);
        if(dhtData[fileHash]!==undefined || dhtData[fileHash]!=null)
        {
            console.log(dhtData);
            getFileService.initFile({results},function(fileFound){
                if(fileFound==='invalid')
                {
                    res.redirect('/');
                }
                else
                {
                    res.redirect('/downloadFile/'+req.params.id);
                }

            });
        }
        else
        {
            res.redirect('/');
        }

    });

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
        let data = req.files.uploads.name; data = data.split('.');
        req.files.uploads['extension']= data[data.length-1];

        processFiles.processFiles(req.files.uploads,(dirpath)=>{
            if(dirpath!=false)
            {
                console.log("file copied");
                console.log(dirpath);
                socketService.sentFileToPeer(dirpath,function(result){
                    console.log('abcd123412341');
                    console.log('/tmp/'+req.files.uploads['sha1']);
                    if(result=='done')
                    {
                        fs.rmdirSync('tmp/'+req.files.uploads['sha1'], { recursive: true });
                        fileModel.insert(req.files.uploads,(dbStatus)=>{
                        
                        });
                    }
                });
            }
            else
            {
                console.log("not copied");
            }
        });
        res.redirect('/');
    }
});



module.exports = router;