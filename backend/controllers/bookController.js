import Book from "../models/Book.js";

// GET all books
export const getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (err) {
        next(err);
    }
};

// Borrow a book
export const borrowBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (!book.isAvailable) return res.status(400).json({ message: "Book already borrowed" });

        // Backfill required fields in case CSV import used different keys
        if (!book.title && book.get && book.get('Title') !== undefined) {
            book.title = book.get('Title');
        }
        if (!book.author && book.get && book.get('Author') !== undefined) {
            book.author = book.get('Author');
        }
        if (!book.category && book.get && book.get('Genre') !== undefined) {
            book.category = book.get('Genre');
        }

        book.isAvailable = false;
        book.borrowedBy = req.user._id;
        await book.save();

        if (globalThis.io) {
            globalThis.io.emit("book-updated");
        }

        res.json({ message: "Book borrowed successfully" });
    } catch (err) {
        next(err);
    }
};

// Admin: create a new book
export const createBook = async (req, res, next) => {
    try {
        const { title, author, category } = req.body;
        const book = await Book.create({ title, author, category });
        res.status(201).json(book);
    } catch (err) {
        next(err);
    }
};

// Admin: update availability status
export const updateBookStatus = async (req, res, next) => {
    try {
        const { isAvailable } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        book.isAvailable = Boolean(isAvailable);
        if (book.isAvailable) {
            book.borrowedBy = null;
        }
        await book.save();

        if (globalThis.io) {
            globalThis.io.emit("book-updated");
        }

        res.json(book);
    } catch (err) {
        next(err);
    }
};

// Return a book (only by the borrower or admin/librarian)
export const returnBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (book.isAvailable) return res.status(400).json({ message: "Book is not borrowed" });

        const userId = req.user?._id?.toString();
        const borrowedBy = book.borrowedBy?.toString();

        const isPrivileged = ["admin", "librarian"].includes(req.user?.role);
        const isOwner = borrowedBy && userId && borrowedBy === userId;
        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ message: "You cannot return this book" });
        }

        book.isAvailable = true;
        book.borrowedBy = null;
        await book.save();

        if (globalThis.io) {
            globalThis.io.emit("book-updated");
        }

        res.json({ message: "Book returned successfully" });
    } catch (err) {
        next(err);
    }
};
