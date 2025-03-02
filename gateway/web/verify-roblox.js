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

router.get('/verify/roblox', RateLimiter, async (req, res) => {
    try {
        const code = req.query.code;
        if (code) {
            const response = await fetch('https://apis.roblox.com/oauth/v1/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(access_file.roblox_client + ":" + access_file.roblox_secret)}`
                },
                body: new URLSearchParams({
                    'grant_type': 'authorization_code',
                    'code': code
                }).toString()
            })

            if (response.ok) {
                const tokenData = await response.json();
                const userInfoResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });

                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json();
                    const FetchData = await Verification.findOne({ "data.roblox": userInfo.sub });

                    if (FetchData) {
                        req.session.UID = FetchData["_id"]
                        req.session.RobloxId = FetchData["data"]["roblox"]
                        req.session.DiscordId = FetchData["data"]["discord"]
                    } else {
                        req.session.RobloxId = userInfo.sub
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