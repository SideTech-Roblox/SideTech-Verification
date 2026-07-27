const express = require("express");
const router = express.Router();

const { consumeState, exchangeDiscord } = require("../lib/oauth");
const { findByDiscord, findByUid, relink, isDeleted } = require("../lib/verification");

const { rateLimit } = require('express-rate-limit');
const RateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { status: "429", message: "Too many requests, please try again later." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

function applyIdentity(req, account) {
    req.session.DiscordId = account.id;
    req.session.DiscordName = account.name;
    req.session.DiscordUsername = account.username;
    req.session.DiscordAvatar = account.avatar;
}

router.get('/verify/discord', RateLimiter, async (req, res) => {
    try {
        if (req.query.error) {
            return res.redirect('/dashboard?status=denied');
        }

        const code = req.query.code;

        if (!code) {
            return res.redirect('/dashboard?status=failed');
        }

        const pending = consumeState(req, "discord", req.query.state);

        if (!pending) {
            return res.redirect('/dashboard?status=expired');
        }

        const account = await exchangeDiscord(code);

        if (!account) {
            return res.redirect('/dashboard?status=failed');
        }

        if (pending.intent === "relink") {
            const record = await findByUid(pending.uid);

            if (!record || record["data"]["discord"] !== req.session.DiscordId) {
                return res.redirect('/dashboard?status=failed');
            }

            const result = await relink(record["_id"], "discord", account.id);

            if (result.status === "restricted") {
                return res.redirect('/dashboard?status=restricted');
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

            applyIdentity(req, account);
            req.session.UID = result.record.uid;
            req.session.RobloxId = result.record.roblox;

            return res.redirect(result.status === "unchanged" ? '/dashboard?status=unchanged' : '/dashboard?status=relinked');
        }

        applyIdentity(req, account);
        delete req.session.RobloxProfile;

        const found = await findByDiscord(account.id);
        const FetchData = found && !isDeleted(found) ? found : null;

        if (FetchData) {
            req.session.UID = FetchData["_id"];
            req.session.RobloxId = FetchData["data"]["roblox"];

            return res.redirect('/dashboard');
        }

        delete req.session.UID;
        delete req.session.RobloxId;

        return res.redirect(pending.returnTo === '/link/roblox' ? '/link/roblox' : '/dashboard');
    } catch (error) {
        console.error(error);
        return res.redirect('/dashboard?status=failed');
    }
});

module.exports = router;
