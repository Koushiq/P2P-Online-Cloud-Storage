const express 	= require('express');
const router  = express.Router();
const fileBufferHash = require('object-hash');
const processFiles = require('../services/processFileService.js');
const fileModel = require('../models/Files.js');
const fs = require('fs');
const getFileService = require('../services/getFileService.js');
const socketService= require('../services/socketService2.js');


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
        let data = req.files.uploads.name; data = data.split('.');
        req.files.uploads['extension']= data[data.length-1];

       /*  fileModel.insert(req.files.uploads,(dbStatus)=>{
            console.log("db status is "+dbStatus);
        });
 */
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
                        console.log('asdasdasdasdasdasdasdaskdhasdkahsdjhasjdhasjkdhkajshdkjashdkjashdkjahskdjhaskjdhkj');
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