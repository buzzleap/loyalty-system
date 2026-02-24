const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the main HTML file
app.use(express.static(path.join(__dirname)));

// Generic proxy for all iiko API calls
// Frontend calls /api/iiko/* → server forwards to https://api-ru.iiko.services/api/1/*
app.post('/api/iiko/*', async (req, res) => {
    // Extract the path after /api/iiko/
    const iikoPath = req.params[0];
    const iikoUrl = `https://api-ru.iiko.services/api/1/${iikoPath}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
    }

    try {
        const response = await fetch(iikoUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body),
        });

        const data = await response.text();

        // Forward the status code and response
        res.status(response.status);
        res.set('Content-Type', response.headers.get('content-type') || 'application/json');
        res.send(data);
    } catch (error) {
        console.error(`Proxy error [${iikoPath}]:`, error.message);
        res.status(502).json({
            error: 'Failed to connect to iiko API',
            details: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`PLAYPOOL Loyalty System running at http://localhost:${PORT}`);
});
