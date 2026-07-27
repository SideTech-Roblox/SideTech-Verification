const MongoDB_Client = require('../../database');

const Verification = MongoDB_Client.db("SideTech").collection("Verification");

const COOLDOWN_MONTHS = 3;

const STATUS = {
    ACTIVE: "Active",
    RESTRICTED: "Restricted",
    DELETED: "Deleted"
};

const ALL_STATUSES = Object.values(STATUS);

const nowSeconds = () => Math.floor(Date.now() / 1000);

function addMonths(fromSeconds, months) {
    const date = new Date(Number(fromSeconds) * 1000);
    if (Number.isNaN(date.getTime())) return 0;

    date.setMonth(date.getMonth() + months);
    return Math.floor(date.getTime() / 1000);
}

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    while (result.length < length) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const generateUID = () => randomString(20);

const MAX_PLAUSIBLE_SECONDS = 32503680000;

function readCooldown(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) return 0;

    return number > MAX_PLAUSIBLE_SECONDS ? Math.floor(number / 1000) : Math.floor(number);
}

function configsOf(record) {
    const configs = record?.["configs"] || {};
    const status = ALL_STATUSES.includes(configs["account-status"]) ? configs["account-status"] : STATUS.ACTIVE;

    return {
        status: status,
        publicLookup: status === STATUS.DELETED ? false : configs["public-lookup"] !== false,
        linkingCooldown: readCooldown(configs["linking-cooldown"])
    };
}

const isDeleted = (record) => configsOf(record).status === STATUS.DELETED;
const isRestricted = (record) => configsOf(record).status === STATUS.RESTRICTED;

function cooldownRemaining(record) {
    const { linkingCooldown } = configsOf(record);
    return linkingCooldown > nowSeconds() ? linkingCooldown : 0;
}

function shape(record, { includeConfigs } = {}) {
    if (!record) return null;

    const base = {
        uid: record["_id"],
        roblox: record["data"]["roblox"],
        discord: record["data"]["discord"]
    };

    if (!includeConfigs) return base;

    const { status, publicLookup, linkingCooldown } = configsOf(record);

    return {
        ...base,
        status: status,
        publicLookup: publicLookup,
        linkingCooldown: linkingCooldown || null
    };
}

const findByUid = async (uid) => Verification.findOne({ "_id": `${uid}` });
const findByRoblox = async (robloxId) => Verification.findOne({ "data.roblox": `${robloxId}` });
const findByDiscord = async (discordId) => Verification.findOne({ "data.discord": `${discordId}` });

const findByPlatform = (platform, id) => (platform === "roblox" ? findByRoblox(id) : findByDiscord(id));

async function purgeIfExpired(record) {
    if (!record || !isDeleted(record)) return record;
    if (cooldownRemaining(record)) return record;

    await Verification.deleteOne({ "_id": record["_id"] });
    return null;
}

async function createLink(discordId, robloxId) {
    const byDiscord = await purgeIfExpired(await findByDiscord(discordId));
    const byRoblox = await purgeIfExpired(await findByRoblox(robloxId));

    for (const record of [byDiscord, byRoblox]) {
        if (record && isDeleted(record)) {
            return { status: "cooldown", lockedUntil: cooldownRemaining(record) };
        }
    }

    if (byRoblox) return { status: "roblox_taken" };
    if (byDiscord) return { status: "discord_taken" };

    const uid = generateUID();

    await Verification.insertOne({
        _id: `${uid}`,
        data: {
            discord: `${discordId}`,
            roblox: `${robloxId}`
        },
        configs: {
            "account-status": STATUS.ACTIVE,
            "public-lookup": true,
            "linking-cooldown": 0
        }
    });

    return { status: "created", record: shape(await findByUid(uid), { includeConfigs: true }) };
}

async function relink(uid, platform, newId) {
    const record = await findByUid(uid);

    if (!record || isDeleted(record)) {
        return { status: "not_found" };
    }

    if (isRestricted(record)) {
        return { status: "restricted", record: shape(record, { includeConfigs: true }) };
    }

    if (record["data"][platform] === `${newId}`) {
        return { status: "unchanged", record: shape(record, { includeConfigs: true }) };
    }

    const locked = cooldownRemaining(record);

    if (locked) {
        return { status: "cooldown", lockedUntil: locked, record: shape(record, { includeConfigs: true }) };
    }

    const holder = await purgeIfExpired(await findByPlatform(platform, newId));

    if (holder && holder["_id"] !== record["_id"]) {
        if (isDeleted(holder)) {
            return { status: "cooldown", lockedUntil: cooldownRemaining(holder) };
        }

        return { status: `${platform}_taken`, record: shape(record, { includeConfigs: true }) };
    }

    const until = addMonths(nowSeconds(), COOLDOWN_MONTHS);

    await Verification.updateOne(
        { "_id": record["_id"] },
        { $set: { [`data.${platform}`]: `${newId}`, "configs.linking-cooldown": until } }
    );

    return { status: "relinked", lockedUntil: until, record: shape(await findByUid(record["_id"]), { includeConfigs: true }) };
}

async function deleteLink(uid, { cooldown = true, purge = false } = {}) {
    const record = await findByUid(uid);

    if (!record) {
        return { status: "not_found" };
    }

    const previous = shape(record, { includeConfigs: true });

    if (purge) {
        await Verification.deleteOne({ "_id": record["_id"] });
        return { status: "purged", record: previous };
    }

    const until = cooldown ? addMonths(nowSeconds(), COOLDOWN_MONTHS) : 0;

    await Verification.updateOne(
        { "_id": record["_id"] },
        { $set: { "configs.account-status": STATUS.DELETED, "configs.linking-cooldown": until } }
    );

    return { status: "deleted", lockedUntil: until, record: previous };
}

async function setPublicLookup(uid, publicLookup) {
    const record = await findByUid(uid);

    if (!record || isDeleted(record)) {
        return { status: "not_found" };
    }

    await Verification.updateOne(
        { "_id": record["_id"] },
        { $set: { "configs.public-lookup": Boolean(publicLookup) } }
    );

    return { status: "updated", record: shape(await findByUid(uid), { includeConfigs: true }) };
}

function visibleTo(record, authenticated) {
    if (!record) return null;

    const { status, publicLookup } = configsOf(record);

    if (status === STATUS.DELETED) return null;
    if (!authenticated && !publicLookup) return null;

    return record;
}

module.exports = {
    shape,
    configsOf,
    isDeleted,
    isRestricted,
    cooldownRemaining,
    findByUid,
    findByRoblox,
    findByDiscord,
    visibleTo,
    createLink,
    relink,
    deleteLink,
    setPublicLookup
};
