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
        const QueryCallback = req.query.callback;
        const { UID, RobloxId, DiscordId, Callback } = req.session;

        if (QueryCallback) {
            Callback = QueryCallback;
        };

        if (!UID) {
            if (!DiscordId) {
                return res.redirect('https://discord.com/oauth2/authorize?client_id=1340683656624078868&response_type=code&redirect_uri=https%3A%2F%2Fverification.sidetechroblox.com%2Fverify%2Fdiscord&scope=identify+openid');
            }

            if (!RobloxId) {
                return res.redirect('https://apis.roblox.com/oauth/v1/authorize?client_id=3217771915304835690&redirect_uri=https://verification.sidetechroblox.com/verify/roblox&scope=openid%20profile&response_type=code');
            }

            const dataCreate = await fetch(`https://verification.sidetechroblox.com/api/create?robloxid=${RobloxId}&discordid=${DiscordId}`, {
                method: 'POST',
                headers: {
                    'authorization': access_file.api_key
                }
            });

            UID = dataCreate.body.data.uid
        }

        if (Callback) {
            return res.redirect(Callback);
        } else {
            return res.status(200).json({ status: "200", message: "Verified!" });
        }
    } catch (error) {
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;