const express = require('express');
const cors = require('cors');

const app = express();
// Render automatically injects process.env.PORT. Fallback to 3000 locally.
const PORT = process.env.PORT || 3000; 

// Enable CORS so your website or PenguinMod can talk to this server
app.use(cors());

// Global server memory to hold your variables while the app is active
let store = {};

// 🟢 Fixes the "Not Found" error when visiting the main URL in your browser
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        message: "Variable host is running perfectly on Render!" 
    });
});

// 1. SET or CHANGE: /set/var1?val=10
app.get('/set/:key', (req, res) => {
    const { key } = req.params;
    const val = req.query.val;

    if (val === undefined) {
        return res.status(400).json({ error: "Missing 'val' parameter." });
    }

    // Save directly into server memory
    store[key] = val;

    res.json({ message: `Saved ${key} successfully`, currentStore: store });
});

// 2. GET: /get/var1 or /get
app.get('/get/:key?', (req, res) => {
    const { key } = req.params;
    
    // If no key is provided, return everything currently saved
    if (!key) {
        return res.json(store);
    }

    // If the variable doesn't exist yet, return a 404 error
    if (!(key in store)) {
        return res.status(404).json({ error: `Variable '${key}' not found.` });
    }

    res.json({ [key]: store[key] });
});

// 3. REMOVE: /remove/var1
app.get('/remove/:key', (req, res) => {
    const { key } = req.params;

    if (!(key in store)) {
        return res.status(404).json({ error: `Variable '${key}' does not exist.` });
    }

    delete store[key];

    res.json({ message: `Removed ${key}`, currentStore: store });
});

// Bind to 0.0.0.0 so Render can route public traffic into the app
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Variable server running on port ${PORT}`);
});
