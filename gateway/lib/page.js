const { WEB_URL } = require("./config");

const DISCORD_INVITE = "https://discord.gg/eA87cFYzYD";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
        --primary: #00d4ff;
        --secondary: #7c3aed;
        --accent: #ff6b6b;
        --success: #4ade80;
        --dark: #0a0a0f;
        --text: #ffffff;
        --text-muted: #a0a0a0;
        --border: rgba(255, 255, 255, 0.1);
    }

    html { -webkit-text-size-adjust: 100%; }

    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--dark);
        color: var(--text);
        line-height: 1.55;
        font-size: 15px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
    }

    .bg-animation {
        position: fixed;
        inset: 0;
        z-index: -1;
        background: radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 50%);
        animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }

    @keyframes fadeInUp {
        from { transform: translateY(16px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .nav {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 12px 18px;
        backdrop-filter: blur(20px);
        background: rgba(5, 5, 10, 0.85);
        border-bottom: 1px solid var(--border);
    }

    .nav-logo {
        font-weight: 700;
        font-size: 16px;
        text-decoration: none;
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .nav-link {
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 500;
        font-size: 13px;
        transition: color 0.3s ease;
    }

    .nav-link:hover { color: var(--primary); }

    .wrap {
        flex: 1;
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        padding: 28px 16px 40px;
        animation: fadeInUp 0.5s ease-out;
    }

    .glass {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 24px;
    }

    .title {
        font-size: clamp(1.35rem, 4.5vw, 1.7rem);
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 6px;
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        color: var(--text-muted);
        font-size: 0.875rem;
        margin-bottom: 20px;
    }

    .account {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border);
        margin-bottom: 10px;
    }

    .account-avatar {
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border);
    }

    .account-avatar.fallback {
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 15px;
        color: var(--text-muted);
    }

    .account-body { flex: 1; min-width: 0; }

    .account-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .account-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: var(--text-muted);
        font-weight: 600;
    }

    .account-name {
        font-weight: 600;
        font-size: 0.93rem;
        line-height: 1.35;
        overflow-wrap: anywhere;
    }

    .account-handle {
        font-weight: 400;
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .account-id {
        font-size: 11.5px;
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
    }

    .pill {
        flex: 0 0 auto;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
    }

    .pill.linked { background: rgba(74, 222, 128, 0.15); color: var(--success); }
    .pill.missing { background: rgba(255, 107, 107, 0.15); color: var(--accent); }

    .tabs {
        display: flex;
        gap: 4px;
        padding: 4px;
        margin-bottom: 18px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border);
    }

    .tab {
        flex: 1 1 0;
        text-align: center;
        padding: 8px 12px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        color: var(--text-muted);
        transition: background 0.25s ease, color 0.25s ease;
    }

    .tab:hover { color: var(--text); }

    .tab.active {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text);
    }

    .setting {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 2px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .setting:last-child { border-bottom: none; }

    .setting-text { flex: 1; min-width: 0; }

    .setting-title {
        font-weight: 600;
        font-size: 14px;
    }

    .setting-sub {
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.45;
    }

    .setting-value {
        flex: 0 0 auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12.5px;
        color: var(--primary);
        overflow-wrap: anywhere;
        text-align: right;
    }

    .setting form { flex: 0 0 auto; }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
    }

    .btn {
        flex: 1 1 auto;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
        padding: 12px 20px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        font-family: inherit;
        border: none;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    }

    .btn-primary {
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(0, 212, 255, 0.22);
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 212, 255, 0.32);
    }

    .btn-secondary {
        background: transparent;
        color: var(--text);
        border: 1.5px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .banner {
        padding: 12px 14px;
        border-radius: 11px;
        margin-bottom: 18px;
        font-size: 13px;
        line-height: 1.5;
    }

    .banner.success { background: rgba(74, 222, 128, 0.1); border-left: 3px solid var(--success); }
    .banner.error { background: rgba(255, 107, 107, 0.1); border-left: 3px solid var(--accent); }
    .banner.info { background: rgba(0, 212, 255, 0.1); border-left: 3px solid var(--primary); }

    .note {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 12.5px;
    }

    .footer {
        padding: 20px 16px 24px;
        text-align: center;
        border-top: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 12px;
    }

    .footer a { color: var(--text-muted); text-decoration: none; }
    .footer a:hover { color: var(--primary); }

    .footer-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin-bottom: 10px;
    }

    .relink {
        flex: 0 0 auto;
        align-self: center;
        font-family: inherit;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        padding: 7px 14px;
        border-radius: 50px;
        text-decoration: none;
        white-space: nowrap;
        color: var(--text);
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.16);
        transition: background 0.3s ease, border-color 0.3s ease;
    }

    .relink:hover {
        background: rgba(0, 212, 255, 0.14);
        border-color: rgba(0, 212, 255, 0.35);
    }

    .relink.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .relink.danger {
        color: var(--accent);
        border-color: rgba(255, 107, 107, 0.3);
    }

    .relink.danger:hover {
        background: rgba(255, 107, 107, 0.14);
        border-color: rgba(255, 107, 107, 0.5);
    }

    .lock {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 14px;
        padding: 11px 14px;
        border-radius: 12px;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.2);
    }

    .lock-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: var(--text-muted);
        font-weight: 600;
    }

    .lock-time {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12.5px;
        color: var(--accent);
        white-space: nowrap;
    }

    .btn-danger {
        background: transparent;
        color: var(--accent);
        border: 1.5px solid rgba(255, 107, 107, 0.35);
    }

    .btn-danger:hover {
        background: rgba(255, 107, 107, 0.12);
        transform: translateY(-2px);
    }

    .warn {
        padding: 14px 16px;
        border-radius: 12px;
        margin-bottom: 20px;
        background: rgba(255, 107, 107, 0.08);
        border-left: 3px solid var(--accent);
        font-size: 13.5px;
        line-height: 1.55;
    }

    .warn strong { color: var(--accent); }

    @media (max-width: 480px) {
        .wrap { padding: 20px 12px 32px; }
        .glass { padding: 18px 15px; border-radius: 14px; }
        .account { padding: 12px; gap: 10px; }
        .lock { flex-direction: column; align-items: flex-start; gap: 3px; }

        .setting { flex-wrap: wrap; gap: 8px; }
        .setting-text { flex-basis: 100%; }
        .setting-value { text-align: left; }

        .setting form { flex: 1 1 100%; min-width: 0; }
        .setting form .relink { display: block; width: 100%; text-align: center; }
        .setting > .relink { flex: 1 1 100%; text-align: center; }
        .actions { flex-direction: column; gap: 8px; }
        .btn { width: 100%; }

        .account .relink {
            order: 4;
            margin-left: 48px;
            flex-basis: calc(100% - 48px);
            text-align: center;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .bg-animation, .wrap { animation: none; }
        .btn:hover { transform: none; }
    }
`;

const BANNERS = {
    linked: { tone: "success", text: "✅ Your Roblox account has been linked! You can head back to Discord now." },
    relinked: { tone: "success", text: "✅ Your account has been relinked. You won't be able to relink again for 3 months." },
    unchanged: { tone: "info", text: "That account was already the one linked, so nothing changed." },
    cooldown: { tone: "error", text: "You've relinked recently. Relinking is locked until the countdown below runs out." },
    restricted: { tone: "error", text: "This account is restricted, so relinking and deleting are disabled. Open a ticket to appeal it." },
    deleted: { tone: "info", text: "Your verification data has been deleted. You'll be able to verify again once the countdown below runs out." },
    public: { tone: "success", text: "✅ Public lookup is on. Anyone can look up your verification." },
    private: { tone: "success", text: "✅ Public lookup is off. Only SideTech services can look up your verification." },
    roblox_taken: { tone: "error", text: "That Roblox account is already linked to a different Discord account." },
    discord_taken: { tone: "error", text: "That Discord account is already linked to a different Roblox account." },
    failed: { tone: "error", text: "We couldn't complete that request. Please try again." },
    expired: { tone: "error", text: "That login attempt expired or didn't match. Please start again." },
    denied: { tone: "error", text: "The authorisation request was cancelled." }
};

function renderBanner(status) {
    const banner = BANNERS[status];
    if (!banner) return "";

    return `<div class="banner ${banner.tone}">${escapeHtml(banner.text)}</div>`;
}

function avatarTag(account) {
    if (account && account.avatar) {
        return `<img class="account-avatar" src="${escapeHtml(account.avatar)}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
    }

    const initial = (account && account.name ? String(account.name).trim()[0] : "?") || "?";
    return `<div class="account-avatar fallback">${escapeHtml(initial.toUpperCase())}</div>`;
}

