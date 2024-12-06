const express = require("express");
const router = express.Router();
const { 
    GetAlltheTask, 
    GetTaskById, 
    AddNewTask, 
    UpdateById, 
    DeleteTask,
    GetUpcomingTasks
} = require("../controllers/todoControllers.js");

// Get all tasks with optional filtering and sorting
router.get("/", GetAlltheTask);

// Get upcoming tasks (due within 3 days)
router.get("/upcoming", GetUpcomingTasks);

// Get specific task by ID
router.get("/:id", GetTaskById);

// Create new task(s)
router.post("/", AddNewTask);

// Update task
router.patch("/:id", UpdateById);

// Delete task
router.delete("/:id", DeleteTask);

module.exports = router;