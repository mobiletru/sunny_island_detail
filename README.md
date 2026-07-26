# Sunny Island Detail

Home Assistant OS **add-on**: live plant dashboard for a **Sunny Island + Tesla pack** setup.

**Repo:** https://github.com/mobiletru/sunny_island_detail

Streams sensors from:

- [`tesla_evtv_bms`](https://github.com/mobiletru/tesla_evtv_bms) (pack SoC, V/I/P, cells, faults, kWh)
- Enphase Envoy (solar / load / net)
- **Tessie** car charging: `switch.x_charge` via HA scripts
- Companion OS top notify: `notify.mobile_app_*` (e.g. Plaid)

## Features

- Real-time HA WebSocket updates
- SoC gauge, pack power trend, charge/discharge split
- Cell stats, safety, kWh meters
- Fault banner
- **Start charging (Tessie)** / **Stop charging (Tessie)** buttons
- Ingress sidebar panel (**Sunny Island**)

Sign convention (this plant): **− A/W = discharge**, **+ A/W = charge**.

## Install (HAOS local add-on)

1. Place this folder in `/addons/sunny_island_detail` on the HAOS host  
   (or `git clone https://github.com/mobiletru/sunny_island_detail.git`).
2. **Settings → Add-ons → Add-on Store → ⋮ → Check for updates** (or `ha store reload`).
3. Install **Sunny Island Detail** → **Start** → enable **Show in sidebar**.
4. Open **Sunny Island** in the sidebar.
5. Paste a long-lived access token (or set `ha_token` in options).

### Required HA scripts

Add to `scripts.yaml` (see `ha_config/` examples):

| Script | Purpose |
|--------|---------|
| `script.start_car_charger` | Tessie start (`switch.x_charge` on, 18 A); blocked if cell ≤ 3.2 V or SoC ≤ 15% |
| `script.shutdown_car_charger` | Tessie stop (`switch.x_charge` off, 0 A) + OS notify |
| `script.notify_iphone` | Companion OS top banner (`notify.mobile_app_plaid`) |

Pack protection automation: cell ≤ 3.2 V / SoC ≤ 15% → `script.shutdown_car_charger`.

### Options

| Option | Default |
|--------|---------|
| `pack_prefix` | `battery_storage_tesla_pack` |
| `envoy_prefix` | `sensor.envoy_122039004946` |
| `ha_token` | *(empty)* |

## Development

```bash
# Smoke-render config
SI_OPTIONS=/path/to/options.json \
SI_CONFIG_TEMPLATE=dist/js/config.js \
SI_CONFIG_OUT=/tmp/config.js \
python3 scripts/render_config.py
```

## License

MIT
