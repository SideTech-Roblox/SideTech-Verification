const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const express = require("express");
const router = express.Router();

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 25,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.delete('/api/delete', RateLimiter, async (req, res) => {
    try {
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
                return res.status(200).json({ status: "200", message: "Success!", data: {} });
            } else {
                return res.status(404).json({ status: "404", message: "No data found for the given UID." });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;