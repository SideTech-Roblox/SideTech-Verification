const { ObjectId } = require('mongodb');
const MongoDB_Client = require('../../mongodb/initiate');
const Verification = MongoDB_Client.db("SideTech").collection("Verification");

const access_file = require("../../secret/access.json");

const express = require("express");
const router = express.Router();

router.post('/api/create', async (req, res) => {
    try {
        if (req.headers['authorization'] != access_file.api_key) {
            return res.status(401).json({ status: "401", message: "Unauthorized!" });
        }

        const uid = req.query.uid;
        const robloxid = req.query.robloxid;
        const discordid = req.query.discordid;

        const foundRoblox = await Verification.findOne({ "data.roblox": robloxid });
        const foundDiscord = await Verification.findOne({ "data.discord": discordid });

        if (foundRoblox) {
            return res.status(409).json({ status: "409", message: "Provided RobloxId is already verified!" });
        };

        if (foundDiscord) {
            return res.status(409).json({ status: "409", message: "Provided DiscordId is already verified!" });
        };

        if (!foundRoblox && !foundDiscord) {
            if (uid) {
                const foundUID = await Verification.findOne({ "_id": uid });

                if (!foundUID) {
                    return res.status(404).json({ status: "404", message: "No data found for the given UID." });
                };

                if (robloxid) {
                    await Verification.updateOne(
                        { "_id": uid },
                        {
                            $set: { "data.roblox": `${robloxid}` }
                        }
                    );
                };

                if (discordid) {
                    await Verification.updateOne(
                        { "_id": uid },
                        {
                            $set: { "data.discord": `${discordid}` }
                        }
                    );
                };

                const FetchData = await Verification.findOne({ "_id": uid });
                return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
            } else {
                if (!robloxid) {
                    return res.status(400).json({ status: "400", message: "Missing query parameter! (robloxid/discordid)" });
                };

                if (!discordid) {
                    return res.status(400).json({ status: "400", message: "Missing query parameter! (robloxid/discordid)" });
                };

                await Verification.insertOne(
                    {
                        _id: `${new ObjectId().toString()}`,
                        data: {
                            discord: `${discordid}`,
                            roblox: `${robloxid}`
                        }
                    }
                );

                const FetchData = await Verification.findOne({ "data.roblox": robloxid });
                return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;