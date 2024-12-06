const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    Status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true,
        default: 'default'
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for better search performance
todoSchema.index({ title: 'text', description: 'text' });

// Add index for querying upcoming tasks
todoSchema.index({ dueDate: 1, Status: 1 });

// Add index for filtering by status and priority
todoSchema.index({ Status: 1, priority: 1 });

// Virtual for checking if task is overdue
todoSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate) return false;
    return this.Status !== 'completed' && new Date(this.dueDate) < new Date();
});

// Virtual for time remaining until due date
todoSchema.virtual('timeRemaining').get(function() {
    if (!this.dueDate) return null;
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Method to check if task is due soon (within next 3 days)
todoSchema.methods.isDueSoon = function() {
    if (!this.dueDate || this.Status === 'completed') return false;
    const timeRemaining = this.timeRemaining;
    return timeRemaining <= 3 && timeRemaining >= 0;
};

// Ensure timestamps are selected by default
todoSchema.pre('find', function() {
    if (this.options.select === undefined) {
        this.select('+createdAt +updatedAt');
    }
});

// Add validation for dueDate (can't be in the past when creating)
todoSchema.pre('save', function(next) {
    if (this.isNew && this.dueDate && new Date(this.dueDate) < new Date()) {
        next(new Error('Due date cannot be in the past'));
    } else {
        next();
    }
});

const TodoDb = mongoose.model('Task', todoSchema);

module.exports = TodoDb;