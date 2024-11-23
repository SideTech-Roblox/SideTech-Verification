const MongoDB_Client = require('../../mongodb/initiate');
const Verification = MongoDB_Client.db("SideTech").collection("Verification");

const express = require("express");
const router = express.Router();

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.get('/api/fetch', RateLimiter, async (req, res) => {
    try {
        const uid = req.query.uid;
        const robloxid = req.query.robloxid;
        const discordid = req.query.discordid;

        if (!uid && !robloxid && !discordid) {
            return res.status(400).json({ status: "400", message: "No query parameter provided! (uid/robloxid/discordid)" });
        } else {
            if (uid) {
                const FetchData = await Verification.findOne({ "_id": uid });

                if (FetchData) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
                } else {
                    return res.status(404).json({ status: "404", message: "No data found for the given UID." });
                }
            } else if (robloxid) {
                const FetchData = await Verification.findOne({ "data.roblox": robloxid });

                if (FetchData) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
                } else {
                    return res.status(404).json({ status: "404", message: "No data found for the given RobloxID." });
                }
            } else if (discordid) {
                const FetchData = await Verification.findOne({ "data.discord": discordid });

                if (FetchData) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
                } else {
                    return res.status(404).json({ status: "404", message: "No data found for the given DiscordID." });
                }
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;