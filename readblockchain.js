// const { ethers } = require("ethers");
// const provider = new ethers.JsonRpcProvider
// (
//     `https://mainnet.infura.io/v3/03fa3a22367e48358018784d7d0212da`
//     );

// const currentblock = async () => {

//     // const block = await provider.getBlockNumber();

//     // console.log("current  Ethereum block_no :",block);

//     const balance = await provider.getBalance("0x1856Fa9C3f30B54a780C8fD64A78a4E14B4168Ea");
//     const balance_ether = ethers.formatEther(balance);
//      console.log("balace  ",balance_ether);

// };

// currentblock();
// var blockss =0;
// provider.getBlockNumber().then((blockNumber) => {
//     blockss = blockNumber;
//     console.log("Current Block Number:", blockNumber);
//     console.log("Current Block Number:", blockNumber-1);
//     blockNumber.
// });
//     // Get block information for the current block

//     for (let i = 0; i <5; i++) {
//     provider.getBlock(blockss-i).then((block) => {
//       console.log("Current Block Information:", block);
      
//     });
// }
const { ethers } = require("ethers");
const mongoose = require("mongoose");
const express = require("express");

const app = express();
const port = 3000; // Choose a port for your server

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/maxblock", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected");

    // Run the function every 2 minutes
    setInterval(fetchAndSaveData, 2 * 60 * 1000);

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Create the Mongoose model outside the function
const saveBlockNumberSchema = new mongoose.Schema({
  name: {
    type: Number,
  },
  insertedAt: {
    type: Date,
    default: Date.now,
  },
});

const collection = mongoose.model("tut", saveBlockNumberSchema);

// Function to fetch block data and save to MongoDB
const fetchAndSaveData = async () => {
  const provider = new ethers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/03fa3a22367e48358018784d7d0212da"
  );

  let maxTransactions = 0;
  let blockNumberWithMaxTransaction = 0;

  // Get the current block number
  const blockNumber = await provider.getBlockNumber();
  console.log("Current Block Number:", blockNumber);

  // Iterate through the last 5 blocks
  for (let i = 0; i < 5; i++) {
    const currentBlockNumber = blockNumber - i;

    // Get block information for the current block
    const block = await provider.getBlock(currentBlockNumber);

    console.log("Block Number:", currentBlockNumber);
    console.log("Transaction Count:", block.transactions.length);

    // Check if this block has more transactions than the current maximum
    if (block.transactions.length > maxTransactions) {
      maxTransactions = block.transactions.length;
      blockNumberWithMaxTransaction = currentBlockNumber;
    }

    // Check if this is the last iteration
    if (i === 4) {
      // Print information about the block with the maximum transactions
      console.log("Max Transaction Block:", blockNumberWithMaxTransaction);

      const data = {
        name: blockNumberWithMaxTransaction,
      };

      // Insert the data into the collection with the insertion date and time
      try {
        const docs = await collection.insertMany([data]);
        console.log("Data inserted successfully:", docs);
      } catch (error) {
        console.error("Error inserting data:", error);
      }
    }
  }
};

// Define an API endpoint to render HTML with MongoDB data
app.get("/api/data", async (req, res) => {
  try {
    const data = await collection.find().exec();
    const html = `<html><body><h1>MongoDB Data</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
