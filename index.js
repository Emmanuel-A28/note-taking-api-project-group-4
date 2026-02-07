require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- IN-MEMORY DATABASE ---
let notes = [
    { 
        id: 1, 
        title: "Welcome to Notes", 
        content: "This is your first note. Try searching for me!",
        createdAt: new Date().toLocaleString(),
        updatedAt: null
    }
];

let nextId = 2; 

// --- VALIDATION HELPERS ---

/**
 * Validates that the input is a non-empty string
 */
function isNonEmptyString(val) {
    return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Middleware to check if the ID in the URL is a valid number
 */
function validateId(req, res, next) {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId) || noteId <= 0) {
        return res.status(400).json({ error: 'Invalid note ID. It must be a positive number.' });
    }
    next();
}

// --- ROUTES ---

// 1. CREATE with Strict Validation
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // Validation Check
    const errors = [];
    if (!isNonEmptyString(title)) errors.push("Title is required and must be a string.");
    if (!isNonEmptyString(content)) errors.push("Content is required and must be a string.");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const newNote = { 
        id: nextId++, 
        title: title.trim(), 
        content: content.trim(),
        createdAt: new Date().toLocaleString(),
        updatedAt: null 
    };
    
    notes.push(newNote);
    res.status(201).json({ message: 'Note created successfully.', note: newNote });
});

// 2. READ ALL (unchanged)
app.get('/notes', (req, res) => {
    const { search } = req.query;
    let filteredNotes = [...notes];

    if (search) {
        filteredNotes = notes.filter(n => 
            n.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    filteredNotes.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
    });

    res.status(200).json(filteredNotes);
});

// 3. READ ONE (unchanged)
app.get('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.status(200).json(note);
});

// 4. UPDATE with Field Validation
app.patch('/notes/:id', validateId, (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(n => n.id === id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    const { title, content } = req.body;

    // Validation for optional fields
    if (title !== undefined && !isNonEmptyString(title)) {
        return res.status(400).json({ error: "Updated title cannot be empty." });
    }
    if (content !== undefined && !isNonEmptyString(content)) {
        return res.status(400).json({ error: "Updated content cannot be empty." });
    }

    // Clean data and update
    if (title) note.title = title.trim();
    if (content) note.content = content.trim();
    
    note.updatedAt = new Date().toLocaleString(); 

    res.json({ message: "Note updated successfully!", note });
});

// 5. DELETE (unchanged)
app.delete('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const noteExists = notes.some(n => n.id === noteId);

    if (!noteExists) return res.status(404).json({ error: "Note not found." });

    notes = notes.filter(n => n.id !== noteId);
    res.status(200).json({ message: `Note ${noteId} deleted.` });
});

app.listen(PORT, () => {
    console.log(`🚀 Validated Server running on http://localhost:${PORT}`);
});