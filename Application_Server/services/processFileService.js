const fs = require('fs');
const splitFile = require('split-file');
const encryptor = require('file-encryptor');

module.exports = {
    processFiles:(files,callback)=>{
      let key = 'random'; //Set encryption key
      let status=true;

      let targetDir = "./tmp/"+files.sha1; // set destination directory using the uploaded file hash string
      try //try to create directory
      {
        if(!fs.existsSync(targetDir)) //if directory not exists then create
        {
          fs.mkdirSync(targetDir); //Create directory
        }
      }
      catch(err) // throw error
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
            else
            {
              encryptor.encryptFile(path, files.sha1, key, function(err) { //Encrypt file
                  if(err==null || err==undefined) //if enc error is null
                  {
                    splitFile.splitFileBySize(path, 512*1024)  // shard copied file
                        .then((names) => { //

                          try { //Try to delete initial uploaded files as encryption is done

                            fs.unlinkSync(path);
                            fs.unlinkSync(files.sha1);
                            let h = files.sha1;
                            let s = files.size;

                            let x = __dirname+'/../dht.json';
                            let fileString = JSON.parse(fs.readFileSync(x));

                            // fileString.push(fileObject);
                            fileString[h]=s;
                            fs.writeFileSync(x,JSON.stringify(fileString,null,4));
                            //file removed
                            callback(targetDir); //send ack of success

                          } catch(err) {
                            console.error(err);
                            callback(status); // send ack of error
                          }
                        })
                        .catch((err) => {
                          console.log('File not split reason : ', err);
                          callback(status); //Send ack of file sharding error
                        });
                  }
              });
            }
          });
      }
      else
      {
        callback(status);
      }

    }
}