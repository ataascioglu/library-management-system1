import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dueDate: { type: Date, required: true },
  returned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Loan", loanSchema);
