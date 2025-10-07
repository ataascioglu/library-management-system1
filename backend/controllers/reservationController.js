import Reservation from "../models/Reservation.js";
import Book from "../models/Book.js";

export const createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.isAvailable) {
      const reservation = await Reservation.create({ book: book._id, user: req.user._id });
      return res.status(201).json(reservation);
    }
    return res.status(400).json({ message: "Book is available; no reservation needed" });
  } catch (err) {
    next(err);
  }
};

export const listReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).populate("book");
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};


