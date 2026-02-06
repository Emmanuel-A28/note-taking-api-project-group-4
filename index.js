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

// --- MIDDLEWARE ---

function validateId(req, res, next) {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId) || noteId <= 0) {
        return res.status(400).json({ error: 'Invalid note ID.' });
    }
    next();
}

// --- ROUTES ---

// 1. CREATE with Timestamps
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
    res.status(201).json({ message: 'Note created successfully.', note: newNote });
});

// 2. READ ALL with Search & Sorting
app.get('/notes', (req, res) => {
    const { search } = req.query;
    let filteredNotes = [...notes];

    // Search Logic
    if (search) {
        filteredNotes = notes.filter(n => 
            n.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Sort Logic (Newest/Most recently updated at the top)
    filteredNotes.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
    });

    res.status(200).json(filteredNotes);
});

// 3. READ ONE
app.get('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.status(200).json(note);
});

// 4. UPDATE with ID Protection & Timestamp
app.patch('/notes/:id', validateId, (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(n => n.id === id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    // Destructure to prevent overwriting id or createdAt
    const { id: _, createdAt: __, ...updates } = req.body; 
    
    Object.assign(note, updates);
    note.updatedAt = new Date().toLocaleString(); 

    res.json({ message: "Note updated successfully!", note });
});

// 5. DELETE
app.delete('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const noteExists = notes.some(n => n.id === noteId);

    if (!noteExists) return res.status(404).json({ error: "Note not found." });

    notes = notes.filter(n => n.id !== noteId);
    res.status(200).json({ message: `Note ${noteId} deleted.` });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});