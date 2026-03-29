/* ============================================
   YOSKII VEHICLE HUD — NUI Script
   ============================================ */
'use strict';

let CONFIG = {
    speedUnit: 'MPH', maxSpeed: 200, fuelWarning: 20, fuelCritical: 10,
    showFuel: true, showRPM: true, showGear: true, showSeatbelt: true,
    showDamage: true, showEngineStatus: true, passengerMinimalHUD: true,
    theme: 'neutral',   // 'neutral' | 'dark' | 'light'
};

// DOM refs
const hudContainer     = document.getElementById('hud-container');
const speedValue       = document.getElementById('speed-value');
const speedUnit        = document.getElementById('speed-unit');
const rpmFill          = document.getElementById('rpm-fill');
const gearLetter       = document.getElementById('gear-letter');
const gearBadge        = document.getElementById('gear-badge');
const seatbeltPill     = document.getElementById('seatbelt-indicator');
const enginePill       = document.getElementById('engine-indicator');
const lockPill         = document.getElementById('lock-indicator');
const keyPill          = document.getElementById('key-indicator');
const lockIconLocked   = document.getElementById('lock-icon-locked');
const lockIconUnlocked = document.getElementById('lock-icon-unlocked');
const warningTicker    = document.getElementById('warning-ticker');
const warningText      = document.getElementById('warning-text');
const plateText        = document.getElementById('plate-text');
const mileageText      = document.getElementById('mileage-text');
const passengerBadge   = document.getElementById('passenger-badge');
// Stat bars
const fuelBarFill   = document.getElementById('fuel-bar-fill');
const engineBarFill = document.getElementById('engine-bar-fill');
const bodyBarFill   = document.getElementById('body-bar-fill');
const fuelPct       = document.getElementById('fuel-pct');
const enginePct     = document.getElementById('engine-pct');
const bodyPct       = document.getElementById('body-pct');
// Mechanic section
const mechSection      = document.getElementById('mech-section');
const needsServiceBadge= document.getElementById('needs-service-badge');
const MECH_PARTS = [
    { fill: document.getElementById('mech-oil-fill'),    pct: document.getElementById('mech-oil-pct'),    key: 'engine'      },
    { fill: document.getElementById('mech-brakes-fill'), pct: document.getElementById('mech-brakes-pct'), key: 'brakes'      },
    { fill: document.getElementById('mech-tyres-fill'),  pct: document.getElementById('mech-tyres-pct'),  key: 'tyres'       },
    { fill: document.getElementById('mech-susp-fill'),   pct: document.getElementById('mech-susp-pct'),   key: 'suspension'  },
    { fill: document.getElementById('mech-plugs-fill'),  pct: document.getElementById('mech-plugs-pct'),  key: 'spark_plugs' },
    { fill: document.getElementById('mech-filter-fill'), pct: document.getElementById('mech-filter-pct'), key: 'air_filter'  },
    { fill: document.getElementById('mech-clutch-fill'), pct: document.getElementById('mech-clutch-pct'), key: 'clutch'      },
];

const RPM_CIRC = 2 * Math.PI * 95;

// Smooth speed counter
class SmoothCounter {
    constructor(el) { this.el = el; this.current = 0; this.target = 0; this.raf = null; }
    set(v) { this.target = v; if (!this.raf) this._tick(); }
    _tick() {
        const d = this.target - this.current;
        if (Math.abs(d) < 0.5) { this.current = this.target; this.el.textContent = Math.round(this.current); this.raf = null; return; }
        this.current += d * 0.25;
        this.el.textContent = Math.round(this.current);
        this.raf = requestAnimationFrame(() => this._tick());
    }
}
const speedCounter = new SmoothCounter(speedValue);

function drawRPMArc(pct) {
    pct = Math.max(0, Math.min(1, pct));
    const dash = RPM_CIRC * 0.75 * pct;
    rpmFill.style.strokeDasharray = `${dash} ${RPM_CIRC}`;
    rpmFill.style.strokeDashoffset = '0';
}

function setBar(fillEl, pctEl, value, max, colorClass) {
    const p = Math.max(0, Math.min(100, (value / max) * 100));
    fillEl.style.width = p.toFixed(1) + '%';
    pctEl.textContent  = Math.round(p) + '%';
    fillEl.classList.remove('warn', 'crit');
    if (p <= 20) fillEl.classList.add('crit');
    else if (p <= 40) fillEl.classList.add('warn');
}

