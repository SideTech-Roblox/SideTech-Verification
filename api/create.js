const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const access_file = require("../secret/access.json");

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

router.post('/api/create', RateLimiter, async (req, res) => {
    try {
        if (req.headers['authorization'] != access_file.api_key) {
            return res.status(401).json({ status: "401", message: "Unauthorized!" });
        }

        const uid = req.query.uid;
        const robloxid = req.query.robloxid;
        const discordid = req.query.discordid;

        const Fetch_Database = getFirestore();

        const Verification_Collection = Fetch_Database.collection('Verification');
        const Verification_Snapshot = await Verification_Collection.get();

        let foundRoblox = false;
        let foundDiscord = false;

        Verification_Snapshot.forEach(function (doc) {
            if (doc.data().roblox == robloxid && !foundRoblox) {
                foundRoblox = true;
                return res.status(409).json({ status: "409", message: "Provided RobloxId is already verified!" });
            }

            if (doc.data().discord == discordid && !foundDiscord) {
                foundDiscord = true;
                return res.status(409).json({ status: "409", message: "Provided DiscordId is already verified!" });
            }
        });

        if (!foundRoblox && !foundDiscord) {
            if (uid) {
                const uid_DOC = Verification_Collection.doc(uid);
                const uid_DATA = await uid_DOC.get();

                if (!uid_DATA.exists) {
                    return res.status(404).json({ status: "404", message: "No data found for the given UID." });
                };

                if (robloxid) {
                    const update_data = await uid_DOC.update({
                        roblox: `${robloxid}`
                    });
                };

                if (discordid) {
                    const update_data = await uid_DOC.update({
                        discord: `${discordid}`
                    });
                };

                const refresh_uid_DATA = await uid_DOC.get();
                return res.status(200).json({ status: "200", message: "Success!", data: { uid: refresh_uid_DATA.id, roblox: (await refresh_uid_DATA.get()).data().roblox || null, discord: (await refresh_uid_DATA.get()).data().discord || null } });
            } else {
                if (!robloxid) {
                    return res.status(400).json({ status: "400", message: "Missing query parameter! (robloxid/discordid)" });
                };

                if (!discordid) {
                    return res.status(400).json({ status: "400", message: "Missing query parameter! (robloxid/discordid)" });
                };

                const create_data = await Verification_Collection.add({
                    discord: `${discordid}`,
                    roblox: `${robloxid}`
                });

                return res.status(200).json({ status: "200", message: "Success!", data: { uid: create_data.id, roblox: (await create_data.get()).data().roblox || null, discord: (await create_data.get()).data().discord || null } });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;