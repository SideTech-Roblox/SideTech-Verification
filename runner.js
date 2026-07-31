const path = require('node:path');

require('@dotenvx/dotenvx').config({
    path: path.join(__dirname, '.env'),
    envKeysFile: path.join(__dirname, '.env.keys')
});

const express = require('express');
const session = require('express-session');

const { SESSION_KEY } = require("./gateway/lib/config");

const app = express();

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false }));

app.use(session({
    name: '.SIDETECH',
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 3600000
    }
}));

app.use("/", require("./gateway/public/fetch"));

app.use("/", require("./gateway/web/login"));
app.use("/", require("./gateway/web/dashboard"));
app.use("/", require("./gateway/web/verify-discord"));
app.use("/", require("./gateway/web/verify-roblox"));

app.listen(65348, () => console.log(`✅ | :: System - (Verification) :: | Service is online!`));