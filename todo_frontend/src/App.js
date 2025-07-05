import React, { useState } from "react";
import "./App.css";

// Color palette constants
const COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ff9800",
  bg: "#ffffff",
  light: "#f8f9fa",
  text: "#282c34",
  sidebar: "#f4f5fa",
  border: "#e9ecef",
};

// PUBLIC_INTERFACE
function App() {
  // todo shape: { id: number, text: string, done: bool, created: Date }
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  // Id counter - in real app this is driven by backend, here by state
  const nextId = React.useRef(1);

  // PUBLIC_INTERFACE
  /** Add a new task */
  const handleAddTask = () => {
    const text = inputText.trim();
    if (text) {
      setTasks([
        ...tasks,
        {
          id: nextId.current++,
          text,
          done: false,
          created: new Date(),
        },
      ]);
      setInputText("");
    }
  };

  // PUBLIC_INTERFACE
  /** Start editing a task */
  const handleEditClick = (id) => {
    const t = tasks.find((t) => t.id === id);
    setInputText(t.text);
    setEditingId(id);
  };

  // PUBLIC_INTERFACE
  /** Save edited task */
  const handleEditSave = () => {
    setTasks(
      tasks.map((t) =>
        t.id === editingId ? { ...t, text: inputText.trim() } : t
      )
    );
    setEditingId(null);
    setInputText("");
  };

  // PUBLIC_INTERFACE
  /** Cancel editing */
  const handleEditCancel = () => {
    setEditingId(null);
    setInputText("");
  };

  // PUBLIC_INTERFACE
  /** Delete a task */
  const handleDelete = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    // If editing deleted, cancel editing
    if (editingId === id) {
      handleEditCancel();
    }
  };

  // PUBLIC_INTERFACE
  /** Toggle complete/incomplete */
  const handleToggleDone = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  // PUBLIC_INTERFACE
  /** Filtering logic */
  const getFilteredTasks = () => {
    if (filter === "all") return tasks;
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "completed") return tasks.filter((t) => t.done);
    return tasks;
  };

  // Keyboard: handle Enter/Esc for form
  const handleInputKey = (e) => {
    if (e.key === "Enter") {
      if (editingId) handleEditSave();
      else handleAddTask();
    }
    if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  // Sorting: show most recent first
  const visibleTasks = [...getFilteredTasks()].sort(
    (a, b) => b.created - a.created
  );

  /** UI Components */
  return (
    <div className="todoapp-root" style={{ background: COLORS.bg }}>
      {/* Header */}
      <header className="todoapp-header" style={{ background: COLORS.primary }}>
        <span className="todoapp-header-logo">✅</span>
        <h1 className="todoapp-title">TaskTrackr</h1>
      </header>
      <div className="todoapp-layout">
        {/* Sidebar for filters */}
        <aside className="todoapp-sidebar" style={{ background: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}` }}>
          <Filters 
            filter={filter} 
            setFilter={setFilter} 
            accent={COLORS.accent}
            allCount={tasks.length}
            activeCount={tasks.filter(t => !t.done).length}
            completedCount={tasks.filter(t => t.done).length}
          />
        </aside>
        {/* Main task list area */}
        <main className="todoapp-main">
          {/* Add/Edit Task input */}
          <div className="task-input-bar">
            <input
              aria-label={editingId ? "Edit task" : "New task"}
              className="task-input"
              type="text"
              placeholder={editingId ? "Edit task text..." : "Add a new task..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKey}
              autoFocus
              style={{ borderColor: COLORS.primary }}
            />
            {editingId ? (
              <>
                <button
                  className="btn btn-save"
                  style={{ background: COLORS.primary }}
                  onClick={handleEditSave}
                  disabled={!inputText.trim()}
                >
                  Save
                </button>
                <button className="btn btn-cancel" onClick={handleEditCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-add"
                style={{ background: COLORS.accent }}
                onClick={handleAddTask}
                disabled={!inputText.trim()}
              >
                Add
              </button>
            )}
          </div>
          {/* Task List */}
          <TaskList
            tasks={visibleTasks}
            onToggleDone={handleToggleDone}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            accent={COLORS.accent}
            primary={COLORS.primary}
            secondary={COLORS.secondary}
          />
        </main>
        {/* Floating Action Button (FAB) for mobile */}
        {!editingId && (
          <FAB onClick={() => document.querySelector('.task-input').focus()} accent={COLORS.accent} />
        )}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
/** Sidebar filter switcher */
function Filters({ filter, setFilter, accent, allCount, activeCount, completedCount }) {
  const filters = [
    { name: "All", key: "all", count: allCount },
    { name: "Active", key: "active", count: activeCount },
    { name: "Completed", key: "completed", count: completedCount }
  ];
  return (
    <nav className="filters-nav" aria-label="Task Filters">
      <div className="filters-title">Filters</div>
      <ul className="filters-list">
        {filters.map(f => (
          <li key={f.key}>
            <button
              className={`filters-btn${filter === f.key ? " active" : ""}`}
              style={filter === f.key ? { color: accent } : {}}
              onClick={() => setFilter(f.key)}
            >
              {f.name} ({f.count})
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// PUBLIC_INTERFACE
/** Task list section */
function TaskList({ tasks, onToggleDone, onEdit, onDelete, accent, primary, secondary }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-tasks" style={{ color: secondary }}>
        No tasks to display.
      </div>
    );
  }
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-row${task.done ? " task-done" : ""}`}
          style={{
            borderBottom: `1px solid ${primary}22`,
            background: task.done ? "#f5f5f599" : undefined
          }}
        >
          <div className="task-check">
            <input
              type="checkbox"
              checked={task.done}
              aria-label={task.done ? "Mark as incomplete" : "Mark as complete"}
              onChange={() => onToggleDone(task.id)}
            />
          </div>
          <div className="task-content">
            <span className="task-text">{task.text}</span>
            <span className="task-meta" title={task.created.toLocaleString()}>
              {task.done ? "Completed" : "Created"}:{" "}
              {task.created.toLocaleDateString()}
            </span>
          </div>
          <div className="task-actions">
            <button className="btn-link" onClick={() => onEdit(task.id)} aria-label="Edit Task">
              ✏️
            </button>
            <button className="btn-link btn-danger" onClick={() => onDelete(task.id)} aria-label="Delete Task">
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// PUBLIC_INTERFACE
/** Material-style Floating Action Button for mobile UX */
function FAB({ onClick, accent }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Add Task" style={{ background: accent }}>
      +
    </button>
  );
}

export default App;
