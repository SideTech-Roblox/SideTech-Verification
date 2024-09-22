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

router.delete('/api/delete', RateLimiter, async (req, res) => {
    try {
        if (req.headers['authorization'] != access_file.api_key) {
            return res.status(401).json({ status: "401", message: "Unauthorized!" });
        }

        const uid = req.query.uid;

        if (!uid) {
            return res.status(400).json({ status: "400", message: "No query parameter provided! (uid)" });
        } else {
            const Fetch_Database = getFirestore();

            const Verification_Collection = Fetch_Database.collection('Verification');

            const uid_DOC = Verification_Collection.doc(uid);
            const uid_DATA = await uid_DOC.get();

            if (uid_DATA.exists) {
                await uid_DOC.delete();
                return res.status(200).json({ status: "200", message: "Success!", data: { uid: uid_DATA.id, roblox: uid_DATA.data().roblox || null, discord: uid_DATA.data().discord || null } });
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