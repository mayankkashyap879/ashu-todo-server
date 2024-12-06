const apiUrl = "http://localhost:4001/todos"; // Your API base URL

// Fetch and render all pending tasks
async function fetchTodos() {
    try {
        const res = await fetch(`${apiUrl}/pending`);
        if (res.ok) {
            const todos = await res.json();
            renderTodos(todos);
        } else {
            console.error("Failed to fetch todos:", res.statusText);
        }
    } catch (err) {
        console.error("Error fetching todos:", err);
    }
}

// Render tasks to the UI
function renderTodos(todos) {
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = ""; // Clear existing tasks

    if (todos.length === 0) {
        tasksContainer.innerHTML = "<p>No pending tasks!</p>";
        return;
    }

    todos.forEach((todo) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.setAttribute("data-id", todo._id);

        taskElement.innerHTML = `
            <p>${todo.title}</p>
            <button class="complete-btn">Complete</button>
        `;

        tasksContainer.appendChild(taskElement);
    });
}

// Mark a task as completed
async function completeTodo(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Status: "completed" }),
        });

        if (res.ok) {
            fetchTodos(); // Refresh the todo list with only pending tasks
        } else {
            console.error("Failed to complete todo:", res.statusText);
        }
    } catch (err) {
        console.error("Error completing todo:", err);
    }
}

// Add event listener to handle "Complete" button clicks
document.addEventListener("DOMContentLoaded", () => {
    fetchTodos(); // Fetch pending tasks on page load

    document.getElementById("tasks").addEventListener("click", (event) => {
        if (event.target.classList.contains("complete-btn")) {
            const taskElement = event.target.closest(".task");
            const taskId = taskElement.getAttribute("data-id");
            completeTodo(taskId);
        }
    });
});
