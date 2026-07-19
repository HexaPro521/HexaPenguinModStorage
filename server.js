const express = require('express');
const cors = require('cors');
const { Client } = require('@replit/object-storage');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());

// Initialize Replit App Storage
const storage = new Client();
const DB_KEY = 'variable_store';

// Helper to safely fetch data from the cloud bucket
async function loadStore() {
    try {
        const data = await storage.download_as_text(DB_KEY);
        return JSON.parse(data);
    } catch (err) {
        // If the key doesn't exist yet, return an empty object
        return {};
    }
}

// Helper to update the cloud bucket
async function saveStore(data) {
    try {
        await storage.upload_from_text(DB_KEY, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Cloud storage save error:", err);
    }
}

// Health check endpoint for Cloud Run validation
app.get('/', (req, res) => {
    res.status(200).json({ status: "online" });
});

// 1. SET or CHANGE: /set/var1?val=10
app.get('/set/:key', async (req, res) => {
    const { key } = req.params;
    const val = req.query.val;

    if (val === undefined) {
        return res.status(400).json({ error: "Missing 'val' parameter." });
    }

    const store = await loadStore();
    store[key] = val;
    await saveStore(store);

    res.json({ message: `Saved ${key} permanently`, currentStore: store });
});

// 2. GET: /get/var1 or /get
app.get('/get/:key?', async (req, res) => {
    const { key } = req.params;
    const store = await loadStore();
    
    if (!key) {
        return res.json(store);
    }

    if (!(key in store)) {
        return res.status(404).json({ error: `Variable '${key}' not found.` });
    }

    res.json({ [key]: store[key] });
});

// 3. REMOVE: /remove/var1
app.get('/remove/:key', async (req, res) => {
    const { key } = req.params;
    const store = await loadStore();

    if (!(key in store)) {
        return res.status(404).json({ error: `Variable '${key}' does not exist.` });
    }

    delete store[key];
    await saveStore(store);

    res.json({ message: `Removed ${key}`, currentStore: store });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Variable server running on port ${PORT}`);
});
