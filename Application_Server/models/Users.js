const db = require('./db');
let date = new Date().toISOString().
  replace(/T/, ' ').      
  replace(/\..+/, '') ;

module.exports = 
{
    insert:(user,callback)=>{
        let sql = "insert into Users values(?,?,?,?,?,?,?,?)";
        db.execute(sql,[user.Username,user.Firstname,user.Lastname,user.Password,user.Dob,user.RegisteredAt,user.ProfileStatus,null], (status)=>{
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
    get:(user,callback)=>{
        let sql="select * from Users where Username=?";
        db.getResults(sql,user,(result)=>{
            if(result.length>0){ return callback(result);}
            else{return callback([]);}
        });
    },
    getUser:(user,callback)=>{
        let sql="select * from Users where Username=? and Password=?";
        db.getResults(sql,[user['Username'],user['Password']],(result)=>{
            if(result.length>0) { return callback(result) ;}
            else  {return callback([]);  }
        });
    }
}