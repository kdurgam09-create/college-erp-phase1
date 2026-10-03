const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Get all students (Refresh aynappudu data thecchukovadaniki)
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new student
app.post('/api/students', (req, res) => {
  const { name, admission_no, studentClass, phone } = req.body;
  const sql = `INSERT INTO students (name, admission_no, class, phone) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, admission_no, studentClass, phone], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, admission_no, class: studentClass, phone });
  });
});

app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});