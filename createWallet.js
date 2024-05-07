const { Keypair } = require('@solana/web3.js');

// Generate a new key pair
const keypair = Keypair.generate();

// Extract the public and private key
const publicKey = keypair.publicKey.toBase58();
const secretKey = keypair.secretKey;

// Display the keys
console.log("Public Key:", publicKey);
console.log("Secret Key:", Buffer.from(secretKey).toString('hex'));
