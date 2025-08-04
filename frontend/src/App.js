import React, { useState, useEffect } from "react";
import "./App.css";

// API base URL
const API_URL = "http://localhost:5000";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [deleteId, setDeleteId] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [darkMode, setDarkMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme preference logic
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;

    const newTodo = {
      title: input,
      deadline_date: date || null,
      deadline_time: time || null,
      priority: priority,
      completed: false,
    };

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (response.ok) {
        const addedTodo = await response.json();
        setTodos([...todos, addedTodo]);
        setInput("");
        setDate("");
        setTime("");
        setPriority("medium");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/todos/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(todos.filter((t) => t.id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const startEdit = (todo) => {
    if (todo.completed) return;
    setEditId(todo.id);
    setEditText(todo.title);
    setEditDate(todo.deadline_date || "");
    setEditTime(todo.deadline_time || "");
    setEditPriority(todo.priority || "medium");
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    const updatedTodo = {
      title: editText,
      deadline_date: editDate || null,
      deadline_time: editTime || null,
      priority: editPriority,
    };

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (response.ok) {
        const savedTodo = await response.json();
        setTodos(todos.map((t) => (t.id === id ? savedTodo : t)));
        setEditId(null);
        setEditDate("");
        setEditTime("");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const formatDeadline = (dateStr, timeStr) => {
    let formattedDate = "";
    let formattedTime = "";
    if (dateStr) {
      const [year, month, day] = dateStr.split("-");
      formattedDate = `${day}.${month}.${year}`;
    }
    if (timeStr) {
      formattedTime = timeStr;
    }
    return { formattedDate, formattedTime };
  };

  // Drag and Drop handlers
  const handleDragStart = (e, todo, index) => {
    setDraggedItem(todo);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    const dragIndex = todos.findIndex((todo) => todo.id === draggedItem.id);
    if (dragIndex === dropIndex) return;
    const newTodos = [...todos];
    const [removed] = newTodos.splice(dragIndex, 1);
    newTodos.splice(dropIndex, 0, removed);
    setTodos(newTodos);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#4caf50";
      case "low":
        return "#ff9800";
      default:
        return "#4caf50";
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Todo Uygulaması</h1>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yeni görev ekle..."
            onKeyPress={(e) => e.key === "Enter" && addTodo()}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <div className="priority-select">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="priority-dropdown"
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
          </div>
          <button onClick={addTodo}>Ekle</button>
        </div>
        <div className="todo-list">
          {loading ? (
            <div className="loading-state">
              <p>Yükleniyor...</p>
            </div>
          ) : todos.length > 0 ? (
            todos.map((todo, index) => (
              <div
                key={`todo-${todo.id}`}
                className={`todo-item ${todo.completed ? "completed" : ""} ${
                  draggedItem && draggedItem.id === todo.id ? "dragging" : ""
                } ${dragOverIndex === index ? "drag-over" : ""}`}
                style={{
                  borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                }}
                draggable={editId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="drag-handle">⋮⋮</div>
                {editId === todo.id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      placeholder="Görev adı..."
                    />
                    <div className="datetime-inputs">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                      />
                    </div>
                    <div className="priority-select">
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="priority-dropdown"
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                      </select>
                    </div>
                    <div className="edit-buttons">
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="save-btn"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="cancel-btn"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="todo-content">
                      <span>{todo.title}</span>
                      <div className="todo-meta">
                        {(todo.deadline_date || todo.deadline_time) && (
                          <small className="deadline">
                            {todo.deadline_date && (
                              <span className="deadline-part">
                                📅{" "}
                                {
                                  formatDeadline(
                                    todo.deadline_date,
                                    todo.deadline_time
                                  ).formattedDate
                                }
                              </span>
                            )}
                            {todo.deadline_date && todo.deadline_time && (
                              <span className="deadline-separator"> • </span>
                            )}
                            {todo.deadline_time && (
                              <span className="deadline-part">
                                🕒{" "}
                                {
                                  formatDeadline(
                                    todo.deadline_date,
                                    todo.deadline_time
                                  ).formattedTime
                                }
                              </span>
                            )}
                          </small>
                        )}
                        <span className={`priority-badge ${todo.priority}`}>
                          {todo.priority === "high"
                            ? "Yüksek"
                            : todo.priority === "medium"
                            ? "Orta"
                            : "Düşük"}
                        </span>
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button
                        onClick={() => toggleComplete(todo.id, todo.completed)}
                        className="complete-btn"
                        title={todo.completed ? "Görevi geri al" : "Tamamla"}
                      >
                        {todo.completed ? "↩️" : "✅"}
                      </button>
                      <button
                        onClick={() => startEdit(todo)}
                        className={`edit-btn ${
                          todo.completed ? "disabled" : ""
                        }`}
                        disabled={todo.completed}
                        title={
                          todo.completed
                            ? "Tamamlanmış görev düzenlenemez"
                            : "Düzenle"
                        }
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => confirmDelete(todo.id)}
                        className="delete-btn"
                        title="Sil"
                      >
                        Sil
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Hiç görev bulunamadı</p>
              <button
                onClick={() =>
                  document.querySelector(".input-section input").focus()
                }
              >
                Yeni görev ekle
              </button>
            </div>
          )}
        </div>
        {deleteId && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p>
                <strong>Silmek istediğinden emin misin?</strong>
              </p>
              <div className="modal-buttons">
                <button onClick={handleDelete} className="btn-yes">
                  Evet
                </button>
                <button onClick={cancelDelete} className="btn-no">
                  Hayır
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
