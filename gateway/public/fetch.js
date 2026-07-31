const { SERVICE_KEY } = require("../lib/config");

const express = require("express");
const router = express.Router();

const { shape, findByUid, findByRoblox, findByDiscord, visibleTo } = require("../lib/verification");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => isService(req)
});

function isService(req) {
    const provided = req.headers['authorization'];
    return Boolean(provided) && provided === SERVICE_KEY;
}

router.get('/api/fetch', RateLimiter, async (req, res) => {
    try {
        const authenticated = isService(req);

        const uid = req.query.uid;
        const robloxid = req.query.robloxid;
        const discordid = req.query.discordid;

        if (!uid && !robloxid && !discordid) {
            return res.status(400).json({ status: "400", message: "No query parameter provided! (uid/robloxid/discordid)" });
        }

        let record = null;
        let notFound = "No data found for the given UID.";

        if (uid) {
            record = await findByUid(uid);
        } else if (robloxid) {
            record = await findByRoblox(robloxid);
            notFound = "No data found for the given RobloxID.";
        } else {
            record = await findByDiscord(discordid);
            notFound = "No data found for the given DiscordID.";
        }

        const visible = visibleTo(record, authenticated);

        if (!visible) {
            return res.status(404).json({ status: "404", message: notFound });
        }

        return res.status(200).json({
            status: "200",
            message: "Success!",
            data: shape(visible, { includeConfigs: authenticated })
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});

module.exports = router;