function displayName(account) {
    const name = escapeHtml(account.name);

    if (!account.username || account.username === account.name) return name;

    return `${name} <span class="account-handle">(@${escapeHtml(account.username)})</span>`;
}

function relinkTag(platform, locked) {
    if (!platform) return "";

    if (locked) {
        return `<span class="relink disabled" title="Relinking is locked for now">Relink</span>`;
    }

    return `<a class="relink" href="/relink/${escapeHtml(platform)}">Relink</a>`;
}

function accountRow({ label, account, linked, hint, platform, locked }) {
    return `
        <div class="account">
            ${avatarTag(linked ? account : null)}
            <div class="account-body">
                <div class="account-head">
                    <span class="account-label">${escapeHtml(label)}</span>
                    <span class="pill ${linked ? 'linked' : 'missing'}">${linked ? 'Linked' : 'Missing'}</span>
                </div>
                ${linked
                    ? `<div class="account-name">${displayName(account)}</div>
                       <div class="account-id">${escapeHtml(account.id)}</div>`
                    : `<div class="account-name">Not linked</div>
                       <div class="account-id">${escapeHtml(hint)}</div>`}
            </div>
            ${linked ? relinkTag(platform, locked) : ""}
        </div>`;
}

function loginBody(status) {
    return `
        <div class="glass">
            <h1 class="title">Verification</h1>
            <p class="subtitle">Sign in with Discord to view and manage the Roblox account linked to you across SideTech services.</p>
            ${renderBanner(status)}
            <div class="actions">
                <a class="btn btn-primary" href="/login">Login with Discord</a>
                <a class="btn btn-secondary" href="${WEB_URL}">Back to site</a>
            </div>
            <p class="note">We only read your Discord and Roblox username, ID and avatar. We never get access to your password on either platform.</p>
        </div>`;
}

