let express = require('express');
let router = express.Router();

//Logout and clear session cookies.
router.get('/', (req, res)=>{
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('adminLogin');
});

module.exports = router;