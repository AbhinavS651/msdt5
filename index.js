const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;
const booksFilePath = path.join(__dirname, 'books.json');

app.use(express.json());

const readBooks = () => {
  try {
    if (!fs.existsSync(booksFilePath)) {
      fs.writeFileSync(booksFilePath, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeBooks = (books) => {
  try {
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing books file:', err);
  }
};

const getNextId = (books) => {
  const maxId = books.length > 0 ? Math.max(...books.map(book => book.id)) : 0;
  return maxId + 1;
};

app.get('/', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

app.get('/books/available', (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(book => book.available === true);
  res.status(200).json(availableBooks);
});

app.post('/books', (req, res) => {
  const { title, author, available } = req.body;
  if (!title || !author || available === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const books = readBooks();
  const newBook = { id: getNextId(books), title, author, available };
  
  books.push(newBook);
  writeBooks(books);
  
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const books = readBooks();
  const bookIndex = books.findIndex(book => book.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const updatedBook = { ...books[bookIndex], ...req.body };
  books[bookIndex] = updatedBook;
  writeBooks(books);

  res.status(200).json(updatedBook);
});

app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  let books = readBooks();
  const bookIndex = books.findIndex(book => book.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const [deletedBook] = books.splice(bookIndex, 1);
  writeBooks(books);

  res.status(200).json({ message: 'Book deleted', book: deletedBook });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});