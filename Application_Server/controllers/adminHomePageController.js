let express = require('express');
let router = express.Router();
let fileModel = require('../models/Files');
let userNames = [];
let fileSize =  [];
let fileData =  {};

router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/adminlogin');
    } else {
        next();
    }
});




//Server admin homepage.
router.get('/', (req, res)=>{

    fileModel.getSumandUserName('', (results)=>{
        let stringResult = JSON.parse(JSON.stringify(results));
        console.log(stringResult);
        res.render('adminhome', {stringResult});
    });
    console.log("rendering webpage");


})

/* router.post('/' (req, res)=>{

}) */



module.exports = router;
