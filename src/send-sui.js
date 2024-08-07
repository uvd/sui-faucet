const transactions = require('@mysten/sui.js/transactions');
const sui_client = require('@mysten/sui.js/client');
const ed25519 = require('@mysten/sui.js/keypairs/ed25519')
const utils = require('@mysten/sui.js/utils');

const secret = process.env.ADDRESS_SECRET
const keypair = ed25519.Ed25519Keypair.fromSecretKey(utils.fromHEX(secret));
const rpcUrl = sui_client.getFullnodeUrl('testnet');
const client = new sui_client.SuiClient({url: rpcUrl});

const pool = [];

const address_set = new Set()

module.exports = {
    send
}

async function send(address, amount) {
    if (!address_set.has(address)){
        pool.push({to: address, amount})
        address_set.add(address);
    }
}

async function sendSui() {
    if (pool.length == 0) {
        return
    }
    const length = pool.length;
    let transfers;
    if (length > 100) {
        transfers = pool.splice(0, 100)
    } else {
        transfers = pool.splice(0, length)
    }

    try {
        const txb = new transactions.TransactionBlock();
        const coins = txb.splitCoins(txb.gas, transfers.filter((transfer)=> !isNaN(transfer.amount)).map((transfer) => transfer.amount * 1000000000),);
        // next, create a transfer transaction for each coin
        transfers.forEach((transfer, index) => {
               txb.transferObjects([coins[index]], transfer.to);
        });
        await client.signAndExecuteTransactionBlock({signer: keypair, transactionBlock: txb});
    } catch (e) {
        console.error(e)
    }
}

setInterval(sendSui, 1000*10)

setInterval(()=>{
    address_set.clear();
},1000*120)
