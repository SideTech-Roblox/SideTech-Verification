async function fetchRobloxProfile(robloxId) {
    const id = encodeURIComponent(robloxId);

    const [user, thumbnail] = await Promise.all([
        fetch(`https://users.roblox.com/v1/users/${id}`, { signal: AbortSignal.timeout(10_000) })
            .then(res => (res.ok ? res.json() : null))
            .catch(() => null),
        fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=150x150&format=Png&isCircular=false`, { signal: AbortSignal.timeout(10_000) })
            .then(res => (res.ok ? res.json() : null))
            .catch(() => null)
    ]);

    return {
        name: user?.displayName || user?.name || "Unknown",
        username: user?.name || null,
        avatar: thumbnail?.data?.[0]?.imageUrl || null
    };
}

module.exports = { fetchRobloxProfile };
