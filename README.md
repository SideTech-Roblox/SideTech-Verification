# SideTech Verification

Links a Discord account to a Roblox account using **Roblox OAuth2** and **Discord OAuth2**, and lets anyone look that link up.

Served at `https://verification.sidetechroblox.com`.

## Public API

### `GET /api/fetch`

Looks up someone's verification. No key needed. Limited to 60 requests a minute.

Pass one of these:

| Parameter | Description |
| --- | --- |
| `uid` | Account ID |
| `robloxid` | Roblox user ID |
| `discordid` | Discord user ID |

```bash
curl "https://verification.sidetechroblox.com/api/fetch?discordid=267851970123456789"
```

```json
{
  "status": "200",
  "message": "Success!",
  "data": {
    "uid": "Kq7mZp2XaB9vTn4RcW1e",
    "roblox": "1489341276",
    "discord": "267851970123456789"
  }
}
```

All three IDs come back as strings. `uid` is the account's own ID, stable across relinks.

| Status | Meaning |
| --- | --- |
| `400` | No parameter given |
| `404` | Not found, or not publicly visible |
| `429` | Too many requests |

A `404` doesn't always mean the person isn't verified — users can hide themselves from public lookups, and deleted accounts are never returned.

## Account status

Every account is in one of three states.

| Status | Can relink | Can delete | Shows in lookups |
| --- | --- | --- | --- |
| `Active` | yes | yes | yes |
| `Restricted` | no | no | yes |
| `Deleted` | no | no | no |

Changing either accounts (Roblox/Discord) — or deleting — starts a **3 month cooldown** that locks both the Discord and Roblox side.

Deleted accounts are kept on file until that cooldown runs out, so the IDs can't be reused straight away. After it expires the old record is cleared automatically the next time either ID is used.
