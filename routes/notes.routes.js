const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Points to data.json in your main project folder
const DATA_FILE = path.join(__dirname, '../data.json');

// --- HELPER FUNCTIONS ---
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- ROUTES ---

// 1. GET ALL (with Search & Sorting)
router.get('/', (req, res) => {
    try {
        let notes = readData();
        const { search, type } = req.query;

        // Search by keyword in title
        if (search) {
            notes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
        }

        // Filter by type (note/todo)
        if (type) {
            notes = notes.filter(n => n.type === type);
        }

        // Sort: Newest/Most recently modified first
        notes.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.date);
            const timeB = new Date(b.updatedAt || b.date);
            return timeB - timeA;
        });

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: "Failed to load notes" });
    }
});

// 2. POST (Create Note)
router.post('/', (req, res) => {
    const { title, content, type } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    const notes = readData();
    const newEntry = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        type: type || "note",
        date: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: type === "todo" ? false : undefined
    };

    notes.push(newEntry);
    writeData(notes);
    res.status(201).json({ message: "Note created!", note: newEntry });
});

// 3. PATCH (Update Content & Modified Time)
router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    const notes = readData();
    const note = notes.find(n => n.id === id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    // Update fields and refresh timestamp
    Object.assign(note, req.body);
    note.updatedAt = new Date().toISOString();

    writeData(notes);
    res.json({ message: "Note updated successfully", note });
});

// 4. PATCH (Toggle Todo Status)
router.patch('/:id/toggle', (req, res) => {
    const id = Number(req.params.id);
    const notes = readData();
    const note = notes.find(n => n.id === id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    note.completed = !note.completed;
    note.updatedAt = new Date().toISOString();

    writeData(notes);
    res.json({ message: "Status toggled", note });
});

// 5. DELETE
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    let notes = readData();
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) return res.status(404).json({ error: "Note not found" });

    const deleted = notes.splice(noteIndex, 1);
    writeData(notes);
    res.json({ message: "Deleted successfully", deletedItem: deleted[0] });
});

module.exports = router;