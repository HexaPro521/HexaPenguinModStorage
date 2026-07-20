const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Persistent storage ---------------------------------------------------
// A plain in-memory object gets wiped every time a free-tier host (like
// Render's free plan) spins the service down and back up. Writing to a
// JSON file on disk means the data survives restarts as long as the
// underlying disk isn't ephemeral. For real production use, swap this for
// a proper database (Redis, Postgres, etc.) instead of a JSON file.
const DATA_FILE = path.join(__dirname, 'store.json');

let store = {};
try {
    if (fs.existsSync(DATA_FILE)) {
        store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
} catch (err) {
    console.error('Could not read existing store.json, starting fresh:', err);
    store = {};
}

function saveStore() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(store), 'utf8');
    } catch (err) {
        console.error('Could not write store.json:', err);
    }
}

app.get('/', (req, res) => {
    res.status(200).json({
        status: "online",
        message: "Passkey isolated server is running perfectly!"
    });
});

// 1. SET: expects "passkey:variableName" as a single path segment
app.get('/set/:passkey_token', (req, res) => {
    const storageKey = req.params.passkey_token;
    const val = req.query.val;

    if (val === undefined) {
        return res.status(400).json({ error: "Missing 'val' parameter." });
    }

    store[storageKey] = val;
    saveStore();
    res.json({ message: "Saved cleanly." });
});

// 2. GET SINGLE VARIABLE
// (The old debug route that dumped the ENTIRE store — every user's passkey
// and values at once — has been removed. It was a real security hole:
// anyone who found the URL could read everyone else's "private" data.)
app.get('/get/:passkey_token', (req, res) => {
    const storageKey = req.params.passkey_token;
    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable not found for this passkey." });
    }
    res.json({ [storageKey]: store[storageKey] });
});

// 3. REMOVE SINGLE VARIABLE
app.get('/remove/:passkey_token', (req, res) => {
    const storageKey = req.params.passkey_token;
    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable does not exist." });
    }
    delete store[storageKey];
    saveStore();
    res.json({ message: "Removed successfully." });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Isolated variable server running on port ${PORT}`);
});
