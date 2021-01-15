const SHA256 = require('crypto-js/sha256');
const fs = require('fs');

class Block{

    constructor(data, prevHash=""){
        this.data = data;
        this.hash = this.computeHash();
        this.prevHash = prevHash;
    }
    computeHash(){

        return SHA256(JSON.stringify(this.data)).toString();
    }
}

  class BlockChain{
        constructor(){
            this.blockchain = [this.genesisBlock()];

        }

        genesisBlock(){
            return new Block({FileName: "GenesisBlock", Author:"Sowvik", Date: "13/12/2020", Extension: ""},"0");
        }
        lastBlockHash(){
            return this.blockchain[this.blockchain.length-1];
        }
        isChainValid(){
            for(let i = 1; i<this.chain.length; i++){
                const currentBlock = this.chain[i];
                const previousBlock = this.chain[i-1];
                if(currentBlock.hash !== currentBlock.computeHash()){
                    return false;
                }
                if(currentBlock.prevHash !== previousBlock.hash){
                    return false;
                }
            }
            return true;
        }

        addBlockChain(block){

            block.prevHash = this.lastBlockHash().hash;
            block.hash = block.computeHash();
            this.blockchain.push(block);

        }
    }


let chain= new BlockChain();
function blockAdd(data, hash){

    chain.addBlockChain(new Block(data,hash));
};
function printBlockchain(){
    console.log(JSON.stringify(chain, null, 4));
}
function blockChainData(){
    return chain.blockchain;
}
function chainValidity(){
    return chain.isChainValid();
}
module.exports = {blockAdd, printBlockchain, blockChainData, chainValidity};