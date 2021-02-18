const express 	= require('express');
const router  = express.Router();
const fileBufferHash = require('object-hash');
const processFiles = require('../services/processFileService.js');
const fileModel = require('../models/Files.js');
const fs = require('fs');
const getFileService = require('../services/getFileService.js');
const socketService= require('../services/socketService2.js');


router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});


//Show upload page
router.get('/',function(req,res){
    //console.log(req.cookies['username']);

    let username = req.cookies['username'];
    fileModel.get([username,'alive'],(results)=>{
        res.render('upload',{results});
    });

});

//Prompt file download from file ID
router.get('/download/:id',function(req,res){
    let dhtData = JSON.parse(fs.readFileSync('dht.json'));
    //get file hash from db
    let username = req.cookies['username'];
    fileModel.getFileHash([req.params.id,'alive'],(results)=>{ //Get file hash from file ID.

        //console.log(results);
        if(results.length>0)
        {
            let fileHash = results[0].Filehash; //Assign file hash from DB
            let fileName = results[0].Filename; //Assign file name from DB
            console.log(results);
            console.log(dhtData);
            if(dhtData[fileHash]!==undefined || dhtData[fileHash]!=null) //Check if file exist in DHT
            {
                console.log(dhtData);
                console.log('inside if 1 ');
                fs.readdir('downloaded/',function (err,data) //If exists, then open the following directory
                {
                    let found = false; //Set found flag to false.
                    if(err!=null || err!==undefined) //if no error was found in reading directory
                    {
                        console.log('inside if 2 ');
                        for(let i=0;i<data.length;i++) //Iterate folder content
                        {
                            if(data[i]===fileHash) //Check if hash exists
                            {
                                found=true; //Set found = true
                                break; //break the loop
                            }
                        }

                        if(found) //if file is found
                        {
                            console.log('inside if 3 ');
                            res.redirect('/downloadFile/' + req.params.id); //Redirect to downloadFileController
                        }
                        else //if file is not found
                        {
                            console.log('inside else 4 ');
                            getFileService.initFile({results}, function (fileFound) {//Load init file service
                                if (fileFound === 'invalid') { //if filefound status is invalid
                                    console.log('inside if 5 ');
                                    res.send(`<script>alert('invalid file requested,does not exits in server') ;window.location.href="http://localhost:3000/upload"; </script>`); // Serve invalid file error
                                } else { //if filestatus is not invalid
                                    console.log('inside else 5 ');
                                    res.redirect('/downloadFile/' + req.params.id); //Redirect to downloadFileController
                                }
                            });
                        }
                    }
                    else // Serve invalid file error
                    {
                        console.log('inside else 3 ');
                        res.send(`<script>alert('invalid file requested,does not exits in server') ;window.location.href="http://localhost:3000/upload"; </script>`); //Redirect to downloadFileController
                    }
                });
            }
            else
            {
                console.log('inside else 2 ');
                res.redirect('/');
            }
        }
        else //Invalid file ID requested
        {
            console.log('inside else 1 ');
            res.send(`<script>alert('invalid file id requested') ; window.location.href="http://localhost:3000/upload";</script>`); //
        }
    });

});

//Soft Delete using file ID
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

//Initiate upload
router.post('/',function(req,res){
    let username = req.cookies['username'];
    if(req.files!=null)
    {
        console.log('inside controller ',req.files.uploads);
        req.files.uploads['sha1']=fileBufferHash(req.files.uploads.data); //Dynamically add sha1 hash from uploaded file buffer to request property of router

        let data = req.files.uploads.name; data = data.split('.'); //Get split file name and extension
        req.files.uploads['extension']= data[data.length-1]; //Assign extension to request property of router

        processFiles.processFiles(req.files.uploads,(dirpath)=>{ //Initiate process file service
            if(dirpath!==false) //
            {
                console.log("file copied");
                console.log(dirpath);
                socketService.sentFileToPeer(dirpath,req.files.uploads,req.cookies['username'],function(result){ //Initiate send files to peer service

                    console.log('/tmp/'+req.files.uploads['sha1']);

                    if(result==='done') //If file sending is successful
                    {
                        fs.rmdirSync('tmp/'+req.files.uploads['sha1'], { recursive: true }); //Delete sended file from app server
                        fileModel.insert(req.files.uploads,username,(dbStatus)=>{ //Insert updated file info to DB
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