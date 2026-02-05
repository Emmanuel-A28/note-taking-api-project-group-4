const express = require('express');
const app = express();
const PORT = 3000;
//Middleware 
app.use(express.json());

//Import your routes
const notesRoutes = require('./routes/notes.routes');

//Tell Express to use the routes
app.use('/notes', notesRoutes);
// Test route (important!)
app.get('/', function (req, res) {
    res.send('Note-taking API is running');
});
// Start server
app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
});
