import Loan from "../models/Loan.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

export const getOverdueReports = async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Loan.find({ returned: false, dueDate: { $lt: now } })
      .populate("book")
      .populate("user", "name email");
    res.json({ overdue });
  } catch (err) {
    next(err);
  }
};

export const getPopularBooks = async (req, res, next) => {
  try {
    // naive popularity: most recent 10 created books
    const books = await Book.find().sort({ createdAt: -1 }).limit(10);
    res.json({ books });
  } catch (err) {
    next(err);
  }
};

export const setUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    if (!['student', 'librarian', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    next(err);
  }
};

