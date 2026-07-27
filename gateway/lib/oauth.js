const crypto = require("node:crypto");

const { DISCORD, ROBLOX } = require("./config");

const STATE_LIFETIME = 10 * 60 * 1000;

function createState(req, provider, returnTo, extra) {
    const state = crypto.randomBytes(24).toString("hex");

    req.session.oauth = {
        state: state,
        provider: provider,
        returnTo: returnTo || "/dashboard",
        intent: extra?.intent || "login",
        uid: extra?.uid || null,
        created: Date.now()
    };

    return state;
}

function consumeState(req, provider, state) {
    const pending = req.session.oauth;
    delete req.session.oauth;

    if (!pending || !pending.state || !state) return null;
    if (pending.provider !== provider) return null;
    if (Date.now() - pending.created > STATE_LIFETIME) return null;

    const expected = Buffer.from(pending.state);
    const received = Buffer.from(String(state));

    if (expected.length !== received.length) return null;
    if (!crypto.timingSafeEqual(expected, received)) return null;

    return pending;
}

function discordAuthorizeURL(state) {
    const params = new URLSearchParams({
        client_id: DISCORD.client,
        redirect_uri: DISCORD.redirect,
        response_type: "code",
        scope: DISCORD.scope,
        state: state
    });

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function robloxAuthorizeURL(state) {
    const params = new URLSearchParams({
        client_id: ROBLOX.client,
        redirect_uri: ROBLOX.redirect,
        response_type: "code",
        scope: ROBLOX.scope,
        state: state
    });

    return `https://apis.roblox.com/oauth/v1/authorize?${params.toString()}`;
}

function basicAuth(client, secret) {
    return Buffer.from(`${client}:${secret}`).toString("base64");
}

function discordAvatar(user) {
    if (user.avatar) {
        const extension = user.avatar.startsWith("a_") ? "gif" : "png";
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
    }

    const index = user.discriminator && user.discriminator !== "0"
        ? Number(user.discriminator) % 5
        : Number((BigInt(user.id) >> 22n) % 6n);

    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

async function exchangeDiscord(code) {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth(DISCORD.client, DISCORD.secret)}`
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: DISCORD.redirect
        }).toString(),
        signal: AbortSignal.timeout(15_000)
    });

    if (!tokenResponse.ok) return null;

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { "Authorization": `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(15_000)
    });

    if (!userResponse.ok) return null;

    const user = await userResponse.json();
    if (!user || !user.id) return null;

    return {
        id: String(user.id),
        name: user.global_name || user.username || "Unknown",
        username: user.username || null,
        avatar: discordAvatar(user)
    };
}

async function exchangeRoblox(code) {
    const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth(ROBLOX.client, ROBLOX.secret)}`
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code
        }).toString(),
        signal: AbortSignal.timeout(15_000)
    });

    if (!tokenResponse.ok) return null;

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
        headers: { "Authorization": `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(15_000)
    });

    if (!userResponse.ok) return null;

    const user = await userResponse.json();
    if (!user || !user.sub) return null;

    return {
        id: String(user.sub),
        name: user.nickname || user.name || user.preferred_username || "Unknown",
        username: user.preferred_username || null,
        avatar: user.picture || null
    };
}

module.exports = {
    createState,
    consumeState,
    discordAuthorizeURL,
    robloxAuthorizeURL,
    exchangeDiscord,
    exchangeRoblox
};
