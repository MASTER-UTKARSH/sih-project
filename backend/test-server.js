require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'DPIS Backend is running!'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Hello from DPIS!',
    googleAI: process.env.GOOGLE_AI_API_KEY ? 'Configured' : 'Not configured'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DPIS Backend is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
