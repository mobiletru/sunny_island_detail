# Sunny Island Detail

Home Assistant OS **add-on**: live plant dashboard for a **Sunny Island + Tesla pack** setup.

Streams sensors from:

- [`tesla_evtv_bms`](https://github.com/mobiletru/tesla_evtv_bms) (pack SoC, V/I/P, cells, faults, kWh)
- Enphase Envoy (solar / load / net)
- Optional `input_boolean.car_charger` + `script.shutdown_car_charger`

## Features

- Real-time HA WebSocket updates
- SoC gauge, pack power trend, charge/discharge split
- Cell stats, safety, kWh meters
- Fault banner
- **Stop car charger** button (calls HA script)
- Ingress sidebar panel (**Sunny Island**)

Sign convention (this plant): **− A/W = discharge**, **+ A/W = charge**.

## Install (HAOS local add-on)

1. Place this folder in `/addons/sunny_island_detail` on the HAOS host.
2. **Settings → Add-ons → Add-on Store → ⋮ → Check for updates** (or reload).
3. Install **Sunny Island Detail** → **Start** → enable **Show in sidebar**.
4. Open **Sunny Island** in the sidebar.
5. Paste a long-lived access token (or set `ha_token` in options).

### Options

| Option | Default |
|--------|---------|
| `pack_prefix` | `battery_storage_tesla_pack` |
| `envoy_prefix` | `sensor.envoy_122039004946` |
| `ha_token` | *(empty)* |

## Development

```bash
SI_OPTIONS=/path/to/options.json \
SI_CONFIG_TEMPLATE=dist/js/config.js \
SI_CONFIG_OUT=/tmp/config.js \
python3 scripts/render_config.py
```

## License

MIT
