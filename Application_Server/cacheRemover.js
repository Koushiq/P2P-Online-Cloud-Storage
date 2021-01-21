const fs = require('fs');

setInterval(function(){

    let downloadLog = JSON.parse( fs.readFileSync('download.json'));
    let object = {};
    Object.keys(downloadLog).forEach(function(key) {
        let value = downloadLog[key];
        if(Date.now()>value)
        {
            fs.unlinkSync('downloaded/'+key);
        }
        else
        {
            object[key]=value;
        }
    });
    fs.writeFileSync('download.json',JSON.stringify(object,null,4));

},1000);