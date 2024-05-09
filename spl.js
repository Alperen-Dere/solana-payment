// Write JavaScript Code
const bs58 = require('bs58');
const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
} = require("@solana/web3.js");
const fs = require('fs');

const { getOrCreateAssociatedTokenAccount, transfer } = require("@solana/spl-token");

const PRIVATE_KEY = ""; // Your private key in Base58 encoding
// The address of the USDC token on Solana Devnet
const USDC_DEV_PUBLIC_KEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
// Convert the private key from Base58 to a byte array and create a Keypair
const senderPrivateKeyBytes = bs58.decode(PRIVATE_KEY);
const senderKeypair = Keypair.fromSecretKey(senderPrivateKeyBytes);
// Create a new connection to the Solana Mainnet
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// Read the rewards.json file
const rewards = JSON.parse(fs.readFileSync('rewards.json', 'utf8'));

(async () => {
    try {
        // Fetch the sender's USDC token account
        const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            senderKeypair,
            new PublicKey(USDC_DEV_PUBLIC_KEY),
            senderKeypair.publicKey,
        );

        for (let i = 0; i < rewards.length; i++) {
            // Fetch or create the receiver's associated token account for USDC
            const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                senderKeypair,
                new PublicKey(USDC_DEV_PUBLIC_KEY),
                new PublicKey(rewards[i].publicKey),
                true, // Allow creating a token account for the receiver if it doesn't exist
            );
            // Perform the transfer
            const signature = await transfer(
                connection,
                senderKeypair,
                senderTokenAccount.address,
                receiverTokenAccount.address,
                senderKeypair.publicKey,
                rewards[i].amount * 1_000_000, // Multiply the amount by 1,000,000
            );
            // Log the transaction signature and the receiver's address
            console.log(`Transaction signature: ${signature}`);
            console.log(`Sent to address: ${rewards[i].publicKey}`);
            console.log(`You can verify the transaction on https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        }
    } catch (error) {
        console.error("Error performing the transfer:", error);
    }
})();