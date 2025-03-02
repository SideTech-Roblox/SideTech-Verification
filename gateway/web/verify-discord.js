const MongoDB_Client = require('../../mongodb/initiate');
const Verification = MongoDB_Client.db("SideTech").collection("Verification");

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

router.get('/verify/discord', RateLimiter, async (req, res) => {
    try {
        const code = req.query.code;
        if (code) {
            const response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(access_file.discord_client + ":" + access_file.discord_secret)}`
                },
                body: new URLSearchParams({
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': 'https://verification.sidetechroblox.com/verify/discord'
                }).toString()
            })

            if (response.ok) {
                const tokenData = await response.json();
                const userInfoResponse = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });
    
                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json();
                    const FetchData = await Verification.findOne({ "data.discord": userInfo.id });

                    if (FetchData) {
                        req.session.UID = FetchData["_id"]
                        req.session.RobloxId = FetchData["data"]["roblox"]
                        req.session.DiscordId = FetchData["data"]["discord"]
                    } else {
                        req.session.DiscordId = userInfo.id
                    }

                    return res.redirect('/dashboard');
                } else {
                    return res.redirect('/dashboard');
                }
            } else {
                return res.redirect('/dashboard');
            }
        } else {
            return res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        return res.redirect('/dashboard');
    }
});

module.exports = router;