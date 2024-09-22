// Database
const { initializeApp, cert } = require('firebase-admin/app');
const firebase_Account = require("./secret/firebase.json");

initializeApp({
  credential: cert(firebase_Account)
});

// Server
const express = require('express');

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.use("/", require("./api/create"));
app.use("/", require("./api/delete"));
app.use("/", require("./api/fetch"));

app.listen(777, () => console.log(`:: SideTech :: Verification system is online!`));