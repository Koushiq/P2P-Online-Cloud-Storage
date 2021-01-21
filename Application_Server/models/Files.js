const db = require('./db');
let date = new Date().toISOString().
  replace(/T/, ' ').      
  replace(/\..+/, '') ;
module.exports =
{
    insert: (files,username, callback)=>{
       /*  let name = files.name;
        let sha1=files.sha1;
        let size=file.size;
        console.log(name);  */
        let name=""+files.name;
        let sha1=""+files.sha1;
        let size=""+files.size;

       // console.log("inside db ",files);
        //console.log("file name is "+name);
		let sql = "insert into Files values(?,?,?,?,?,?,?,?,?)";
		//console.log(sql);
		db.execute(sql,['',name,sha1,date,username,size,null,'alive',null], (status)=>{
            //console.log(result[0]);
            console.log("Rows inserted : "+status);
            if(status)
            {
                console.log("inserted to app db ");

            }
            else
            {
                console.log("not inserted to app db ");
            }
            callback(status);
		});
    },
    getFileHash:(user,callback)=>{
        let sql="select * from files where FileId=? and Filestatus=?";
        db.getResults(sql,user,(result)=>{
            if(result.length>0){ return callback(result);}
            else{return callback([]);}
        });
    },

    get:(user,callback)=>{
        let sql="select * from files where CreatedBy=? and Filestatus=?";
        db.getResults(sql,user,(result)=>{
            if(result.length>0){ return callback(result);}
            else{return callback([]);}
        });
    },


    getAll:(user,callback)=>{
        let sql = "select * from files";
        db.getResults(sql,null,(result)=>{
                if(result.length>0){ return callback(result);}
                else{return callback([]);}
        });
    }
    ,
    //softDelete
    delete:(user,callback)=>{
        let sql="Update Files set DeletedAt='"+date+"' , Filestatus='trashed' where FileID=? and CreatedBy=? ";
        db.execute(sql,user,(status)=>{
           // console.log(sql);
           // console.log(user);
            console.log('Delete status is '+status);
        });
    }
}