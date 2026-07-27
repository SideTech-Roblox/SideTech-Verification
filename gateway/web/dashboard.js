const express = require("express");
const router = express.Router();

const { render, loginBody, dashboardBody, errorBody } = require("../lib/page");
const { fetchRobloxProfile } = require("../lib/roblox");
const { findByDiscord, configsOf, cooldownRemaining, isDeleted } = require("../lib/verification");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.get('/dashboard', RateLimiter, async (req, res) => {
    try {
        const status = typeof req.query.status === "string" ? req.query.status : null;

        if (!req.session.DiscordId) {
            return res.send(render({ title: "Login", body: loginBody(status) }));
        }

        const found = await findByDiscord(req.session.DiscordId);

        const tombstone = found && isDeleted(found) ? found : null;
        const record = tombstone ? null : found;

        if (record) {
            req.session.UID = record["_id"];

            if (req.session.RobloxId !== record["data"]["roblox"]) {
                req.session.RobloxId = record["data"]["roblox"];
                delete req.session.RobloxProfile;
            }
        } else {
            delete req.session.UID;
            delete req.session.RobloxId;
            delete req.session.RobloxProfile;
        }

        const robloxId = req.session.RobloxId || null;

        if (robloxId && !req.session.RobloxProfile) {
            req.session.RobloxProfile = await fetchRobloxProfile(robloxId);
        }

        const lockedUntil = cooldownRemaining(record || tombstone || {});
        const configs = record ? configsOf(record) : null;

        const body = dashboardBody({
            status: status,
            uid: req.session.UID || null,
            lockedUntil: lockedUntil ? lockedUntil * 1000 : 0,
            accountStatus: configs ? configs.status : null,
            publicLookup: configs ? configs.publicLookup : true,
            tab: req.query.tab === "settings" ? "settings" : "account",
            discord: {
                id: req.session.DiscordId,
                name: req.session.DiscordName || "Unknown",
                username: req.session.DiscordUsername || null,
                avatar: req.session.DiscordAvatar || null
            },
            roblox: robloxId ? {
                id: robloxId,
                name: req.session.RobloxProfile?.name || "Unknown",
                username: req.session.RobloxProfile?.username || null,
                avatar: req.session.RobloxProfile?.avatar || null
            } : null
        });

        return res.send(render({ title: "Verification", body: body }));
    } catch (error) {
        console.error(error);
        return res.status(500).send(render({ title: "Error", body: errorBody() }));
    }
});

module.exports = router;
