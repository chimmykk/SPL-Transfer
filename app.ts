import { Connection, Keypair, ParsedAccountData, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
var secret = [ 0,0];
const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
console.log(`My public key is: ${FROM_KEYPAIR.publicKey.toString()}.`);
const QUICKNODE_RPC = 'https://solana-mainnet.g.alchemy.com/v2/F7d6zXGka1Trjja3PHsgREIC521SrKak';
// update the rpc node based on (main-net/devnet)
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);

const DESTINATION_WALLET = 'AnqDhc9zvUpEiGAqHD1yEqmJVYaxKPfUszG3iEEBAocH';
const MINT_ADDRESS = '"Cva8hRDik6KhMJPrRyN3SebKQJyhNcJzzMh74eaVQN6Z"'; // You must change this value!
const TRANSFER_AMOUNT = 1;
// depends on amount

// can update based on real -time balance by fetching it


async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await SOLANA_CONNECTION.getParsedAccountInfo(new PublicKey(mintAddress));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}

async function sendTokens() {
    console.log(`Sending ${TRANSFER_AMOUNT} tokens from ${FROM_KEYPAIR.publicKey.toString()} to ${DESTINATION_WALLET}.`);
    
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

    console.log(`2 - Getting Destination Token Account`);
    let destinationAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(DESTINATION_WALLET)
    );
    console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`   Number of Decimals: ${numberDecimals}`);

    console.log(`4 - Creating and Sending Transaction`);

    const tx = new Transaction();
    
    tx.add(createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        FROM_KEYPAIR.publicKey,
        TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
    ));

    const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
    console.log(`   Latest Blockhash: ${latestBlockHash.blockhash}`);
    
    tx.recentBlockhash = latestBlockHash.blockhash;

    try {
        const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [FROM_KEYPAIR]);
        console.log(
            '\x1b[32m', //Green Text
            `   Transaction Success!🎉`,
            `\n     https://explorer.solana.com/tx/${signature}?cluster=mainnet` // mainnet //devnet
        );
    } catch (error) {
        console.error('\x1b[31m', `   Transaction Failed: ${error}`);
    }
}

sendTokens();
