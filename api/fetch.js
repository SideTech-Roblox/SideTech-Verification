const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

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
            const Fetch_Database = getFirestore();

            const Verification_Collection = Fetch_Database.collection('Verification');
            const Verification_Snapshot = await Verification_Collection.get();

            if (uid) {
                const uid_DOC = Verification_Collection.doc(uid);
                const uid_DATA = await uid_DOC.get();

                if (uid_DATA.exists) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: uid_DATA.id, roblox: uid_DATA.data().roblox || null, discord: uid_DATA.data().discord || null } });
                } else {
                    return res.status(404).json({ status: "404", message: "No data found for the given UID." });
                }
            } else if (robloxid) {
                let getUID = null;

                Verification_Snapshot.forEach(function (doc) {
                    if (doc.data().roblox == robloxid) {
                        getUID = doc.id
                    }
                });

                if (getUID == null) {
                    return res.status(404).json({ status: "404", message: "No data found for the given RobloxID." });
                };

                const uid_DOC = Verification_Collection.doc(getUID);
                const uid_DATA = await uid_DOC.get();

                if (uid_DATA.exists) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: uid_DATA.id, roblox: uid_DATA.data().roblox || null, discord: uid_DATA.data().discord || null } });
                } else {
                    return res.status(404).json({ status: "404", message: "No data found for the given RobloxID." });
                }
            } else if (discordid) {
                let getUID = null;

                Verification_Snapshot.forEach(function (doc) {
                    if (doc.data().discord == discordid) {
                        getUID = doc.id
                    }
                });

                if (getUID == null) {
                    return res.status(404).json({ status: "404", message: "No data found for the given DiscordID." });
                };

                const uid_DOC = Verification_Collection.doc(getUID);
                const uid_DATA = await uid_DOC.get();

                if (uid_DATA.exists) {
                    return res.status(200).json({ status: "200", message: "Success!", data: { uid: uid_DATA.id, roblox: uid_DATA.data().roblox || null, discord: uid_DATA.data().discord || null } });
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