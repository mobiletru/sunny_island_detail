/**
 * Sunny Island Detail — live plant UI over HA WebSocket
 */
(function () {
  let client = null;
  let history = [];
  const MAX_HISTORY = 180;
  const $ = (s) => document.querySelector(s);

  function init() {
    document.title = APP_CONFIG.title;
    $('#app-title').textContent = APP_CONFIG.title;
    $('#app-subtitle').textContent = APP_CONFIG.subtitle;
    $('#year').textContent = new Date().getFullYear();
    renderMetricPlaceholders();
    bindAuth();
    bindSettings();
    tryConnect();
  }

  function bindAuth() {
    $('#connect-btn').addEventListener('click', () => {
      const token = $('#token-input').value.trim();
      if (!token) return;
      storeToken(token);
      hideAuth();
      tryConnect();
    });
    $('#token-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#connect-btn').click();
    });
    $('#disconnect-btn').addEventListener('click', () => {
      client?.disconnect();
      clearToken();
      showAuth();
      setConnectionStatus('disconnected');
    });
  }

  function bindSettings() {
    $('#settings-btn').addEventListener('click', () => {
      $('#settings-panel').classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.settings-wrap')) {
        $('#settings-panel').classList.remove('open');
      }
    });
    $('#start-charger-btn')?.addEventListener('click', async () => {
      if (!client) return;
      try {
        await client.callService('script', 'start_car_charger');
        toast('Start charging (Tessie) requested', 'success');
      } catch (err) {
        toast(err.message || 'Start charging failed', 'error');
      }
    });
    $('#shutdown-charger-btn')?.addEventListener('click', async () => {
      if (!client) return;
      try {
        await client.callService('script', 'shutdown_car_charger');
        toast('Stop charging (Tessie) requested', 'success');
      } catch (err) {
        toast(err.message || 'Stop charging failed', 'error');
      }
    });
  }

  function tryConnect() {
    const token = getStoredToken();
    if (!token) {
      showAuth();
      return;
    }
    hideAuth();
    connectHA(token);
  }

  function connectHA(token) {
    client?.disconnect();
    client = new HAClient({
      url: detectHAUrl(),
      token,
      onConnect: async () => {
        setConnectionStatus('connected');
        try {
          await client.subscribeEntities(getAllEntityIds());
          updateAll();
        } catch (err) {
          setConnectionStatus('error', err.message);
        }
      },
      onDisconnect: () => setConnectionStatus('disconnected'),
      onStateChange: () => {
        updateAll();
        recordHistory();
      },
      onError: (msg) => {
        if (String(msg).toLowerCase().includes('token')) {
          clearToken();
          showAuth();
        }
        setConnectionStatus('error', msg);
      },
    });
    setConnectionStatus('connecting');
    client.connect();
  }

  function showAuth() {
    $('#auth-overlay').classList.remove('hidden');
  }
  function hideAuth() {
    $('#auth-overlay').classList.add('hidden');
  }

  function setConnectionStatus(status, detail = '') {
    const el = $('#connection-status');
    el.dataset.status = status;
    const labels = {
      connected: 'Live',
      connecting: 'Connecting…',
      disconnected: 'Offline',
      error: detail || 'Error',
    };
    el.textContent = labels[status] || status;
  }

  function toast(message, type = 'info') {
    const el = $('#toast');
    el.textContent = message;
    el.dataset.type = type;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3500);
  }

  function formatValue(meta, state) {
    if (!state || BAD_STATES.has(String(state.state).toLowerCase())) return '—';
    const raw = state.state;
    if (meta.format === 'text') return raw;
    const num = parseFloat(raw);
    if (isNaN(num)) return raw;
    switch (meta.format) {
      case 'percent':
        return num.toFixed(1) + '%';
      case 'energy':
        return num.toFixed(2) + ' kWh';
      case 'cell':
        return num.toFixed(3) + ' V';
      case 'int':
        return String(Math.round(num));
      case 'power_kw':
        return num.toFixed(2) + ' kW';
      case 'power':
        if (Math.abs(num) >= 1000) return (num / 1000).toFixed(2) + ' kW';
        return Math.round(num) + ' W';
      case 'number':
        if (Math.abs(num) >= 1000) return (num / 1000).toFixed(2);
        return num.toFixed(Math.abs(num) < 10 ? 2 : 1);
      default:
        return String(raw);
    }
  }

  function updateAll() {
    if (!client) return;
    for (const [key, meta] of Object.entries(METRICS)) {
      const state = client.getState(meta.entity);
      const el = document.querySelector(`[data-metric="${key}"] .metric-value`);
      if (el) el.textContent = formatValue(meta, state);
    }

    const status = client.getState(METRICS.status.entity)?.state || '—';
    const soc = parseFloat(client.getState(METRICS.soc.entity)?.state);
    const power = parseFloat(client.getState(METRICS.power.entity)?.state);
    const current = parseFloat(client.getState(METRICS.current.entity)?.state);
    const volts = parseFloat(client.getState(METRICS.volts.entity)?.state);
    const fault = client.getState(METRICS.fault.entity)?.state || '—';
    const summary = client.getState(METRICS.summary.entity)?.state || '—';

    $('#hero-status').textContent = BAD_STATES.has(String(status).toLowerCase()) ? '—' : status;
    $('#hero-status').dataset.mode = String(status).toLowerCase();
    $('#hero-summary').textContent = BAD_STATES.has(String(summary).toLowerCase()) ? '—' : summary;
    $('#hero-power').textContent = isNaN(power)
      ? '—'
      : Math.abs(power) >= 1000
        ? (power / 1000).toFixed(2) + ' kW'
        : Math.round(power) + ' W';
    $('#hero-current').textContent = isNaN(current) ? '—' : current.toFixed(1) + ' A';
    $('#hero-volts').textContent = isNaN(volts) ? '—' : volts.toFixed(1) + ' V';

    const arc = $('#soc-arc');
    const label = $('#soc-label');
    if (!isNaN(soc)) {
      const circ = 283;
      arc.style.strokeDashoffset = String(circ - (soc / 100) * circ);
      label.textContent = soc.toFixed(1) + '%';
      arc.classList.toggle('soc-low', soc < 20);
      arc.classList.toggle('soc-mid', soc >= 20 && soc < 50);
      arc.classList.toggle('soc-high', soc >= 50);
    }

    const banner = $('#fault-banner');
    if (fault && !BAD_STATES.has(fault.toLowerCase()) && fault !== 'No Fault') {
      banner.classList.remove('hidden');
      banner.textContent = `BMS fault: ${fault}`;
    } else {
      banner.classList.add('hidden');
    }

    const bar = $('#power-bar-fill');
    if (!isNaN(power)) {
      const pct = Math.max(4, Math.min(100, (Math.abs(power) / 10000) * 100));
      bar.style.width = pct + '%';
      bar.classList.toggle('discharging', power < -20);
      bar.classList.toggle('charging', power > 20);
      bar.classList.toggle('idle', Math.abs(power) <= 20);
    }

    drawSparkline();
  }

  function recordHistory() {
    if (!client) return;
    const power = parseFloat(client.getState(METRICS.power.entity)?.state);
    const soc = parseFloat(client.getState(METRICS.soc.entity)?.state);
    if (isNaN(power) && isNaN(soc)) return;
    history.push({ t: Date.now(), power: power || 0, soc });
    if (history.length > MAX_HISTORY) history.shift();
  }

  function drawSparkline() {
    const canvas = $('#power-sparkline');
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const values = history.map((p) => p.power);
    const max = Math.max(...values, 200);
    const min = Math.min(...values, -200);
    const range = max - min || 1;
    const zeroY = h - ((0 - min) / range) * (h - 8) - 4;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = '#ff7700';
    ctx.lineWidth = 2;
    history.forEach((p, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((p.power - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function renderMetricPlaceholders() {
    const grid = $('#metrics-grid');
    grid.innerHTML = GROUPS.map((g) => {
      const keys = Object.entries(METRICS)
        .filter(([, m]) => m.group === g.id)
        .map(([k]) => k);
      return `
        <section class="metric-group">
          <h3>${g.title}</h3>
          <div class="metric-cards">
            ${keys
              .map(
                (key) => `
              <div class="metric-card" data-metric="${key}">
                <span class="metric-label">${METRICS[key].label}</span>
                <span class="metric-value">—</span>
              </div>`
              )
              .join('')}
          </div>
        </section>`;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
