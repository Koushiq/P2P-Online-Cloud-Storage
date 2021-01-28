const express 	= require('express');
const router  = express.Router();
const fs = require('fs');

router.get('/',(req,res)=>{
    let errLog={errors:[]};
    res.render('peeradd',{errLog});
});

router.post('/', (req, res)=>{
    let peerInfo = {};
    peerInfo['ipv4'] = req.body.ip;
    peerInfo['port'] = req.body.port;
    console.log("Peer received: ",peerInfo);
    let trackerlist = fs.readFileSync('./trackers.json');
    trackerlist = JSON.parse(trackerlist);
    trackerlist.push(peerInfo);
    console.log("Tracker List: ", trackerlist);
    fs.writeFileSync('./trackers.json', JSON.stringify(trackerlist,null, 2));
    res.send(`<script>alert('Peer Inserted');window.location.href="/superadminhome";</script> `);
});

module.exports = router;