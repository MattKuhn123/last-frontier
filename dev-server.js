// --- Dev Server ---
// Zero-dependency Node.js server for local development.
// Serves static files and exposes write endpoints so the tools
// can overwrite js/config.js, js/shapes.js, and sfx/*.wav.
//
// Usage:  node dev-server.js
// Then:   http://localhost:8080

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.wav':  'audio/wav',
    '.mp3':  'audio/mpeg',
    '.ico':  'image/x-icon',
};

// Allowed write targets (path relative to ROOT => actual file)
const WRITE_TARGETS = {
    '/api/save-config': 'js/config.js',
    '/api/save-shapes': 'js/shapes.js',
};

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // --- CORS for tool pages opened as file:// ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // --- Write endpoints (text) ---
    if (req.method === 'POST' && WRITE_TARGETS[req.url]) {
        const filePath = path.join(ROOT, WRITE_TARGETS[req.url]);
        const body = await readBody(req);
        fs.writeFile(filePath, body, err => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            } else {
                console.log(`  wrote ${WRITE_TARGETS[req.url]}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            }
        });
        return;
    }

    // --- Write endpoint (binary SFX) ---
    if (req.method === 'POST' && req.url.startsWith('/api/save-sfx/')) {
        const filename = path.basename(req.url.slice('/api/save-sfx/'.length));
        if (!filename || filename.includes('..')) {
            res.writeHead(400); res.end('bad filename'); return;
        }
        const filePath = path.join(ROOT, 'sfx', filename);
        const body = await readBody(req);
        fs.writeFile(filePath, body, err => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            } else {
                console.log(`  wrote sfx/${filename}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            }
        });
        return;
    }

    // --- Static file serving ---
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(ROOT, urlPath);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end(); return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
    console.log(`Tools at http://localhost:${PORT}/_tools/`);
});
