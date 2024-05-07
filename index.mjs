import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    Keypair
  } from '@solana/web3.js';
  import fs from 'fs/promises';
  
  const connection = new Connection("https://api.testnet.solana.com/", "confirmed");
  
  // Function to read accounts from a JSON file
  async function readAccountsFromFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading accounts from file:", error);
      return {};
    }
  }
  
  // Function to validate Solana addresses
  function validateSolanaAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Function to log invalid addresses to a file
  async function logInvalidAddress(address, invalidAddressesPath) {
    try {
      const entry = `${address}\n`;
      await fs.appendFile(invalidAddressesPath, entry, 'utf8');
    } catch (error) {
      console.error(`Error writing invalid address ${address} to file:`, error);
    }
  }
  
  async function sendCoinsToAccounts(sender, senderKeyPair, filePath, invalidAddressesPath) {
    try {
      const accounts = await readAccountsFromFile(filePath);
      const transaction = new Transaction();
  
      for (const [recipientAddress, amount] of Object.entries(accounts)) {
        if (!validateSolanaAddress(recipientAddress)) {
          console.log(`Invalid Solana address: ${recipientAddress}`);
          await logInvalidAddress(recipientAddress, invalidAddressesPath);
          continue;
        }
  
        const recipientPublicKey = new PublicKey(recipientAddress);
        const lamports = amount * LAMPORTS_PER_SOL; // Convert SOL to lamports
        console.log("Sending", amount, "SOL to", recipientAddress);
  
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipientPublicKey,
          lamports,
        });
  
        transaction.add(transferInstruction);
      }
  
      // Sign and send the transaction
      console.log("Sending transaction...");
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeyPair]);
      console.log("Transaction confirmed with signature:", signature);
    } catch (error) {
      console.error("Error during transaction:", error);
    }
  }
  
  // Example usage (make sure to replace with actual data)
  const secretKeyUint8Array = Uint8Array.from(Buffer.from('', 'hex'));
  const senderKeyPair = Keypair.fromSecretKey(secretKeyUint8Array);
  const senderPublicKey = new PublicKey('');

  sendCoinsToAccounts(senderPublicKey, senderKeyPair, 'rewards.json', 'invalid_addresses.json');
  