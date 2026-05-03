import React, { useEffect, useState, useCallback } from "react";

function Dashboard({ setUser }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Low");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sort state: field = "deadline" | "priority" | null, direction = "asc" | "desc"
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      // Same field — toggle direction
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      // New field — set it, default asc
      setSortField(field);
      setSortDir("asc");
    }
  };

  const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortField) return 0;
    let valA, valB;
    if (sortField === "deadline") {
      valA = a.deadline ? new Date(a.deadline) : new Date("9999-12-31");
      valB = b.deadline ? new Date(b.deadline) : new Date("9999-12-31");
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    if (sortField === "priority") {
      valA = PRIORITY_ORDER[a.priority] ?? 99;
      valB = PRIORITY_ORDER[b.priority] ?? 99;
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  const username = localStorage.getItem("username") || "";
  const userId = localStorage.getItem("userId");

  const avatarLetter = username ? username.charAt(0).toUpperCase() : "U";

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${userId}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!title) return;
    await fetch("http://localhost:5000/add-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, desc, deadline, priority }),
    });
    setTitle("");
    setDesc("");
    setDeadline("");
    setPriority("Low");
    setShowModal(false);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/delete-task/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  const completeTask = async (id) => {
    await fetch(`http://localhost:5000/complete-task/${id}`, { method: "PUT" });
    fetchTasks();
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUser(null);
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const SIDEBAR_WIDTH = 260;

  return (
    <div style={styles.root}>
      {/* ── BACKDROP ── */}
      {isOpen && (
        <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <div
        style={{ ...styles.sidebar, left: isOpen ? 0 : `-${SIDEBAR_WIDTH}px` }}
      >
        <div>
          <h2 style={styles.sidebarTitle}>TaskFlow</h2>

          <div style={styles.userInfo}>
            <div style={styles.avatarCircle}>{avatarLetter}</div>
            <div>
              <p style={styles.usernameText}>
                {username !== "" ? username : "User"}
              </p>
              <p style={styles.welcomeText}>Welcome back!</p>
            </div>
          </div>
        </div>

        <div style={styles.sidebarBottom}>
          <button style={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          ...styles.content,
          marginLeft: isOpen ? `${SIDEBAR_WIDTH}px` : "0px",
        }}
      >
        {/* Hamburger menu button */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.greeting}>
              Welcome{username ? `, ${username}` : ""} 👋
            </h2>
            <p style={styles.subGreeting}>Here's your to-do list for today</p>
          </div>

          {/* Buttons row: Sort + Add Task */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Sort by Deadline */}
            <button
              style={{
                ...styles.sortBtn,
                background: sortField === "deadline" ? "#1d4ed8" : "#1e293b",
                border:
                  sortField === "deadline"
                    ? "1.5px solid #3b82f6"
                    : "1.5px solid #334155",
              }}
              onClick={() => handleSort("deadline")}
            >
              📅 Deadline{" "}
              {sortField === "deadline" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>

            {/* Sort by Priority */}
            <button
              style={{
                ...styles.sortBtn,
                background: sortField === "priority" ? "#7e22ce" : "#1e293b",
                border:
                  sortField === "priority"
                    ? "1.5px solid #a855f7"
                    : "1.5px solid #d21934",
              }}
              onClick={() => handleSort("priority")}
            >
              🔥 Priority{" "}
              {sortField === "priority" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>

            {/* Add New Task */}
            <button style={styles.addBtnTop} onClick={() => setShowModal(true)}>
              ➕ Add New Task
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, background: "#3b82f6" }}>
            <div style={styles.cardNum}>{total}</div>
            <div style={styles.cardLabel}>Total</div>
          </div>
          <div style={{ ...styles.card, background: "#22c55e" }}>
            <div style={styles.cardNum}>{completed}</div>
            <div style={styles.cardLabel}>Completed</div>
          </div>
          <div style={{ ...styles.card, background: "#f59e0b" }}>
            <div style={styles.cardNum}>{pending}</div>
            <div style={styles.cardLabel}>Pending</div>
          </div>
        </div>

        {/* ── TASK LIST ── */}
        {tasks.length === 0 && (
          <p style={{ color: "#94a3b8", marginTop: "20px" }}>
            No tasks yet. Click "Add New Task" to get started!
          </p>
        )}

        {sortedTasks.map((task) => (
          <div
            key={task._id}
            style={styles.taskBox}
            onClick={() => setSelectedTask(task)}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  fontWeight: "bold",
                  color: task.completed ? "#94a3b8" : "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {task.title}
              </div>
              <div
                style={{ fontSize: "12px", color: "#1969d9d6", marginTop: 4 }}
              >
                📅 {task.deadline || "No deadline"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                style={styles.doneBtn}
                title="Mark complete"
                onClick={(e) => {
                  e.stopPropagation();
                  completeTask(task._id);
                }}
              >
                ✔
              </button>
              <button
                style={styles.delBtn}
                title="Delete task"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task._id);
                }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD TASK MODAL ── */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: "16px" }}>Add New Task</h3>
            <input
              style={styles.input}
              placeholder="Task Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              style={{ ...styles.input, height: "80px", resize: "vertical" }}
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <select
              style={styles.input}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button
                style={{ ...styles.addBtnTop, flex: 1 }}
                onClick={addTask}
              >
                Add
              </button>
              <button
                style={{ ...styles.cancelBtn, flex: 1 }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TASK DETAIL MODAL ── */}
      {selectedTask && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: "14px" }}>Task Details</h3>
            <p>
              <b>Title:</b> {selectedTask.title}
            </p>
            <p style={{ marginTop: 6 }}>
              <b>Description:</b> {selectedTask.desc || "No description"}
            </p>
            <p style={{ marginTop: 6 }}>
              <b>Deadline:</b> {selectedTask.deadline || "Not set"}
            </p>
            <p style={{ marginTop: 6 }}>
              <b>Priority:</b> {selectedTask.priority}
            </p>
            <p style={{ marginTop: 6 }}>
              <b>Status:</b>{" "}
              {selectedTask.completed ? "Completed ✅" : "Pending ⏳"}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {!selectedTask.completed && (
                <button
                  style={styles.doneBtn}
                  onClick={async () => {
                    await completeTask(selectedTask._id);
                    setSelectedTask(null);
                  }}
                >
                  ✔ Complete
                </button>
              )}
              <button
                style={styles.delBtn}
                onClick={async () => {
                  await deleteTask(selectedTask._id);
                  setSelectedTask(null);
                }}
              >
                🗑 Delete
              </button>
            </div>
            <button
              style={{ ...styles.cancelBtn, marginTop: "12px", width: "100%" }}
              onClick={() => setSelectedTask(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    height: "100vh",
    width: "260px",
    background: "#1e293b",
    padding: "24px 20px",
    transition: "left 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 1000,
    boxSizing: "border-box",
  },

  sidebarTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#60a5fa",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatarCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },

  usernameText: {
    fontWeight: "bold",
    fontSize: "15px",
    margin: 0,
  },

  welcomeText: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },

  logoutBtn: {
    width: "100%",
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },

  content: {
    padding: "20px 28px 40px 70px",
    height: "100vh",
    overflowY: "auto",
    boxSizing: "border-box",
  },

  menuBtn: {
    position: "fixed",
    top: "15px",
    left: "15px",
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    zIndex: 1100,
    cursor: "pointer",
    fontSize: "18px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "10px",
  },

  greeting: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },

  subGreeting: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },

  sortBtn: {
    padding: "10px 14px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },

  addBtnTop: {
    padding: "10px 18px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cardRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  card: {
    flex: "1 1 140px",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    color: "white",
  },

  cardNum: {
    fontSize: "26px",
    fontWeight: "bold",
  },

  cardLabel: {
    fontSize: "13px",
    marginTop: "4px",
  },

  taskBox: {
    background: "#1e293b",
    padding: "14px",
    marginBottom: "10px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #334155",
    cursor: "pointer",
  },

  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  delBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },

  modal: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #334155",
  },

  // ✅ ONLY CHANGE: added colorScheme: "dark" to fix the black date icon
  input: {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    width: "100%",
    colorScheme: "dark",
  },

  cancelBtn: {
    background: "#475569",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Dashboard;
