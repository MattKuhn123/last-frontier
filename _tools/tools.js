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

// --- Save helper ---

function saveJSON(endpoint, data) {
    return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 4) + '\n'
    }).then(r => r.json());
}
