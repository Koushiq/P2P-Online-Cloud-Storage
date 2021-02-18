let express = require('express');
let router = express.Router();

//Log out user and clear session cookie.
router.get('/', (req, res)=>{
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/');
});

module.exports = router;