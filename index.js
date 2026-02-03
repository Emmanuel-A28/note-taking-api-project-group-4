const express = require('express');
const app = express();
app.use(express.json());

//creating an array to store notes
let notes = [];
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
//starting the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port${port}`);
});