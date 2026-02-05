// routes/notes.routes.js
const express = require('express');
const router = express.Router();

const { getAllNotes } = require('../controllers/notes.controller');

//GET /notes
router.get('/', getAllNotes);

module.exports = router;

