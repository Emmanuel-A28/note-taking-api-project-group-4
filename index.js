require('dotenv').config();
let notes = [
    {id: 1, title: "Welcome to Notes", content: "This is your first note. Lets do something fun with notes!"}];

const { error } = require('console');
const express = require('express');
const path = require("path");

const app = express();
const port = process.env.PORT;

app.use(express.json());

//creating an array to store notes

console.log(notes)
let currentId = 1;
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    // create new note
    const newNote = { id: notes.length + 1, title, content };
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
app.get('/notes/:id', validateId, (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    if (!note) {
        return res.status(404).json({ error: 'Note not found.' });
    }
    res.status(200).json(note);
});
//update existing note
app.patch('/notes/:id', validateId, (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const note = notes.find(n => n.id === id);
    if (!note) {
        return res.status(404).json({error: "Note not found" });
    }
    Object.assign(note, updates);
    res.json({message: "Note patched successfully!", note
    });
});
//delete existing note
app.delete('/notes/:id', validateId, (req, res) => {
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
//Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: "Something went wrong!" });
});
//starting the server

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//middleware to validate note ID
function validateId(req, res, next) {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId) || noteId <= 0) {
        return res.status(400).json({ error: 'Invalid note ID.' });
    }
    next();
};

