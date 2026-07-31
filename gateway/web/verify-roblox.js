const express = require("express");
const router = express.Router();

const { consumeState, exchangeRoblox } = require("../lib/oauth");
const { createLink, relink, findByDiscord, isDeleted } = require("../lib/verification");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

router.get('/verify/roblox', RateLimiter, async (req, res) => {
    try {
        if (req.query.error) {
            return res.redirect('/dashboard?status=denied');
        }

        const code = req.query.code;

        if (!code) {
            return res.redirect('/dashboard?status=failed');
        }

        if (!req.session.DiscordId) {
            return res.redirect('/login');
        }

        if (!consumeState(req, "roblox", req.query.state)) {
            return res.redirect('/dashboard?status=expired');
        }

        const account = await exchangeRoblox(code);

        if (!account) {
            return res.redirect('/dashboard?status=failed');
        }

        const found = await findByDiscord(req.session.DiscordId);
        const existing = found && !isDeleted(found) ? found : null;

        const result = existing
            ? await relink(existing["_id"], "roblox", account.id)
            : await createLink(req.session.DiscordId, account.id);

        if (result.status === "restricted") {
            return res.redirect('/dashboard?status=restricted');
        }

        if (result.status === "roblox_taken") {
            return res.redirect('/dashboard?status=roblox_taken');
        }

        if (result.status === "discord_taken") {
            return res.redirect('/dashboard?status=discord_taken');
        }

        if (result.status === "cooldown") {
            return res.redirect('/dashboard?status=cooldown');
        }

        if (result.status === "not_found") {
            return res.redirect('/dashboard?status=failed');
        }

        req.session.UID = result.record.uid;
        req.session.RobloxId = result.record.roblox;
        req.session.RobloxProfile = {
            name: account.name,
            username: account.username,
            avatar: account.avatar
        };

        if (result.status === "relinked") return res.redirect('/dashboard?status=relinked');
        if (result.status === "unchanged") return res.redirect('/dashboard?status=unchanged');

        const viaDiscord = req.session.viaDiscord === true;
        delete req.session.viaDiscord;

        return res.redirect(viaDiscord ? '/dashboard?status=linked_discord' : '/dashboard?status=linked');
    } catch (error) {
        console.error(error);
        return res.redirect('/dashboard?status=failed');
    }
});

module.exports = router;
