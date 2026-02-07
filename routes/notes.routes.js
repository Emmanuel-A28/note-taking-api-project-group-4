const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// File path for data storage
const DATA_FILE = path.join(__dirname, '../data.json');

// --- HELPERS ---
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (err) { return []; }
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

function isNonEmptyString(val) {
    return typeof val === 'string' && val.trim().length > 0;
}

// --- MIDDLEWARE ---
function validateId(req, res, next) {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId) || noteId <= 0) {
        return res.status(400).json({ error: 'Invalid ID. Must be a positive number.' });
    }
    next();
}

// --- ROUTES ---

// 1. READ ALL (with Search & Sort)
router.get('/', (req, res) => {
    let notes = readData();
    const { search, type } = req.query;

    if (search) {
        notes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (type) {
        notes = notes.filter(n => n.type === type);
    }

    notes.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.date);
        const dateB = new Date(b.updatedAt || b.date);
        return dateB - dateA;
    });
    res.json(notes);
});

// 2. CREATE with Validation
router.post('/', (req, res) => {
    const { title, content, type } = req.body;

    const errors = [];
    if (!isNonEmptyString(title)) errors.push("Title is required and must be a string.");
    if (!isNonEmptyString(content)) errors.push("Content is required and must be a string.");

    if (errors.length > 0) return res.status(400).json({ success: false, errors });

    const notes = readData();
    const newNote = {
        id: Date.now(), // Unique timestamp ID
        title: title.trim(),
        content: content.trim(),
        type: type || "note",
        date: new Date().toISOString(),
        updatedAt: null,
        completed: type === "todo" ? false : undefined
    };

    notes.push(newNote);
    writeData(notes);
    res.status(201).json({ message: 'Note created.', note: newNote });
});

// 3. UPDATE (PATCH) with Validation
router.patch('/:id', validateId, (req, res) => {
    const id = parseInt(req.params.id);
    const notes = readData();
    const note = notes.find(n => n.id === id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    const { title, content } = req.body;

    if (title !== undefined && !isNonEmptyString(title)) {
        return res.status(400).json({ error: "Title cannot be empty." });
    }
    if (content !== undefined && !isNonEmptyString(content)) {
        return res.status(400).json({ error: "Content cannot be empty." });
    }

    if (title) note.title = title.trim();
    if (content) note.content = content.trim();
    note.updatedAt = new Date().toISOString();

    writeData(notes);
    res.json({ message: "Note updated!", note });
});

// 4. TOGGLE TODO
router.patch('/:id/toggle', validateId, (req, res) => {
    const notes = readData();
    const note = notes.find(n => n.id === parseInt(req.params.id));

    if (!note) return res.status(404).json({ error: "Note not found" });

    note.completed = !note.completed;
    note.updatedAt = new Date().toISOString();

    writeData(notes);
    res.json({ message: "Status toggled", note });
});

// 5. DELETE
router.delete('/:id', validateId, (req, res) => {
    let notes = readData();
    const id = parseInt(req.params.id);
    const noteExists = notes.some(n => n.id === id);

    if (!noteExists) return res.status(404).json({ error: "Note not found" });

    notes = notes.filter(n => n.id !== id);
    writeData(notes);
    res.json({ message: `Note deleted.` });
});

module.exports = router;