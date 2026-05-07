const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

// Get all notes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a note
router.post('/', async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content, tags) VALUES ($1, $2, $3) RETURNING *',
      [title, content, tags]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save summary to a note
router.patch('/:id/summary', async (req, res) => {
  const { id } = req.params;
  const { summary } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notes SET summary = $1 WHERE id = $2 RETURNING *',
      [summary, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search notes
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE content ILIKE $1 OR title ILIKE $1 OR tags ILIKE $1',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summarize a note using HuggingFace
router.post('/:id/summarize', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
      const response = await axios.post(
        'https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn',
        { inputs: content },
        { 
          headers: { 
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      const summary = response.data[0]?.summary_text || 'No summary returned.';
      await pool.query(
        'UPDATE notes SET summary = $1 WHERE id = $2',
        [summary, id]
      );
      res.json({ summary });
    } catch (err) {
      console.error('HuggingFace error:', err.response?.data || err.message);
      res.status(500).json({ error: err.response?.data || err.message });
    }
  });

module.exports = router;