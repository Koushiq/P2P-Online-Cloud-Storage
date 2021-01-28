let db = require('./db');

function insertAdmin(adminDetails, callback){
    console.log(adminDetails.fullname, adminDetails.username, adminDetails.password, adminDetails.role);
    let sql = "insert into Admins values(?,?,?,?)";
    db.execute(sql,[adminDetails.fullname, adminDetails.username, adminDetails.password, adminDetails.role], (status)=>{
        console.log("Rows Inserted" +status);
        if(status){
            console.log("Inserted into DB");
        }else{
            console.log("Insert into DB failed!!");
        }
        callback(status);
    });
}
function getAdmin(adminDetails, callback){
    let sql = "select * from admins where username = ?";
    db.getResults(sql,adminDetails.Username, (result)=>{
        if(result.length>0){
            console.log("User available")
            return callback(result);}
        else{return callback([]);}
    });

}
function getAllAdmin(param, callback){
    let sql = "select * from admins where role = 'admin'";
    db.getResults(sql, param,(result)=>{
        if(result.length>0){
            console.log("Admin details received");
            return callback(result);
        }else{
            return callback([]);
        }
    });
}


module.exports.insertAdmin = insertAdmin;
module.exports.getAdmin    = getAdmin;
module.exports.getAllAdmin = getAllAdmin;