function settingRow({ title, sub, value, action }) {
    return `
        <div class="setting">
            <div class="setting-text">
                <div class="setting-title">${escapeHtml(title)}</div>
                <div class="setting-sub">${sub}</div>
            </div>
            ${value ? `<span class="setting-value">${escapeHtml(value)}</span>` : ''}
            ${action || ''}
        </div>`;
}

function settingsBody({ uid, accountStatus, publicLookup, restricted }) {
    const lookupOn = publicLookup !== false;

    return `
        ${settingRow({
            title: "Account lookup",
            sub: lookupOn
                ? 'Anyone can look up your verification.'
                : 'Only SideTech services can look up your verification.',
            action: `<form method="post" action="/lookup">
                <button class="relink" type="submit">Turn ${lookupOn ? 'off' : 'on'}</button>
            </form>`
        })}

        ${settingRow({
            title: "Account ID",
            sub: 'Identifies your link across SideTech services.',
            value: uid
        })}

        ${settingRow({
            title: "Account status",
            sub: restricted
                ? 'Relinking and deleting are disabled. Open a ticket to appeal.'
                : 'Your verification is in good standing.',
            value: accountStatus || "Active"
        })}

        ${settingRow({
            title: "Account deletion",
            sub: restricted
                ? 'Unavailable while restricted.'
                : 'Removes your link and locks both accounts for 3 months.',
            action: restricted ? '' : `<a class="relink danger" href="/delete">Delete</a>`
        })}`;
}

