require('dotenv').config();
const express = require('express');

const app = express();
// Use the port from .env or default to 3000
const PORT = process.env;

// Middleware to parse JSON bodies
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let notes = [
    { 
        id: 1, 
        title: "Welcome to Notes", 
        content: "This is your first note. Let's do something fun!",
        createdAt: new Date().toLocaleString(),
        updatedAt: null
    }
];

// Global counter for unique IDs
let nextId = 2; 

// --- MIDDLEWARE ---

/**
 * Validates that the ID in the URL is a positive number.
 */
function validateId(req, res, next) {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId) || noteId <= 0) {
        return res.status(400).json({ error: 'Invalid note ID. Must be a positive number.' });
    }
    next();
}

// --- ROUTES ---

// 1. CREATE: Add a new note
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }

    const newNote = { 
        id: nextId++, 
        title, 
        content,
        createdAt: new Date().toLocaleString(),
        updatedAt: null 
    };
    
    notes.push(newNote);

    res.status(201).json({
        message: 'Note created successfully.',
        note: newNote
    });
});

// 2. READ ALL: Get all notes
app.get('/notes', (req, res) => {
    res.status(200).json(notes);
});

// 3. READ ONE: Get a specific note by ID
app.get('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
        return res.status(404).json({ error: 'Note not found.' });
    }
    res.status(200).json(note);
});

// 4. UPDATE (Partial): Update specific fields of a note
app.patch('/notes/:id', validateId, (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(n => n.id === id);

    if (!note) {
        return res.status(404).json({ error: "Note not found" });
    }

    // Safety: Strip 'id' and 'createdAt' from req.body so they can't be changed
    const { id: _, createdAt: __, ...updates } = req.body; 
    
    Object.assign(note, updates);
    note.updatedAt = new Date().toLocaleString(); 

    res.json({ 
        message: "Note updated successfully!", 
        note 
    });
});

// 5. DELETE: Remove a note
app.delete('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const noteExists = notes.some(n => n.id === noteId);

    if (!noteExists) {
        return res.status(404).json({ error: "Note not found." });
    }

    notes = notes.filter(n => n.id !== noteId);
    res.status(200).json({ 
        message: `Note ${noteId} has been deleted.`,
        remainingCount: notes.length 
    });
});

// --- ERROR HANDLING ---

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global internal error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on our end!" });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});