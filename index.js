require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Import modular routes
const notesRoutes = require('./routes/notes.routes');

// Use routes with prefix
app.use('/notes', notesRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Modular Notes API with Validation and File Storage is running!');
});

app.listen(PORT, () => {
    console.log(`📡 Server active at http://localhost:${PORT}`);
});
