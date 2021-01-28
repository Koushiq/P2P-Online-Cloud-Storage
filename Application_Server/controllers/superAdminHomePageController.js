let express = require('express');
let router = express.Router();
let adminModel = require('../models/Admins');
let fs = require('fs');
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





router.get('/', (req, res)=>{

    adminModel.getAllAdmin('', (results)=>{
        let stringResult = JSON.parse(JSON.stringify(results));
        console.log(stringResult);
        let trackerlist = fs.readFileSync('./trackers.json');
        trackerlist = JSON.parse(trackerlist);
        console.log(trackerlist);
        res.render('superadminhome', {stringResult, trackerlist});
    });
})



/* router.post('/' (req, res)=>{

}) */



module.exports = router;
