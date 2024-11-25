import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  uploaderName: { type: String, required: true },
  vendorName: { type: String, required: true },
  purpose: { 
    type: String, 
    required: true,
    enum: ['Procurement', 'Salary', 'Repair', 'Small Purchase']
  },
  amount: { type: Number, required: true },
  fileUrl: String,
  fileName: String,
  status: { 
    type: String, 
    required: true,
    default: 'pending',
    enum: ['pending', 'director_approved', 'finance_approved', 'rejected']
  },
  createdAt: { type: Date, default: Date.now },
  paymentDate: { type: Date, required: true },
  paymentSequence: { 
    type: String, 
    required: true,
    enum: ['payment_first', 'bill_first', 'payment_without_bill']
  },
  billType: {
    type: String,
    required: true,
    enum: ['quantum', 'covalent']
  },
  hub: {
    type: String,
    required: true,
    enum: ['mumbai', 'delhi', 'bangalore', 'pune']
  },
  directorApproval: {
    approved: Boolean,
    date: Date
  },
  financeApproval: {
    approved: Boolean,
    date: Date
  }
});

export const Purchase = mongoose.model('Purchase', purchaseSchema);