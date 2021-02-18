Welcome to the repository of P2P online cloud storage

this is a blockchain based project that I am currently doing for my university project
using native javascript

***************** User Guides to Run this Project ********************
<ul>
<li>Step 1. clone this repo </li>
<li>Step 2. run "npm install " in command line without double quotes.</li>
<li>Step 3. create MySQL Database named filestorage and import filestorage.sql</li>
<li>Step 4. Copy PeerNode-1, 3 times and rename them as PeerNode-2, PeerNode-3, PeerNode-4</li>
<li>Step 5. Set  correct app server IP and port in PeerNode-1,2,3,4 test.js (You should check your IPV4 from your router or command line) </li>
<li>Step 6. To run app server go to Application_Server directory and type "node app" in command line </li>
<li>Step 7. Clear blockchain.json in every peerNode folder.</li>
<li>Step 8. To run PeerNodes,  go to their directory and type "node test" in command line. </li>
<li>Step 9. Set trackers in app server from app interface or by manually editing tracker.json</li>
<li>Step 10. Since downloading files create caches in app server, we have a program to clear the cache on cache expiry,
         Run cacheRemover.js in separate terminal.</li>