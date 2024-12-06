const express = require("express");
const mongoose = require("mongoose");
const TodoDb = require("../models/Todo.js");

async function GetAlltheTask(req, res) {
    try {
        const { status, priority, search, sortBy } = req.query;
        let query = {};
        
        // Filter by status
        if (status && ['pending', 'completed'].includes(status)) {
            query.Status = status;
        }
        
        // Filter by priority
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }
        
        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Create base query
        let dbQuery = TodoDb.find(query);
        
        // Apply sorting
        if (sortBy) {
            switch(sortBy) {
                case 'dueDate':
                    dbQuery = dbQuery.sort({ dueDate: 1 });
                    break;
                case 'priority':
                    dbQuery = dbQuery.sort({ priority: -1 });
                    break;
                case 'title':
                    dbQuery = dbQuery.sort({ title: 1 });
                    break;
                default:
                    dbQuery = dbQuery.sort({ createdAt: -1 });
            }
        }

        const data = await dbQuery.exec();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Error in GetAlltheTask:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function GetTaskById(req, res) {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ error: "Invalid ID format" });
    }

    try {
        const data = await TodoDb.findById(_id);
        if (!data) {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.status(200).json(data);
    } catch (err) {
        console.error("Error in GetTaskById:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function AddNewTask(req, res) {
    const body = req.body;

    // Handle bulk creation
    if (Array.isArray(body)) {
        try {
            const result = await TodoDb.insertMany(body.map(task => ({
                ...task,
                createdAt: new Date(),
                Status: task.Status || 'pending'
            })));
            return res.status(201).json(result);
        } catch (err) {
            console.error("Error in bulk AddNewTask:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    // Handle single task creation
    try {
        const data = new TodoDb({
            title: body.title,
            description: body.description,
            Status: body.Status || 'pending',
            priority: body.priority || 'medium',
            dueDate: body.dueDate,
            createdAt: new Date()
        });
        
        await data.save();
        return res.status(201).json(data);
    } catch (err) {
        console.error("Error in AddNewTask:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function UpdateById(req, res) {
    const _id = req.params.id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const data = await TodoDb.findByIdAndUpdate(
            _id,
            { 
                ...updates,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!data) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        return res.status(200).json(data);
    } catch (err) {
        console.error("Error in UpdateById:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function DeleteTask(req, res) {
    const _id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const deletedTask = await TodoDb.findByIdAndDelete(_id);
        if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.status(200).json(deletedTask);
    } catch (err) {
        console.error("Error in DeleteTask:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function GetUpcomingTasks(req, res) {
    try {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcomingTasks = await TodoDb.find({
            dueDate: {
                $gte: today,
                $lte: threeDaysFromNow
            },
            Status: 'pending'
        }).sort({ dueDate: 1 });

        return res.status(200).json(upcomingTasks);
    } catch (err) {
        console.error("Error in GetUpcomingTasks:", err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    GetAlltheTask,
    GetTaskById,
    AddNewTask,
    UpdateById,
    DeleteTask,
    GetUpcomingTasks
};