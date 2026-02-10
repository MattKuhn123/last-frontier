// ============================================================
// Shared utilities for Last Frontier tool pages
// ============================================================

// --- Form helpers ---

function makeSection(title) {
    const div = document.createElement('div');
    div.className = 'section';
    const h = document.createElement('h2');
    h.textContent = title;
    div.appendChild(h);
    return div;
}

function fieldRow(labelText, inputEl) {
    const row = document.createElement('div');
    row.className = 'field-row';
    const lbl = document.createElement('label');
    lbl.textContent = labelText;
    row.appendChild(lbl);
    if (inputEl) row.appendChild(inputEl);
    return row;
}

function textInput(value, onChange) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.oninput = () => onChange(inp.value);
    return inp;
}

function numberInput(value, min, max, onChange) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = value;
    inp.min = min;
    inp.max = max;
    inp.oninput = () => onChange(parseInt(inp.value) || 0);
    return inp;
}

function selectInput(value, options, onChange) {
    const sel = document.createElement('select');
    for (const opt of options) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        if (opt === value) o.selected = true;
        sel.appendChild(o);
    }
    sel.onchange = () => onChange(sel.value);
    return sel;
}

// --- Button feedback ---

function flashButton(btn, text, duration) {
    if (typeof btn === 'string') btn = document.getElementById(btn);
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, duration || 1500);
}

// --- Preset system ---

function setupPresets({ container, storageKey, getData, setData, saveInput, saveBtn }) {
    function load() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
    }
    function save(p) { localStorage.setItem(storageKey, JSON.stringify(p)); }

    function render() {
        const row = typeof container === 'string' ? document.getElementById(container) : container;
        row.innerHTML = '';
        const presets = load();
        for (const name of Object.keys(presets)) {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.innerHTML = name + '<span class="delete">\u00d7</span>';
            btn.querySelector('.delete').onclick = (e) => {
                e.stopPropagation();
                const p = load(); delete p[name]; save(p); render();
            };
            btn.onclick = () => { setData(presets[name]); };
            row.appendChild(btn);
        }
    }

    const saveBtnEl = typeof saveBtn === 'string' ? document.getElementById(saveBtn) : saveBtn;
    const saveInputEl = typeof saveInput === 'string' ? document.getElementById(saveInput) : saveInput;

    saveBtnEl.onclick = () => {
        const name = saveInputEl.value.trim();
        if (!name) return;
        const presets = load();
        presets[name] = getData();
        save(presets);
        saveInputEl.value = '';
        render();
    };

    return { render };
}

// --- Save as Default ---

function setupSaveDefault(btnId, saveFn) {
    if (location.hostname !== 'localhost' || location.port !== '8080') return;
    const btn = document.getElementById(btnId);
    btn.style.display = '';
    btn.onclick = () => {
        Promise.resolve(saveFn())
            .then(() => { btn.textContent = 'Saved!'; })
            .catch(() => { btn.textContent = 'Error'; })
            .finally(() => setTimeout(() => { btn.textContent = 'Save as Default'; }, 1500));
    };
}

// --- Color input (picker + hex text) ---

const COLOR_PALETTE = [
    '#fff', '#aaa', '#555',
    '#f44', '#f90', '#ff0',
    '#4f4', '#0ff', '#48f',
    '#88f', '#aaf', '#f4f',
];

function colorInput(value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'color-pair';

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = toHex6(value);

    const text = document.createElement('input');
    text.type = 'text';
    text.value = value;

    function set(v) {
        picker.value = toHex6(v);
        text.value = v;
        onChange(v);
    }

    picker.oninput = () => { text.value = picker.value; onChange(picker.value); };
    text.oninput = () => {
        if (/^#[0-9a-fA-F]{3,6}$/.test(text.value)) {
            picker.value = text.value.length === 4
                ? '#' + text.value[1]+text.value[1] + text.value[2]+text.value[2] + text.value[3]+text.value[3]
                : text.value;
            onChange(text.value);
        }
    };

    const swatches = document.createElement('div');
    swatches.className = 'color-swatches';
    for (const c of COLOR_PALETTE) {
        const s = document.createElement('span');
        s.style.background = c;
        s.title = c;
        s.onclick = () => set(c);
        swatches.appendChild(s);
    }

    wrapper.append(picker, text, swatches);
    return wrapper;
}

// --- Hex color helpers ---

function toHex6(hex) {
    if (hex && hex.length === 4) {
        return '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];
    }
    return hex;
}

// --- Deep copy / deep assign ---

function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

function deepAssign(dst, src) {
    for (const key of Object.keys(src)) {
        if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
            if (!dst[key]) dst[key] = {};
            deepAssign(dst[key], src[key]);
        } else {
            dst[key] = src[key];
        }
    }
}

// --- Slider row builder ---

function sliderRow(containerId, label, value, min, max, step, onChange, defaultValue) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    const row = document.createElement('div');
    row.className = 'config-row';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min; slider.max = max; slider.step = step;
    slider.value = value;

    const val = document.createElement('span');
    val.className = 'val';
    val.textContent = formatSliderVal(value, step);

    const rst = document.createElement('span');
    rst.className = 'rst';
    rst.textContent = '\u21ba';
    rst.title = 'Reset to ' + defaultValue;
    rst.onclick = () => {
        slider.value = defaultValue;
        val.textContent = formatSliderVal(defaultValue, step);
        onChange(defaultValue);
    };

    slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        val.textContent = formatSliderVal(v, step);
        onChange(v);
    });

    row.append(lbl, slider, val, rst);
    container.appendChild(row);
    return { slider, val };
}

function formatSliderVal(v, step) {
    if (step >= 1) return v.toString();
    return Number(v).toFixed(Math.max(0, -Math.floor(Math.log10(step))));
}

// --- Nested path helpers ---

function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => o && o[k], obj);
}

function setByPath(obj, path, val) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!o[keys[i]]) o[keys[i]] = {};
        o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = val;
}

// --- Static text display ---

function staticText(value) {
    const span = document.createElement('span');
    span.style.color = '#888';
    span.style.fontSize = '12px';
    span.textContent = value;
    return span;
}

// --- Save helper ---

function saveJSON(endpoint, data) {
    return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 4) + '\n'
    }).then(r => r.json());
}
