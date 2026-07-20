const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());

// Global server memory
let store = {};

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        message: "Passkey isolated server is running perfectly!" 
    });
});

// 1. SET: Expects both the passkey and the variable name separated by a colon
app.get('/set/:passkey_token', (req, res) => {
    // Express will capture the entire "hjhvikvv:score" string inside req.params.passkey_token
    const storageKey = req.params.passkey_token;
    const val = req.query.val;

    if (val === undefined) {
        return res.status(400).json({ error: "Missing 'val' parameter." });
    }

    // This directly creates "hjhvikvv:score" as a completely unique key in memory
    store[storageKey] = val;

    res.json({ message: "Saved cleanly.", currentStore: store });
});

// 2. GET ALL: Debug route to see the raw map structure
app.get('/get', (req, res) => {
    return res.json(store);
});

// 3. GET SINGLE VARIABLE
app.get('/get/:passkey_token', (req, res) => {
    const storageKey = req.params.passkey_token;

    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable not found for this passkey." });
    }

    res.json({ [storageKey]: store[storageKey] });
});

// 4. REMOVE SINGLE VARIABLE
app.get('/remove/:passkey_token', (req, res) => {
    const storageKey = req.params.passkey_token;

    if (!(storageKey in store)) {
        return res.status(404).json({ error: "Variable does not exist." });
    }

    delete store[storageKey];
    res.json({ message: "Removed successfully." });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Isolated variable server running on port ${PORT}`);
});
