var block = require('./blockchain');

block.blockAdd({FileName: "Anyfile", Author:"Sowvik",TimeStamp:"1/1/2021", Size:"500MB", Hash:"dsjfoiJKLJSLKJhflkzxnl85290sjdJFDSKL"});
block.blockAdd({FileName: "Test File", Author:"Mushfiq",TimeStamp:"1/5/2023", Size:"750MB", Hash:"dfgdgdfgdfsdvdfgn ee534"})
block.blockAdd({FileName: "Movie", Author:"Test",TimeStamp:"1/1/2021", Size:"500MB", Hash:"dsjfoiJKLdsadJSLKJhflkzxnl85290sjdJFDSKL", Extension: ".txt"})
//block.printBlockchain();

var arr = block.blockChainData();
var hash = "dsjfoiJKLJSLKJhflkzxnl85290sjdJFDSKL";

for(var i = 0; i<arr.length; i++){
    //console.log(arr[i].data.Hash);
    if(arr[i].data.Hash ==  hash){
        console.log("found");
    }
    else{
        console.log("Not Found");
    }
}