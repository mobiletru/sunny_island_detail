# Sunny Island Detail — documentation

## What it is

Ingress web app for monitoring a Sunny Island off-grid / hybrid plant with an
EVTV Tesla module pack (2-line 12S) and Enphase site meters.

## Requirements

- Home Assistant OS with Supervisor
- `tesla_evtv_bms` custom integration configured (UDP CAN broadcast)
- Optional: Enphase Envoy integration
- `script.start_car_charger` / `script.shutdown_car_charger` (Tessie start/stop)
- `script.notify_iphone` → Companion OS top banner (`notify.mobile_app_*`)

## Configuration

Set **pack_prefix** to match your entity IDs, e.g. if SoC is  
`sensor.battery_storage_tesla_pack_state_of_charge` then  
`pack_prefix = battery_storage_tesla_pack`.

## Auth

Uses a Home Assistant long-lived access token. Create under  
**Profile → Security → Long-Lived Access Tokens**.

## Network

The browser connects to HA’s WebSocket on the same host as the Ingress UI
(`ws://` / `wss://` + `/api/websocket`).
