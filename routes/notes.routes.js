const express = require("express");
const router = express.Router();

let notes = [];

router.get("/", (req, res) => {
  res.json(notes);
});

router.post("/", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content required" });
  }

  const newNote = {
    id: notes.length + 1,
    title,
    content
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

module.exports = router;

