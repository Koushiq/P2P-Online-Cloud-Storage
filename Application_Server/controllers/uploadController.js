const express 	= require('express');
const router  = express.Router();
const fileBufferHash = require('object-hash');
const processFiles = require('../services/processFileService.js');
const fileModel = require('../models/Files.js');
const fs = require('fs');
const getFileService = require('../services/getFileService.js');
const socketService= require('../services/socketService2.js');
let dhtData = JSON.parse(fs.readFileSync('dht.json'));

router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});




router.get('/',function(req,res){
    //console.log(req.cookies['username']);

    let username = req.cookies['username'];
    fileModel.get([username,'alive'],(results)=>{
        res.render('upload',{results});
    });

});


router.get('/download/:id',function(req,res){
    
    //get file hash from db 
    let username = req.cookies['username'];
    fileModel.getFileHash([req.params.id,'alive'],(results)=>{

        //console.log(results);
        if(results.length>0)
        {
            let fileHash = results[0].Filehash;
            let fileName = results[0].Filename;
            console.log(results);
            console.log(dhtData);
            if(dhtData[fileHash]!==undefined || dhtData[fileHash]!=null)
            {
                console.log(dhtData);
                console.log('inside if 1 ');
                fs.readdir('downloaded/',function (err,data)
                {
                    let found = false;
                    if(err!=null || err!==undefined)
                    {
                        console.log('inside if 2 ');
                        for(let i=0;i<data.length;i++)
                        {
                            if(data[i]===fileHash)
                            {
                                found=true;
                                break;
                            }
                        }

                        if(found)
                        {
                            console.log('inside if 3 ');
                            res.redirect('/downloadFile/' + req.params.id);
                        }
                        else
                        {
                            console.log('inside else 4 ');
                            getFileService.initFile({results}, function (fileFound) {
                                if (fileFound === 'invalid') {
                                    console.log('inside if 5 ');
                                    res.send(`<script>alert('invalid file requested,does not exits in server') ;window.location.href="http://localhost:3000/upload"; </script>`);
                                } else {
                                    console.log('inside else 5 ');
                                    res.redirect('/downloadFile/' + req.params.id);
                                }
                            });
                        }
                    }
                    else
                    {
                        console.log('inside else 3 ');
                        res.send(`<script>alert('invalid file requested,does not exits in server') ;window.location.href="http://localhost:3000/upload"; </script>`);
                    }
                });
            }
            else
            {
                console.log('inside else 2 ');
                res.redirect('/');
            }
        }
        else
        {
            console.log('inside else 1 ');
            res.send(`<script>alert('invalid file id requested') ; window.location.href="http://localhost:3000/upload";</script>`);
        }
    });

});


router.get('/delete/:id',function(req,res){
    let username = req.cookies['username'];
    console.log('here');
    console.log(req.params.id);
    let data  = [req.params.id,username]; // insert username from cookie here
    fileModel.delete(data,(results)=>{
       console.log('results '+results);
    });
    res.redirect('/');

});


router.post('/',function(req,res){
    let username = req.cookies['username'];
    if(req.files!=null)
    {
        console.log('inside controller ',req.files.uploads);
        req.files.uploads['sha1']=fileBufferHash(req.files.uploads.data);
        let data = req.files.uploads.name; data = data.split('.');
        req.files.uploads['extension']= data[data.length-1];

        processFiles.processFiles(req.files.uploads,(dirpath)=>{
            if(dirpath!==false)
            {
                console.log("file copied");
                console.log(dirpath);
                socketService.sentFileToPeer(dirpath,req.files.uploads,req.cookies['username'],function(result){

                    console.log('/tmp/'+req.files.uploads['sha1']);

                    if(result==='done')
                    {
                        fs.rmdirSync('tmp/'+req.files.uploads['sha1'], { recursive: true });
                        fileModel.insert(req.files.uploads,username,(dbStatus)=>{
                                if(dbStatus)
                                {
                                    //res.send(`<script>alert('Uploaded')</script>`);
                                }
                                else
                                {
                                    res.send(`<script>alert('Not Uploaded')</script>`);
                                }
                        });
                    }
                });
            }
            else
            {
                console.log("not copied");
            }
        });
        res.redirect('/upload');
    }
});



module.exports = router;