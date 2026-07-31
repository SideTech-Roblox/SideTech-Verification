const express = require("express");
const router = express.Router();

const { WEB_URL } = require("../lib/config");
const { createState, discordAuthorizeURL, robloxAuthorizeURL } = require("../lib/oauth");
const { findByDiscord, configsOf, cooldownRemaining, isDeleted, isRestricted, setPublicLookup, deleteLink } = require("../lib/verification");
const { render, relinkWarningBody, deleteBody, restrictedBody, DELETE_PHRASE } = require("../lib/page");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

async function liveRecordFor(discordId) {
    const record = await findByDiscord(discordId);
    return record && !isDeleted(record) ? record : null;
}

router.get('/login', RateLimiter, async (req, res) => {
    const verifying = req.query.flow === "verify";
    const returnTo = verifying ? "/link/roblox" : "/dashboard";

    if (req.session.DiscordId) {
        if (!verifying) return res.redirect('/dashboard');

        const existing = await liveRecordFor(req.session.DiscordId);
        return res.redirect(existing ? '/dashboard' : '/link/roblox');
    }

    const state = createState(req, "discord", returnTo);
    return res.redirect(discordAuthorizeURL(state));
});

router.get('/link/roblox', RateLimiter, async (req, res) => {
    if (!req.session.DiscordId) {
        return res.redirect('/login');
    }

    const existing = await liveRecordFor(req.session.DiscordId);

    if (existing && existing["data"]["roblox"]) {
        return res.redirect('/relink/roblox');
    }

    const tombstone = await findByDiscord(req.session.DiscordId);

    if (tombstone && cooldownRemaining(tombstone)) {
        return res.redirect('/dashboard?status=cooldown');
    }

    const state = createState(req, "roblox", "/dashboard", { intent: "link" });
    return res.redirect(robloxAuthorizeURL(state));
});

router.get('/relink/:platform', RateLimiter, async (req, res) => {
    const platform = req.params.platform;

    if (platform !== "roblox" && platform !== "discord") {
        return res.redirect('/dashboard');
    }

    if (!req.session.DiscordId) {
        return res.redirect('/login');
    }

    const record = await liveRecordFor(req.session.DiscordId);

    if (!record) {
        return res.redirect('/dashboard');
    }

    if (isRestricted(record)) {
        return res.send(render({ title: "Restricted", body: restrictedBody() }));
    }

    if (cooldownRemaining(record)) {
        return res.redirect('/dashboard?status=cooldown');
    }

    if (req.query.confirm !== "1") {
        return res.send(render({
            title: "Relink",
            body: relinkWarningBody(platform)
        }));
    }

    const state = createState(req, platform, "/dashboard", { intent: "relink", uid: record["_id"] });

    return res.redirect(platform === "roblox" ? robloxAuthorizeURL(state) : discordAuthorizeURL(state));
});

router.post('/lookup', RateLimiter, async (req, res) => {
    if (!req.session.DiscordId) {
        return res.redirect('/login');
    }

    const record = await liveRecordFor(req.session.DiscordId);

    if (!record) {
        return res.redirect('/dashboard');
    }

    const wanted = !configsOf(record).publicLookup;
    const { status } = await setPublicLookup(record["_id"], wanted);

    if (status !== "updated") {
        return res.redirect('/dashboard?status=failed');
    }

    return res.redirect(wanted ? '/dashboard?status=public' : '/dashboard?status=private');
});

router.get('/delete', RateLimiter, async (req, res) => {
    if (!req.session.DiscordId) {
        return res.redirect('/login');
    }

    const record = await liveRecordFor(req.session.DiscordId);

    if (!record) {
        return res.redirect('/dashboard');
    }

    if (isRestricted(record)) {
        return res.send(render({ title: "Restricted", body: restrictedBody() }));
    }

    return res.send(render({ title: "Delete", body: deleteBody() }));
});

router.post('/delete', RateLimiter, async (req, res) => {
    if (!req.session.DiscordId) {
        return res.redirect('/login');
    }

    const record = await liveRecordFor(req.session.DiscordId);

    if (!record) {
        return res.redirect('/dashboard');
    }

    if (isRestricted(record)) {
        return res.send(render({ title: "Restricted", body: restrictedBody() }));
    }

    const typed = typeof req.body?.confirm === "string" ? req.body.confirm.trim() : "";

    if (typed.toLowerCase() !== DELETE_PHRASE.toLowerCase()) {
        return res.send(render({
            title: "Delete",
            body: deleteBody(`Type "${DELETE_PHRASE}" exactly to confirm.`)
        }));
    }

    const { status } = await deleteLink(record["_id"], { cooldown: true });

    if (status !== "deleted") {
        return res.redirect('/dashboard?status=failed');
    }

    return req.session.destroy(() => {
        res.clearCookie('.SIDETECH');
        return res.redirect('/dashboard?status=deleted');
    });
});

router.get('/logout', RateLimiter, (req, res) => {
    return req.session.destroy(() => {
        res.clearCookie('.SIDETECH');
        return res.redirect(WEB_URL);
    });
});

router.get('/', RateLimiter, (req, res) => res.redirect('/dashboard'));

module.exports = router;
