require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Import the Route Module
const notesRoutes = require('./routes/notes.routes');

// Mount the routes at the '/notes' prefix
app.use('/notes', notesRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('✅ Note-taking API is running and modularized!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is live at http://localhost:${PORT}`);
});