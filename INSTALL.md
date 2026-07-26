# Install on this HAOS host

Local path: `/addons/sunny_island_detail`

Add-on slug: `local_sunny_island_detail`

```bash
ha store reload
ha apps install local_sunny_island_detail
ha apps start local_sunny_island_detail
# Sidebar panel already enabled as "Sunny Island"
```

GitHub: https://github.com/mobiletru/sunny_island_detail

To push remaining local files after adding a token:

```bash
echo YOUR_GITHUB_PAT > /root/.github-token
cd /addons/sunny_island_detail
git config credential.helper '/addons/sma-webbox-dashboard/scripts/github-credential.sh'
git add -A && git commit -am "Sync full tree" && git push -u origin main
```
