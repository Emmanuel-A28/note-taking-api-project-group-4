require("dotenv").config();
//create and read routes  - Audrey
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
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
//creating an array to store notes
let notes = [];
console.log(notes)
let currentId = 1;
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required.' });
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
// Update an entire note by id
app.put("/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content required" });
  }
// validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required.' });
    }
  // Find the note by id
  const noteIndex = notes.findIndex(n => n.id === parseInt(id));
  if (noteIndex === -1) {
    return res.status(404).json({ message: "Note not found" });
  }

  // Replace the note
  notes[noteIndex] = { id: parseInt(id), title, content };
  res.json(notes[noteIndex]);
});

// update existing note
app.patch('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const updates = req.body;

    const note = notes.find(n => n.id === noteId);

    if (!note) {
        return res.status(404).json({ error: "Note not found" });
    }

    Object.assign(note, updates);

    res.status(200).json({
        message: "Note patched successfully!",
        note
    });
});

//delete existing note
app.delete('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);

    const noteExists = notes.some(n => n.id === noteId);

    if (!noteExists) {
        return res.status(404).json({ error: "Note not found." });
    }

    notes = notes.filter(n => n.id !== noteId);

    res.status(200).json({
        message: `Note ${noteId} has been deleted.`,
        remainingNotes: notes
    });
});

//starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
