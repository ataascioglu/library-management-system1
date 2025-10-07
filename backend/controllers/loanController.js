import Loan from "../models/Loan.js";
import Book from "../models/Book.js";

export const createLoan = async (req, res, next) => {
  try {
    const { bookId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.isAvailable) return res.status(400).json({ message: "Book not available" });

    book.isAvailable = false;
    book.borrowedBy = req.user._id;
    await book.save();

    const loan = await Loan.create({ book: book._id, user: req.user._id, dueDate });
    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
};

export const returnLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("book");
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.returned) return res.status(400).json({ message: "Already returned" });

    loan.returned = true;
    await loan.save();

    const book = await Book.findById(loan.book._id);
    book.isAvailable = true;
    book.borrowedBy = null;
    await book.save();

    res.json({ message: "Returned successfully" });
  } catch (err) {
    next(err);
  }
};

export const listLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).populate("book");
    res.json(loans);
  } catch (err) {
    next(err);
  }
};


