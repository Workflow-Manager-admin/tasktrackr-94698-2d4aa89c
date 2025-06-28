import React, { useState, useEffect } from "react";
import {
  getTasks, createTask, updateTask, deleteTask, clearToken
} from "./api";

/* --- Header (Brand) with log out and optional welcome message --- */
function Header({ onLogout }) {
  return (
    <nav className="navbar">
      <span className="title">
        <span role="img" aria-label="Task">📝</span>&nbsp;tasktrackr
      </span>
      <div style={{display: "flex", alignItems: "center"}}>
        <span style={{ color: "var(--text-secondary)", marginRight: 22, fontSize: 15, fontWeight: 400 }}>
          Welcome, user
        </span>
        <button onClick={onLogout}
          className="theme-toggle"
          tabIndex={0}>
          Log Out
        </button>
      </div>
    </nav>
  );
}

/* --- Sidebar filter --- */
function TaskFilter({ filter, setFilter }) {
  return (
    <aside className="sidebar">
      <div style={{
        fontWeight: 600,
        fontSize: 17,
        marginBottom: 10,
        letterSpacing: ".5px",
        color: "var(--accent)",
        textTransform: "uppercase"
      }}>Filters</div>
      <button className={filter === "all" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8}} onClick={()=>setFilter("all")}>
        All
      </button>
      <button className={filter === "active" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8}} onClick={()=>setFilter("active")}>
        Active
      </button>
      <button className={filter === "completed" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8}} onClick={()=>setFilter("completed")}>
        Completed
      </button>
    </aside>
  );
}

/* --- Task List Item with modern style, high contrast and subtle hover --- */
function TaskItem({ task, onToggleComplete, onDelete, onEdit }) {
  return (
    <div
      className={`task-item${task.completed ? " completed" : ""}`}
      completed={task.completed ? "true" : "false"}
      tabIndex={0}
      aria-label={`Task: ${task.title} ${task.completed ? "(completed)" : ""}`}
    >
      <input
        type="checkbox"
        checked={!!task.completed}
        onChange={() => onToggleComplete(task)}
        tabIndex={0}
        aria-checked={!!task.completed}
      />
      <div>
        <div className="task-title">{task.title}</div>
        {task.description &&
          <div className="task-desc">{task.description}</div>
        }
      </div>
      <button
        className="App-link"
        style={{marginRight:7}}
        aria-label={`Edit task: ${task.title}`}
        onClick={() => onEdit(task)}>
        Edit
      </button>
      <button
        className="App-link"
        style={{color:"#e74c3c", fontWeight:700}}
        aria-label={`Delete task: ${task.title}`}
        onClick={() => onDelete(task.id)}
      >
        Delete
      </button>
    </div>
  );
}

/* --- Task Add/Edit Form (modal-style card for mobile/desktop) --- */
function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [title, setTitle] = useState(editingTask ? editingTask.title : "");
  const [description, setDescription] = useState(editingTask ? editingTask.description : "");
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title); setDescription(editingTask.description || "");
    } else {
      setTitle(""); setDescription("");
    }
  }, [editingTask]);
  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() });
  }
  return (
    <form onSubmit={handleSubmit}
      style={{
        marginTop: 12,
        marginBottom: 22,
        borderRadius: 15,
        background: "var(--bg-secondary)",
        padding: "20px 18px 14px 18px",
        boxShadow: "0 2px 18px rgba(25, 118, 210, 0.13)"
      }}>
      <input
        required
        placeholder={editingTask ? "Edit title" : "Task title"}
        value={title}
        maxLength={80}
        style={{ marginBottom: 9, fontSize: 17, fontWeight: 500 }}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        rows={2}
        placeholder="(Optional) Description"
        value={description}
        style={{ marginBottom: 13, fontSize: 15 }}
        maxLength={180}
        onChange={e => setDescription(e.target.value)}
      />
      <div style={{display: "flex", gap: 10, marginTop: 2}}>
        <button type="submit" className="theme-toggle" style={{ flex: "1 1 70px" }}>
          {editingTask ? "Update" : "Add Task"}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel}
            className="App-link" style={{ flex: 1, minWidth: 70 }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Main ToDo Application - list, create, edit, delete, filter tasks.
 */
export function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch only tasks (no profile)
  async function fetchTasks() {
    try {
      setLoading(true); setError("");
      const t = await getTasks();
      setTasks(t);
    } catch (e) {
      setError(e.message || "Error loading");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  function filterTasks(tasks) {
    if (filter === "completed") return tasks.filter(t => t.completed);
    if (filter === "active") return tasks.filter(t => !t.completed);
    return tasks;
  }

  async function handleAddTask(task) {
    try {
      setLoading(true);
      await createTask(task);
      await fetchTasks();
      setFormOpen(false);
    } catch (e) {
      setError(e.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditTask(updates) {
    if (!editingTask) return;
    try {
      setLoading(true);
      await updateTask(editingTask.id, updates);
      await fetchTasks();
      setEditingTask(null);
      setFormOpen(false);
    } catch (e) {
      setError(e.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id) {
    try {
      setLoading(true);
      await deleteTask(id);
      await fetchTasks();
    } catch (e) {
      setError(e.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleComplete(task) {
    try {
      setLoading(true);
      await updateTask(task.id, { completed: !task.completed });
      await fetchTasks();
    } catch (e) {
      setError(e.message || "Failed to complete task");
    } finally {
      setLoading(false);
    }
  }

  function openEditTask(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleLogout() {
    clearToken();
    window.location.reload();
  }

  // FAB for quick-add on mobile views
  function Fab({ active, toggle }) {
    return (
      <button
        className="fab"
        aria-label={active ? "Close task form" : "Add Task"}
        tabIndex={0}
        onClick={toggle}
      >
        {active ? "×" : "+"}
      </button>
    );
  }

  return (
    <div>
      <Header onLogout={handleLogout} />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 18,
        minHeight: "calc(100vh - 70px)"
      }}>
        <TaskFilter filter={filter} setFilter={setFilter} />
        <main>
          <div style={{display:"flex", alignItems: "center", marginBottom:14, gap: 14}}>
            <h2 style={{margin:0, fontSize: "2rem", flex: 1, color:"var(--primary)"}}>My Tasks</h2>
            <button
              className="theme-toggle"
              style={{marginLeft: "auto", minWidth:92, position:"relative", zIndex:5}}
              onClick={() => { setFormOpen(!formOpen); setEditingTask(null); }}>
              {formOpen ? "Close" : "Add Task"}
            </button>
          </div>
          {formOpen &&
            <TaskForm
              editingTask={editingTask}
              onSubmit={editingTask ? handleEditTask : handleAddTask}
              onCancel={() => { setEditingTask(null); setFormOpen(false); }}
            />}
          {loading && <div style={{margin:"28px 0"}}>Loading...</div>}
          {error && <div className="error-msg">{error}</div>}
          <section style={{marginTop:10}}>
            {filterTasks(tasks).length === 0 && !loading ?
              <div style={{ color: "#bbb", fontSize: 17, textAlign:"center", padding:"28px 0 5px 0" }}>No tasks found.</div>
              : filterTasks(tasks).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEdit={openEditTask}
                />
              ))}
          </section>
        </main>
        {/* Floating Action Button for mobile/small screens */}
        <Fab active={formOpen} toggle={() => { setFormOpen(v => !v); setEditingTask(null); }} />
      </div>
    </div>
  );
}
