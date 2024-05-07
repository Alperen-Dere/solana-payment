const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

async function sendUSDCMultiSend(senderKeypair, transfers) {
    const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
    const transaction = new web3.Transaction();

    // Sender's USDC token account address
    const senderTokenAccountAddress = new web3.PublicKey('7PRJF3eUnh9dpqMeUED6bNwZGfvysGNCmCoFREoC1PTX');

    for (let { recipientTokenAccountAddress, amount } of transfers) {
        const recipientPublicKey = new web3.PublicKey(recipientTokenAccountAddress);

        // Add the SPL Token transfer instruction to the transaction
        transaction.add(
            splToken.createTransferInstruction(
                senderTokenAccountAddress, // Sender's token account address
                recipientPublicKey, // Recipient's token account address
                senderKeypair.publicKey, // Sender's wallet public key (authority)
                amount, // Amount to send (in smallest unit of the token)
                [], // Passing an empty array for multisig owners, since not used
                splToken.TOKEN_PROGRAM_ID // Token program ID
            )
        );
    }

    // Sign and send the transaction
    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [senderKeypair] // Only sender is required to sign
    );

    console.log(`Transaction successful with signature: ${signature}`);
}

// Example usage
const secretKeyArray = Uint8Array.from([ ]);
const senderKeypair = web3.Keypair.fromSecretKey(secretKeyArray);

const transfers = [
    { recipientTokenAccountAddress: 'CbnSGQyXNbN9VUNrPqVHwM9ExmSgvJh3U2kXZ5ZyTf5j', amount: 5000000 }, // for 5 USDC
    { recipientTokenAccountAddress: '9mtjW4zcV8DcBJPY1u6fRZkXFVPZ1uv9qJtfeC4z4bjM', amount: 1000000 }  // for 1 USDC
];

sendUSDCMultiSend(senderKeypair, transfers);
