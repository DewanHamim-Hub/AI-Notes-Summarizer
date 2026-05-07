import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await axios.get(API);
    setNotes(res.data);
  };

  const createNote = async () => {
    if (!title || !content) return alert('Title and content are required!');
    await axios.post(API, { title, content, tags });
    setTitle('');
    setContent('');
    setTags('');
    fetchNotes();
  };

  const summarize = async (note) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/${note.id}/summarize`, {
        content: note.content
      });
      const summary = response.data.summary;
      setNotes(notes.map(n => n.id === note.id ? { ...n, summary } : n));
    } catch (err) {
      alert('Summarization failed. The AI model may be loading, try again in 30 seconds.');
    }
    setLoading(false);
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchNotes();
  };

  const searchNotes = async () => {
    if (!search) return fetchNotes();
    const res = await axios.get(`${API}/search?q=${search}`);
    setNotes(res.data);
  };

  return (
    <div className="app">
      <h1>AI Study Assistant</h1>

      {/* Search */}
      <div className="search-bar">
        <input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchNotes}>Search</button>
        <button onClick={fetchNotes}>Clear</button>
      </div>

      {/* Create Note */}
      <div className="note-form">
        <h2>Create New Note</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
        <input
          placeholder="Tags (e.g. math, biology)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button onClick={createNote}>Save Note</button>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        <h2>My Notes</h2>
        {notes.length === 0 && <p>No notes yet. Create one above!</p>}
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            {note.tags && <p className="tags"> {note.tags}</p>}
            <p className="content">{note.content}</p>
            {note.summary && (
              <div className="summary">
                <strong>Summary:</strong>
                <p>{note.summary}</p>
              </div>
            )}
            <div className="note-actions">
              <button onClick={() => summarize(note)} disabled={loading}>
                {loading ? 'Summarizing...' : 'Summarize'}
              </button>
              <button className="delete" onClick={() => deleteNote(note.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;