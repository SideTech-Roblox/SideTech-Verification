const express = require('express');

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.use("/", require("./gateway/internal/create"));
app.use("/", require("./gateway/internal/delete"));
app.use("/", require("./gateway/public/fetch"));

app.listen(65348, () => console.log(`✅ | :: System - (Verification) :: | Service is online!`));