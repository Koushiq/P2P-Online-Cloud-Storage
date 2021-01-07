const fs = require('fs');
const splitFile = require('split-file');

module.exports = {
    processFiles:(files,callback)=>{
      let status=true;

      //make tempdir using sha1
      //console.log(files);
      
      let targetDir = "./tmp/"+files.sha1;
      try
      {
        if(!fs.existsSync(targetDir))
        {
          fs.mkdirSync(targetDir);
        }
      }
      catch(err)
      {
        console.log("Dir not created reason:  "+err);
        status = false  ;
      }

      //check if dir is created
      if(status!=false)
      {

        let path = targetDir+"/"+files.sha1+"."+files.extension;
        console.log(path);
          files.mv(path,function(err){   // copy file 
            if(err)
            {
              status = false;
              console.log("file not copied reason : "+err);
            }

            splitFile.splitFileBySize(path, 500*1024)  // shard copied file 
            .then((names) => {
              //console.log("files sharded , file shards : "+names);
            })
            .catch((err) => {
              //console.log('FIle not split reason : ', err);
            });

          });
          callback(status);
      }

    }
}