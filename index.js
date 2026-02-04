require("dotenv").config();

const express = require('express');
const path = require("path");

const app = express();
const port = process.env.PORT || 2000;

app.use(express.json());

//creating an array to store notes
let notes = [];
console.log(notes)
let currentId = 1;
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    // create new note
    const newNote = { id: currentId++, title, content };
    notes.push(newNote);
    res.status(201).json({
        message: 'Note created successfully.',
        note: newNote
    });

});
//read all notes
app.get('/notes', (req, res) => {
    res.status(200).json(notes);
});
//read single note
app.get('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    if (!note) {
        return res.status(404).json({ error: 'Note not found.' });
    }
    res.status(200).json(note);
});
//update existing note
app.patch('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const updates = req.body;
    const note = note.find(n => n.id === noteId);
    if (!note) {
        return res.status(404).json({error: "Note not found" });
    }
    Object.assign(note, updates);
    res.json({message: "Note patched successfully!", note
    });
});
//delete existing note
app.get('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const noteExists = notes.some(n => n.id === noteId);
    if (!noteExists) {
        return res.status(404).json({ error: "Note not found. Nothing to delete." });
    }
    notes = notes.filter(n => n.id !== noteId);
    res.status(200).json({
        message: `Note ${noteId} has been deleted.`,
        remainingNotes: notes
    });
});
//starting the server

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

