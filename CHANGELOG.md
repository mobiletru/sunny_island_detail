# Changelog

## 1.1.0

- **Start charging (Tessie)** button in sidebar settings + HA script `start_car_charger`
- Start blocked when pack lowest cell ≤ 3.2 V or SoC ≤ 15%
- Stop charging uses Tessie `switch.x_charge` + wake + amps 0 + retry
- OS top notifications via Companion (`notify.mobile_app_plaid`)
- Example HA scripts/automations under `ha_config/`
- Docs/README updated for Tessie start/stop

## 1.0.0

- Initial HAOS add-on: live Sunny Island plant dashboard
- Tesla EVTV BMS pack (2-line 12S) via WebSocket
- Enphase Envoy solar/load metrics
- kWh meters, fault banner, pack power sparkline
- Sign convention: − A/W = discharge, + A/W = charge
- Stop car charger control (`script.shutdown_car_charger`)
- Ingress sidebar panel **Sunny Island** (port 8097)
