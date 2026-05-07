const express = require('express');
const cors = require('cors');
require('dotenv').config();

const notesRouter = require('./routes/notes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/notes', notesRouter);

app.get('/', (req, res) => {
  res.send('Study Assistant API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});