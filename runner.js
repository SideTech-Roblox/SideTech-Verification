const express = require('express');
const session = require('express-session');

const access_file = require("./secret/access.json");

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.use(session({
    name: '.SIDETECH',
    secret: access_file.session_key,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 3600000,
    }
}));

app.use("/", require("./gateway/internal/create"));
app.use("/", require("./gateway/internal/delete"));
app.use("/", require("./gateway/public/fetch"));

app.use("/", require("./gateway/web/dashboard"));
app.use("/", require("./gateway/web/verify-discord"));
app.use("/", require("./gateway/web/verify-roblox"));

app.listen(65348, () => console.log(`✅ | :: System - (Verification) :: | Service is online!`));