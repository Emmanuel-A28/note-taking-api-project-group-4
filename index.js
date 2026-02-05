require('dotenv').config();
const fs = require('fs');
const DATA_FILE = './data.json';
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data file:", err);
        return [];
    }
};
const writeData = (data) => {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};
let notes = [
    {id: 1, title: "Welcome to Notes", content: "This is your first note. Lets do something fun with notes!"}];

const { error } = require('console');
const express = require('express');
const path = require("path");
const { type } = require('os');

const app = express();
const port = process.env.PORT;

app.use(express.json());

//creating an array to store notes

console.log(notes)
let currentId = 1;
app.post('/notes', (req, res) => {
    // validation
    if (!req.body.title || !req.body.content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    const notes = readData();
    const newEntry = { 
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        type: req.body.type || "note",
        date: new Date().toISOString(),
        completed: req.body.type === "todo" ? false : undefined
    };
    notes.push(newEntry);
    writeData(notes);
    console.log(`New note added ${newEntry.type}: ${newEntry.title}`);
    res.status(201).json({
        message: 'Note created successfully.',
        note: newEntry
    });
    const { title, content } = req.body;

    
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
    try {
        let notes = readData(); // Pull from your JSON file
        const { title, type } = req.query;

        // 1. Filter by title if the user searched for one
        if (title) {
            notes = notes.filter(n => n.title.toLowerCase().includes(title.toLowerCase()));
        }

        // 2. Filter by type (note or todo) if specified
        if (type) {
            notes = notes.filter(n => n.type === type);
        }

        // 3. Sort by date (newest first)
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(notes);
    } catch (error) {
        // This catch block is what's sending that 500 error in your screenshot
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});
//update existing note
app.patch('/notes/:id/toggle', validateId, (req, res) => {
    const notes = readData();
    const id = parseInt(req.params.id);
    
    // 1. Find the specific item
    const note = notes.find(n => n.id === id);

    if (!note) {
        return res.status(404).json({ error: "Item not found" });
    }

    // 2. THE LOGIC: If it's a todo, flip the true/false value
    // If it's a note, we can initialize it to true
    if (note.completed === undefined) {
        note.completed = true; 
    } else {
        note.completed = !note.completed; // This turns true to false, and false to true
    }

    // 3. Save the change to data.json
    writeData(notes);

    // 4. Send a clear response so you can see the change
    res.json({
        message: `Status updated for: ${note.title}`,
        currentlyCompleted: note.completed,
        item: note
    });
});

// DELETE a note by ID
app.delete('/notes/:id', validateId, (req, res) => {
    // 1. Load the latest data from the file
    const notes = readData();
    
    // 2. Parse the ID from the URL (convert string to number)
    const id = parseInt(req.params.id);

    // 3. Find the index of the item to ensure it exists
    const noteIndex = notes.findIndex(n => n.id === id);

    // 4. Handle the "Not Found" case
    if (noteIndex === -1) {
        return res.status(404).json({ 
            error: "Item not found", 
            message: `Could not find an entry with ID: ${id}` 
        });
    }

    // 5. Remove the item from the array
    // .splice(index, count) modifies the original array
    const deletedNote = notes.splice(noteIndex, 1);

    // 6. SAVE the updated array back to data.json
    writeData(notes);

    // 7. Send confirmation back to the user
    res.json({
        message: "Entry successfully deleted",
        deletedItem: deletedNote[0]
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