function setMechBar(fillEl, pctEl, value) {
    if (value == null) {
        fillEl.classList.add('no-data'); fillEl.style.width = '100%';
        pctEl.textContent = 'N/A'; return;
    }
    fillEl.classList.remove('no-data', 'warn', 'crit');
    const p = Math.max(0, Math.min(100, value));
    fillEl.style.width = p.toFixed(1) + '%';
    pctEl.textContent  = Math.round(p) + '%';
    if (p <= 20) fillEl.classList.add('crit');
    else if (p <= 40) fillEl.classList.add('warn');
}

// Warning ticker
let warningList = {}, warnIdx = 0, warnTimer = null;
function setWarning(id, text, on) {
    if (on && text) warningList[id] = text; else delete warningList[id];
    _refreshWarning();
}
function _refreshWarning() {
    const keys = Object.keys(warningList);
    if (!keys.length) {
        warningTicker.classList.add('hidden');
        if (warnTimer) { clearInterval(warnTimer); warnTimer = null; }
        return;
    }
    warningTicker.classList.remove('hidden');
    warnIdx = warnIdx % keys.length;
    warningText.textContent = '⚠ ' + warningList[keys[warnIdx]];
    if (!warnTimer && keys.length > 1) {
        warnTimer = setInterval(() => {
            const k = Object.keys(warningList);
            if (!k.length) return;
            warnIdx = (warnIdx + 1) % k.length;
            warningText.textContent = '⚠ ' + warningList[k[warnIdx]];
        }, 2200);
    }
}

function setPill(el, state) {
    el.classList.remove('active', 'warning', 'off');
    if (state === 'on')   el.classList.add('active');
    if (state === 'warn') el.classList.add('warning');
    if (state === 'off')  el.classList.add('off');
}

// ============================================
// MAIN UPDATE
// ============================================
let lastData = {};
function updateHUD(data) {
    lastData = data;

    // Speed
    speedCounter.set(data.speed || 0);
    speedUnit.textContent = (data.speedUnit || 'mph').toUpperCase();

    // RPM arc
    if (CONFIG.showRPM) drawRPMArc(data.rpm || 0);

    // Fuel bar
    if (CONFIG.showFuel) {
        const fuel = data.fuel || 0;
        fuelBarFill.style.width = Math.max(0, Math.min(100, fuel)).toFixed(1) + '%';
        fuelPct.textContent = Math.round(fuel) + '%';
        fuelBarFill.classList.remove('warn', 'crit');
        const fw = data.fuelWarning  || 20;
        const fc = data.fuelCritical || 10;
        if (fuel <= fc)       fuelBarFill.classList.add('crit');
        else if (fuel <= fw)  fuelBarFill.classList.add('warn');
        setWarning('fuel_low',  'LOW FUEL',      fuel <= fw && fuel > fc);
        setWarning('fuel_crit', 'CRITICAL FUEL', fuel <= fc);
    }

    // Engine health bar (0-1000 → %)
    if (CONFIG.showDamage && data.damageEnabled) {
        const eng  = Math.max(0, data.engineHealth || 0);
        const engP = (eng / 1000) * 100;
        engineBarFill.style.width = engP.toFixed(1) + '%';
        enginePct.textContent = Math.round(engP) + '%';
        engineBarFill.classList.remove('warn', 'crit');
        if (engP <= 20) engineBarFill.classList.add('crit');
        else if (engP <= 40) engineBarFill.classList.add('warn');
        setWarning('engine_dmg', 'ENGINE CRITICAL', engP <= 20);
    }

    // Body health bar (0-1000 → %)
    if (CONFIG.showDamage && data.damageEnabled) {
        const bodyP = Math.max(0, Math.min(100, (data.bodyHealth || 0) / 1000 * 100));
        bodyBarFill.style.width = bodyP.toFixed(1) + '%';
        bodyPct.textContent = Math.round(bodyP) + '%';
        bodyBarFill.classList.remove('warn', 'crit');
        if (bodyP <= 20) bodyBarFill.classList.add('crit');
        else if (bodyP <= 40) bodyBarFill.classList.add('warn');
    }

    // jg-mechanic condition bars
    // Any part with data => show the section
    const mechKeys = ['engine','brakes','tyres','suspension','spark_plugs','air_filter','clutch'];
    const hasMech  = mechKeys.some(k => data['mech_' + k] != null);
    mechSection.style.display = hasMech ? '' : 'none';
    if (hasMech) {
        for (const part of MECH_PARTS) {
            const val = data['mech_' + part.key];
            setMechBar(part.fill, part.pct, val != null ? val : null);
        }
        // Needs service badge
        if (data.mechNeedsService) {
            needsServiceBadge.classList.remove('hidden');
            setWarning('needs_service', 'SERVICE DUE', true);
        } else {
            needsServiceBadge.classList.add('hidden');
            setWarning('needs_service', null, false);
        }
        // Low condition warnings
        const lowestPart = MECH_PARTS
            .map(p => data['mech_' + p.key])
            .filter(v => v != null)
            .reduce((m, v) => Math.min(m, v), 100);
        setWarning('part_crit', 'PART CRITICAL', lowestPart < 20);
    }

    // Gear
    if (CONFIG.showGear) {
        const g = data.gear ?? 0;
        gearLetter.textContent = g === 0 ? 'R' : (g === 1 && (data.speed || 0) < 2 ? 'N' : String(g));
    }

    // Seatbelt pill
    if (CONFIG.showSeatbelt) {
        setPill(seatbeltPill, data.seatbelt ? 'on' : 'warn');
        setWarning('seatbelt', 'NO SEATBELT', !data.seatbelt && (data.speed || 0) > 5);
    }

    // Engine pill
    if (CONFIG.showEngineStatus) {
        if (!data.engineOn) setPill(enginePill, 'off');
        else if ((data.engineHealth || 1000) < 300) setPill(enginePill, 'warn');
        else setPill(enginePill, 'on');
    }

    // Lock pill
    lockIconLocked.classList.toggle('hidden', !data.locked);
    lockIconUnlocked.classList.toggle('hidden', !!data.locked);
    setPill(lockPill, data.locked ? 'warn' : 'on');

    // Key pill — green if has key, amber if hotwired, grey if neither
    if (data.hasKey)         setPill(keyPill, 'on');
    else if (data.isHotwired) setPill(keyPill, 'warn');
    else                     setPill(keyPill, 'off');

    // Plate
    plateText.textContent = (data.plate || '------').toUpperCase();

    // Mileage
    const mi = data.mileage || 0;
    mileageText.textContent = mi >= 1000
        ? (mi / 1000).toFixed(1) + 'k km'
        : Math.round(mi) + ' km';

    // Passenger mode
    if (data.isPassenger && CONFIG.passengerMinimalHUD) {
        passengerBadge.classList.remove('hidden');
        gearBadge.style.opacity = '0.3';
        enginePill.style.display  = 'none';
        lockPill.style.display    = 'none';
        keyPill.style.display     = 'none';
        mechSection.style.display = 'none';
    } else {
        passengerBadge.classList.add('hidden');
        gearBadge.style.opacity = '';
        enginePill.style.display = '';
        lockPill.style.display   = '';
        keyPill.style.display    = '';
    }

    // Speed color
    speedValue.classList.remove('speed-warn', 'speed-crit');
    if ((data.engineHealth || 1000) < 150) speedValue.classList.add('speed-crit');
    else if ((data.fuel || 100) <= (data.fuelCritical || 10) && (data.fuel || 0) > 0) speedValue.classList.add('speed-warn');
}