function accountsBody({ discord, roblox, uid, isLinked, locked, lockedUntil, restricted }) {
    return `
        ${accountRow({
            label: "Discord",
            account: discord,
            linked: true,
            platform: uid ? "discord" : null,
            locked: locked
        })}

        ${accountRow({
            label: "Roblox",
            account: roblox,
            linked: isLinked,
            hint: "Authorise Roblox to finish verifying",
            platform: uid ? "roblox" : null,
            locked: locked
        })}

        ${restricted ? `<div class="lock">
            <span class="lock-label">Account restricted</span>
            <span class="lock-time">relink &amp; delete disabled</span>
        </div>` : lockedUntil ? `<div class="lock" data-until="${escapeHtml(lockedUntil)}">
            <span class="lock-label">Linking locked</span>
            <span class="lock-time">calculating…</span>
        </div>` : ''}`;
}

function tabsBody(active) {
    const tab = (key, label) => `<a class="tab${active === key ? ' active' : ''}" href="/dashboard${key === 'settings' ? '?tab=settings' : ''}">${label}</a>`;

    return `<div class="tabs">${tab('account', 'My Account')}${tab('settings', 'Settings')}</div>`;
}

function dashboardBody({ status, discord, roblox, uid, lockedUntil, accountStatus, publicLookup, tab }) {
    const isLinked = Boolean(roblox && roblox.id);
    const restricted = accountStatus === "Restricted";
    const locked = Boolean(lockedUntil) || restricted;
    const onSettings = isLinked && tab === "settings";

    return `
        <div class="glass">
            <h1 class="title">${isLinked ? 'You&#039;re verified' : locked ? 'Verification locked' : 'Finish verifying'}</h1>
            <p class="subtitle">${isLinked
                ? onSettings
                    ? 'Manage how your verification behaves across SideTech services.'
                    : 'These are the accounts currently linked to you across SideTech services.'
                : locked
                    ? 'You don&#039;t have a Roblox account linked right now, and verifying again is temporarily locked.'
                    : 'Your Discord account is confirmed. Link a Roblox account to complete verification.'}</p>

            ${isLinked ? tabsBody(onSettings ? 'settings' : 'account') : ''}

            ${renderBanner(status)}

            ${onSettings
                ? settingsBody({ uid: uid, accountStatus: accountStatus, publicLookup: publicLookup, restricted: restricted })
                : accountsBody({ discord, roblox, uid, isLinked, locked, lockedUntil, restricted })}

            <div class="actions">
                ${isLinked || locked
                    ? `<a class="btn btn-secondary" href="/logout">Log out</a>`
                    : `<a class="btn btn-primary" href="/link/roblox">Link Roblox Account</a>
                       <a class="btn btn-secondary" href="/logout">Log out</a>`}
            </div>

            <p class="note">
                ${isLinked
                    ? onSettings
                        ? 'Account lookup only affects strangers. SideTech services can always see your verification.'
                        : restricted
                            ? 'Open a ticket to appeal your restriction.'
                            : locked
                                ? 'You&#039;ve relinked recently, so both accounts are locked until the countdown finishes.'
                                : 'Use <strong>Relink</strong> to move either account. Relinking either one locks both for <strong>3 months</strong>.'
                    : locked
                        ? 'Verifying again is locked until the countdown runs out. Open a ticket if you think this is wrong.'
                        : 'You&#039;ll be sent to Roblox to authorise the link. A Roblox account that is already linked to a different Discord account can&#039;t be used.'}
            </p>
        </div>`;
}

