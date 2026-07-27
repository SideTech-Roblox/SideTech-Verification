function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable "${name}". Check that .env is present.`);
    }

    if (value.startsWith("encrypted:")) {
        throw new Error(`Environment variable "${name}" is still encrypted. Copy .env.keys onto this machine so dotenvx can decrypt .env.`);
    }

    return value;
}

const BASE_URL = process.env.VERIFICATION_URL || "https://verification.sidetechroblox.com";
const WEB_URL = process.env.WEB_URL || "https://sidetechroblox.com";

module.exports = {
    BASE_URL,
    WEB_URL,
    SESSION_KEY: required("SESSION_KEY"),
    SERVICE_KEY: required("SERVICE_KEY"),
    DISCORD: {
        client: required("DISCORD_CLIENT_ID"),
        secret: required("DISCORD_CLIENT_SECRET"),
        redirect: `${BASE_URL}/verify/discord`,
        scope: "identify openid"
    },
    ROBLOX: {
        client: required("ROBLOX_CLIENT_ID"),
        secret: required("ROBLOX_CLIENT_SECRET"),
        redirect: `${BASE_URL}/verify/roblox`,
        scope: "openid profile"
    }
};
