const SHA256 = require("crypto-js/sha256");
const fs = require("fs");
let date = new Date().toISOString().
  replace(/T/, ' ').     
  replace(/\..+/, '');
  
class Block{
    
    constructor(timestamp,data,previousHash='')
    {
        this.timestamp=timestamp;
        this.data=data;
        this.previousHash=previousHash;
        this.hash= this.calculateHash();
        this.nonce= 0;
    }
    initBlock(timestamp,data,previousHash,hash,nonce)
    {
        this.timestamp=timestamp;
        this.data=data;
        this.previousHash=previousHash;
        this.hash=hash;
        this.nonce=nonce;
        return this;
    }

    calculateHash(){
        return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.data)+this.nonce).toString();
    }

    mineBlock(difficulty)
    {
        while(this.hash.substring(0,difficulty)!==Array(difficulty+1).join("0"))
        {
            this.nonce++;
            this.hash=this.calculateHash();
        }
    }
}

class Blockchain {
    constructor(){
        this.chain= [this.createGenesisBlock()];
        this.difficulty=Math.round((Math.random()*10)%4);
        
    }
    createGenesisBlock(){
        return new Block("01/01/2020","Genesis Block","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    addBlock(newBlock){
        newBlock.previousHash=this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    addExistingBlockToChain(existingBlock)
    {
        this.chain.push(existingBlock);
    }

    isChainValid(){
        for(let i=1;i<this.chain.length;i++)
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(currentBlock.hash!==currentBlock.calculateHash())
            {
                return false;
            }
            if(currentBlock.previousHash!== previousBlock.hash)
            {
                return false;
            }
        }
        return true;
    }

    

    initLocalChain()
    {
        let dataSrc = JSON.parse(fs.readFileSync('blockchain.json'));
        //console.log('data src = ',dataSrc);
        if(dataSrc['chain']!=undefined && dataSrc['chain'].length>0)
        {
            for(let i=1;i<dataSrc['chain'].length;i++)
            {
                let block = new Block('','','');
                block = block.initBlock(dataSrc['chain'][i].timestamp,dataSrc['chain'][i].data,dataSrc['chain'][i].previousHash,dataSrc['chain'][i].hash,dataSrc['chain'][i].nonce);
                console.log('Block in memory ',block);
                this.addExistingBlockToChain(block);
            }
        }
        //console.log('chain in memory ',this.chain);
       
       
    }

    // will clear data of current localchain
    initChainFromDataSrc(dataSrc)
    {
        for(let i=1;i<dataSrc['chain'].length;i++)
        {
            let block = new Block('','','');
            block = block.initBlock(dataSrc['chain'][i].timestamp,dataSrc['chain'][i].data,dataSrc['chain'][i].previousHash,dataSrc['chain'][i].hash,dataSrc['chain'][i].nonce);
            this.addExistingBlockToChain(block);
        }
        
        
    }

    static matchChain(source1,source2)
    {
        if(source1.isChainValid() && source2.isChainValid())
        {
            //console.log('both chain passed data integrity ');
            return true;

        }
        else
        {
            return false;
        }
    }

    static isBothChainIdentical(source1,source2)
    {
        //console.log(source1.chain.length);
        //console.log(source2.chain.length);
        if(source1.chain.length==source2.chain.length && Blockchain.matchChain(source1,source2))
        {
            for(let i=1;i<source1.chain.length;i++)
            {
                const src1CurrentBlock = source1.chain[i];
                const src2CurrentBlock = source2.chain[i];
                
                if(src1CurrentBlock.hash!==src2CurrentBlock.hash)
                {
                    return false;
                }
                
            }
            return true;
        }
        else
        {
            return false;
        }
    }

}


module.exports.Blockchain = Blockchain;
module.exports.Block= Block;