function applyTheme(theme) {
    const validThemes = ['neutral', 'dark', 'light'];
    const t = validThemes.includes(theme) ? theme : 'neutral';
    document.documentElement.setAttribute('data-theme', t);
    CONFIG.theme = t;
}

function showHUD() {
    hudContainer.classList.remove('hidden');
    hudContainer.classList.add('fade-in');
    setTimeout(() => hudContainer.classList.remove('fade-in'), 400);
}
function hideHUD() {
    hudContainer.classList.add('hidden');
    warningList = {}; _refreshWarning();
}

window.addEventListener('message', ({ data: d }) => {
    switch (d.action) {
        case 'init':
            if (d.config) {
                CONFIG = { ...CONFIG, ...d.config };
                speedUnit.textContent = (CONFIG.speedUnit || 'mph').toUpperCase();
                if (!CONFIG.showSeatbelt)     seatbeltPill.style.display = 'none';
                if (!CONFIG.showEngineStatus) enginePill.style.display   = 'none';
                applyTheme(CONFIG.theme || 'neutral');
            }
            break;
        case 'showHUD':   showHUD(); break;
        case 'hideHUD':   hideHUD(); break;
        case 'updateHUD': if (d.data) updateHUD(d.data); break;
        case 'seatbelt':
            if (lastData) { lastData.seatbelt = d.on; updateHUD(lastData); }
            break;
        case 'setTheme':
            applyTheme(d.theme);
            break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    drawRPMArc(0);
    mechSection.style.display = 'none';
    fetch(`https://${GetParentResourceName()}/ready`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
    }).catch(() => {});
});

function GetParentResourceName() {
    const n = window['GetParentResourceName'];
    if (n && typeof n === 'function' && n !== GetParentResourceName) return n();
    return 'yoskii_vehiclehud';
}