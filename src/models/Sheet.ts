import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    wages: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});

const sheetSchema = new mongoose.Schema({
    location: { 
        type: String, 
        required: true,
        enum: ['rubavu', 'kigali', 'muhanga', 'rusizi', 'karongi', 'rutsiro']	 
    },
    date: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['draft', 'final'], 
        default: 'draft' 
    },
    workers: [workerSchema],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Sheet = mongoose.models.Sheet || mongoose.model('Sheet', sheetSchema);

export default Sheet;
