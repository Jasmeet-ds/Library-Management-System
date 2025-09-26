const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",     // <--- Use teammate's IPv4 address here
  user: "root",
  password: "Ap55555***",
  database: "library_db",
  port: 3006
});


db.connect((err) => {
  if (err) {
    console.error("Cannot connect to DB:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Get Member by ID
app.get('/api/members/:id', (req, res) => {
  const memberId = req.params.id;
  db.query('SELECT * FROM Members WHERE member_id = ?', [memberId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Member not found' });
    // Compute current_books if you want, otherwise remove this field
    res.json(result[0]);
  });
});

// Get Book by ID
app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.query('SELECT * FROM Books WHERE book_id = ?', [bookId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result[0]);
  });
});

// Get all transactions (with basic joins for display)
app.get('/api/transactions', (req, res) => {
  db.query(
    `SELECT t.transaction_id, m.name AS member_name, b.title AS book_title, t.issue_date, t.return_date
     FROM Transactions t
     LEFT JOIN Members m ON t.member_id = m.member_id
     LEFT JOIN Books b ON t.book_id = b.book_id
     ORDER BY t.transaction_id DESC LIMIT 10`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Create a new borrow transaction
app.post('/api/transactions', (req, res) => {
  const { member_id, book_id, issue_date, return_date } = req.body;
  db.query(
    `INSERT INTO Transactions (book_id, member_id, issue_date, return_date)
     VALUES (?, ?, ?, ?)`,
    [book_id, member_id, issue_date, return_date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ transaction_id: result.insertId });
    }
  );
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
