const express = require("express");
const router = express.Router();

const access_file = require("../../secret/access.json");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.get('/dashboard', RateLimiter, async (req, res) => {
    try {
        const { UID, RobloxId, DiscordId } = req.session;

        if (!UID) {
            if (!DiscordId) {
                return res.redirect('https://discord.com/oauth2/authorize?client_id=1340683656624078868&response_type=code&redirect_uri=https%3A%2F%2Fverification.sidetechroblox.com%2Fverify%2Fdiscord&scope=identify+openid');
            }

            if (!RobloxId) {
                return res.redirect('https://apis.roblox.com/oauth/v1/authorize?client_id=3217771915304835690&redirect_uri=https://verification.sidetechroblox.com/verify/roblox&scope=openid%20profile&response_type=code');
            }

            let dataCreate = await fetch(`https://verification.sidetechroblox.com/api/create?robloxid=${RobloxId}&discordid=${DiscordId}`, {
                method: 'POST',
                headers: {
                    'authorization': access_file.api_key
                }
            });

            dataCreate = await dataCreate.json();
            req.session.UID = dataCreate.data.uid;
        }

        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verification Dashboard</title>
            </head>
            <body>
                <h1>Verification Successful!</h1>
                <p><strong>Status:</strong> Verified</p>
                <p><strong>Roblox ID:</strong> ${RobloxId}</p>
                <p><strong>Discord ID:</strong> ${DiscordId}</p>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;