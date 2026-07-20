const express = require('express');
const cors = require('cors');

const app = express();
// Render automatically injects process.env.PORT. Fallback to 3000 locally.
const PORT = process.env.PORT || 3000; 

// Enable CORS so your PenguinMod projects can talk to this server
app.use(cors());

// Global server memory to hold your variables while the app is active
let store = {};

// Fixes the "Not Found" error when visiting the main URL in your browser
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        message: "Passkey Variable Host is running perfectly on Render!" 
    });
});

// 1. SET: Accept any user token sent up by the extension blocks
app.get('/set/:key', (req, res) => {
    const { key } = req.params;
    const val = req.query.val;
    const token = req.headers['x-user-token'] || 'anonymous'; // Grab custom token or fallback

    if (val === undefined) {
        return res.status(400).json({ error: "Missing 'val' parameter." });
    }

    // Uniquely saves it under the custom passkey prefix (e.g., "hjhvikvv:score")
    const storageKey = `${token}:${key}`;
    store[storageKey] = val;

    res.json({ message: "Saved securely.", currentStore: store });
});

// 2. GET ALL: Debug route to see raw memory mapping
app.get('/get', (req, res) => {
    return res.json(store);
});

// 3. GET SINGLE KEY: Look up by user token prefix
app.get('/get/:key', (req, res) => {
    const { key } = req.params;
    const token = req.headers['x-user-token'] || 'anonymous';
    
    const storageKey = `${token}:${key}`;

    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable not found." });
    }

    res.json({ [key]: store[storageKey] });
});

// 4. REMOVE: Deletes the key under this passkey
app.get('/remove/:key', (req, res) => {
    const { key } = req.params;
    const token = req.headers['x-user-token'] || 'anonymous';
    const storageKey = `${token}:${key}`;

    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable does not exist." });
    }

    delete store[storageKey];
    res.json({ message: "Removed successfully." });
});

// Bind to 0.0.0.0 so Render can route public traffic into the app
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Passkey variable server running on port ${PORT}`);
});
