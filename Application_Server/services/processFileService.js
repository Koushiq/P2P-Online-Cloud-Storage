const fs = require('fs');
const splitFile = require('split-file');

module.exports = {
    processFiles:(files,callback)=>{
      let status=true;
      
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
              
              try {
                
                fs.unlinkSync(path);

                let h = files.sha1;
                let s = files.size;

               /* let fileObject = {
                  h:s
               } */
              // let fileObject = {};
               //fileObject[h]=s;

               let x = __dirname+'/../dht.json';
               let fileString = JSON.parse(fs.readFileSync(x));
               
              // fileString.push(fileObject);
              fileString[h]=s;
               fs.writeFileSync(x,JSON.stringify(fileString,null,4));
                 //file removed
                 callback(targetDir);

              } catch(err) {
                console.error(err);
                callback(status);
              }
            })
            .catch((err) => {
              console.log('File not split reason : ', err);
              callback(status);
            });

          });

          
      }
      else
      {
        callback(status);
      }

    }
}