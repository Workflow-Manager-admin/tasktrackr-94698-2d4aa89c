import React, { useState, useEffect } from "react";
import {
  getTasks, createTask, updateTask, deleteTask, getProfile, clearToken
} from "./api";

// Helper components for layout
function Header({ username, onLogout }) {
  return (
    <nav className="navbar" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-secondary)", padding: "16px 32px", borderRadius: 0
    }}>
      <span className="title" style={{ fontWeight: 600, fontSize: 26 }}>
        📝 tasktrackr
      </span>
      <div>
        <span style={{ color: "var(--text-secondary)", marginRight: 20, fontSize: 15 }}>
          Welcome, {username || "user"}
        </span>
        <button onClick={onLogout}
          className="theme-toggle"
          style={{ margin: 0, padding: "7px 20px", fontSize: 15 }}>
          Log Out
        </button>
      </div>
    </nav>
  );
}

function TaskFilter({ filter, setFilter }) {
  return (
    <aside className="sidebar" style={{
      flexShrink: 0, background: "var(--bg-secondary)",
      padding: "30px 18px", minWidth: 160, borderRadius: 20, margin: 16
    }}>
      <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 11 }}>Filters</div>
      <button className={filter === "all" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8, width: "100%"}} onClick={()=>setFilter("all")}>All</button>
      <button className={filter === "active" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8, width: "100%"}} onClick={()=>setFilter("active")}>Active</button>
      <button className={filter === "completed" ? "theme-toggle" : "App-link"}
        style={{marginBottom:8, width: "100%"}} onClick={()=>setFilter("completed")}>Completed</button>
    </aside>
  );
}

function TaskItem({ task, onToggleComplete, onDelete, onEdit }) {
  return (
    <div className="task-item" style={{
      display: "flex", alignItems: "center",
      border: "1px solid var(--border-color)", padding: 13, marginBottom: 12,
      borderRadius: 10, background: "var(--bg-secondary)"
    }}>
      <input type="checkbox"
        checked={!!task.completed}
        onChange={() => onToggleComplete(task)}
        style={{ marginRight: 16, accentColor: "var(--button-bg)", width: 20, height: 20 }}
      />
      <div style={{
        flexGrow: 1,
        textDecoration: task.completed ? "line-through" : "none",
        color: task.completed ? "#999" : "var(--text-primary)"
      }}>
        <div style={{ fontSize: 19, fontWeight: 500 }}>{task.title}</div>
        {task.description && <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{task.description}</div>}
      </div>
      <button className="App-link" style={{marginRight:8}} onClick={() => onEdit(task)}>Edit</button>
      <button className="App-link" style={{color:"#e74c3c"}} onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}

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
       display: "flex", flexDirection: "column", gap: 6,
       marginBottom: 18, background: "var(--bg-secondary)", padding: 18, borderRadius: 12
     }}>
      <input
        required
        style={{ padding: 10, borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 16, marginBottom: 7 }}
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        rows={2}
        style={{
          padding: 10, borderRadius: 6, border: "1px solid var(--border-color)",
          fontSize: 15, marginBottom: 9, resize: "vertical"
        }}
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="theme-toggle" style={{ flexGrow: 1 }}>
          {editingTask ? "Update" : "Add task"}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel}
            className="App-link" style={{ flexGrow: 1 }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// PUBLIC_INTERFACE
/**
 * Main ToDo Application - list, create, edit, delete, filter tasks.
 */
export function TodoApp() {
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  async function fetchProfileAndTasks() {
    try {
      setLoading(true); setError("");
      const p = await getProfile();
      setUsername(p.username || "user");
      const t = await getTasks();
      setTasks(t);
    } catch (e) {
      setError(e.message || "Error loading");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileAndTasks();
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
      await fetchProfileAndTasks();
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
      await fetchProfileAndTasks();
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
      await fetchProfileAndTasks();
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
      await fetchProfileAndTasks();
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

  return (
    <div>
      <Header username={username} onLogout={handleLogout} />
      <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
        <TaskFilter filter={filter} setFilter={setFilter} />
        <main style={{
          flexGrow: 1,
          maxWidth: 550,
          padding: 25,
          margin: "0 24px",
          borderRadius: 16,
          background: "var(--bg-primary)"
        }}>
          <div style={{display:"flex", alignItems: "center", marginBottom:7}}>
            <h2 style={{margin:0, fontSize:27}}>My Tasks</h2>
            <button
              className="theme-toggle"
              style={{ marginLeft: "auto", padding: "7px 22px", fontSize: 15 }}
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
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "#e74c3c" }}>{error}</div>}
          <section style={{marginTop:8}}>
            {filterTasks(tasks).length === 0 && !loading ?
              <div style={{ color: "#bbb", fontSize: 15 }}>No tasks found.</div>
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
      </div>
    </div>
  );
}