function relinkWarningBody(platform) {
    const label = platform === "roblox" ? "Roblox" : "Discord";

    return `
        <div class="glass">
            <h1 class="title">Relink ${escapeHtml(label)}</h1>
            <p class="subtitle">You'll be sent to ${escapeHtml(label)} to authorise the account you want to move to.</p>

            <div class="warn">
                <strong>This can only be done once every 3 months.</strong><br>
                Once you relink, both your Discord and Roblox accounts are locked, and you won't be able to relink either of them again until the 3 months are up.
            </div>

            <div class="actions">
                <a class="btn btn-primary" href="/relink/${escapeHtml(platform)}?confirm=1">I understand, continue</a>
                <a class="btn btn-secondary" href="/dashboard">Cancel</a>
            </div>

            <p class="note">A ${escapeHtml(label)} account that is already linked to someone else can't be used.</p>
        </div>`;
}

function deleteBody() {
    return `
        <div class="glass">
            <h1 class="title">Delete your data</h1>
            <p class="subtitle">This removes the link between your Discord and Roblox accounts across all SideTech services.</p>

            <div class="warn">
                <strong>This starts a 3 month lock.</strong><br>
                Both your Discord and Roblox accounts will be blocked from verifying again until it runs out, and this can't be undone from here.
            </div>

            <form class="actions" method="post" action="/delete">
                <button class="btn btn-danger" type="submit">Delete my data</button>
                <a class="btn btn-secondary" href="/dashboard">Cancel</a>
            </form>

            <p class="note">Only want to switch to a different account? Use <strong>Relink</strong> on the dashboard instead — that keeps your verification. Need a hand? <a class="link" href="${DISCORD_INVITE}" target="_blank" rel="noopener noreferrer">Open a ticket</a>.</p>
        </div>`;
}

function errorBody() {
    return `
        <div class="glass">
            <h1 class="title">Something went wrong</h1>
            <p class="subtitle">We couldn't load your verification details. Please try again in a moment.</p>
            <div class="actions">
                <a class="btn btn-primary" href="/dashboard">Retry</a>
                <a class="btn btn-secondary" href="${WEB_URL}">Back to site</a>
            </div>
        </div>`;
}

function render({ title, body }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#0a0a0f">
    <link rel="icon" type="image" href="https://tr.rbxcdn.com/180DAY-2f490e54a5cce6935b782ef65c961d76/420/420/Image/Webp/noFilter">
    <title>${escapeHtml(title)} • SideTech</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>${STYLES}</style>
</head>
<body>
    <div class="bg-animation"></div>

    <nav class="nav">
        <a class="nav-logo" href="${WEB_URL}">SideTech</a>
        <a class="nav-link" href="${WEB_URL}">← Back to site</a>
    </nav>

    <main class="wrap">${body}</main>

    <footer class="footer">
        <div class="footer-links">
            <a href="${WEB_URL}/termsofservice">Terms of Service</a>
            <a href="${WEB_URL}/privacypolicy">Privacy Policy</a>
            <a href="${WEB_URL}/discord">Discord</a>
        </div>
        <p>© ${new Date().getFullYear()} SideTech Roblox — Verification</p>
    </footer>

    <script>
        (function () {
            var lock = document.querySelector('.lock');
            if (!lock) return;

            var until = Number(lock.getAttribute('data-until'));
            var output = lock.querySelector('.lock-time');
            if (!until || !output) return;

            function pad(value) {
                return String(value).padStart(2, '0');
            }

            function tick() {
                var remaining = until - Date.now();

                if (remaining <= 0) {
                    output.textContent = 'available now';
                    clearInterval(timer);
                    return;
                }

                var days = Math.floor(remaining / 86400000);
                var hours = Math.floor(remaining / 3600000) % 24;
                var minutes = Math.floor(remaining / 60000) % 60;
                var seconds = Math.floor(remaining / 1000) % 60;

                output.textContent = days + 'd ' + pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
            }

            tick();
            var timer = setInterval(tick, 1000);
        })();
    </script>
</body>
</html>`;
}

module.exports = { render, renderBanner, escapeHtml, loginBody, dashboardBody, errorBody, relinkWarningBody, deleteBody };
