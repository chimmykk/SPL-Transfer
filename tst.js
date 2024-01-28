const { Keypair } = require("@solana/web3.js");
const bs58 = require('bs58');

const secretKey = "enter the secret key";
const decodedSecretKey = bs58.decode(secretKey);
const uint8ArraySecretKey = new Uint8Array(decodedSecretKey);
const keypair = Keypair.fromSecretKey(uint8ArraySecretKey);

console.log(keypair);

//copy the secret key and then paste it on the app.ts
// under secret= []