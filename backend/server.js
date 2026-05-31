const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Analyze Placeholder
app.post('/api/ai/analyze', (req, res) => {
    const { ANTHROPIC_API_KEY } = process.env;
    const hasKey = Boolean(ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.trim() !== '');

    if (!hasKey) {
        return res.json({
            insights: [
                "[Mock Insight] Revenue trends are showing a 15% increase over the last quarter.",
                "[Mock Insight] Suggested Action: Review top-performing customer segments to double down on acquisition.",
                "[Mock Insight] AI API key is missing. This is a placeholder response."
            ],
            status: "mock"
        });
    }

    // In a real implementation, this would call Anthropic using the server-side API key.
    // We are currently returning a placeholder indicating the key is present but not wired.
    res.json({
        insights: [
            "[Live Insight Pending] Received data for analysis.",
            "Backend Anthropic integration is queued for Phase 2."
        ],
        status: "placeholder_with_key"
    });
});

// AI Chat Placeholder
app.post('/api/ai/chat', (req, res) => {
    const { ANTHROPIC_API_KEY } = process.env;
    const hasKey = Boolean(ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.trim() !== '');

    if (!hasKey) {
        return res.json({
            reply: "[Mock Reply] Hello! I am the SBD AI Assistant. The Anthropic API key is currently not configured, so I cannot answer complex queries yet.",
            status: "mock"
        });
    }

    res.json({
        reply: "[Live Reply Pending] The server has the AI key, but the full Anthropic integration is scheduled for Phase 2.",
        status: "placeholder_with_key"
    });
});

app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});
