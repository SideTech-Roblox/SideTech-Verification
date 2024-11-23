const MongoDB_Client = require('../../mongodb/initiate');
const Verification = MongoDB_Client.db("SideTech").collection("Verification");

const access_file = require("../../secret/access.json");

const express = require("express");
const router = express.Router();

router.delete('/api/delete', async (req, res) => {
    try {
        if (req.headers['authorization'] != access_file.api_key) {
            return res.status(401).json({ status: "401", message: "Unauthorized!" });
        }

        const uid = req.query.uid;

        if (!uid) {
            return res.status(400).json({ status: "400", message: "No query parameter provided! (uid)" });
        } else {
            const FetchData = await Verification.findOne({ "_id": uid });

            if (FetchData) {
                await Verification.deleteOne(
                    { "_id": uid }
                );

                return res.status(200).json({ status: "200", message: "Success!", data: { uid: FetchData["_id"], roblox: FetchData["data"]["roblox"], discord: FetchData["data"]["discord"] } });
            } else {
                return res.status(404).json({ status: "404", message: "No data found for the given UID." });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;