# Install on this HAOS host

Local path: `/addons/sunny_island_detail`

Add-on slug: `local_sunny_island_detail`

```bash
ha store reload
ha apps install local_sunny_island_detail
ha apps start local_sunny_island_detail
# Sidebar panel already enabled as "Sunny Island"
```

1. Open **Sunny Island** in the Home Assistant sidebar.
2. Paste a long-lived access token (Profile → Security → Long-Lived Access Tokens),
   or set `ha_token` under the add-on **Configuration** tab.

GitHub: https://github.com/mobiletru/sunny_island_detail

## Clone / update from GitHub

```bash
cd /addons
git clone https://github.com/mobiletru/sunny_island_detail.git
# or: git -C sunny_island_detail pull
ha store reload
ha apps rebuild local_sunny_island_detail
ha apps restart local_sunny_island_detail
```
