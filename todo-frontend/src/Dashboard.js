import React, { useEffect, useState, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ── Responsive hook ── */
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function Dashboard({ setUser }) {
  const width = useWindowWidth();
  const isMobile = width < 640;

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Low");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "deadline") {
      const valA = a.deadline ? new Date(a.deadline) : new Date("9999-12-31");
      const valB = b.deadline ? new Date(b.deadline) : new Date("9999-12-31");
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    if (sortField === "priority") {
      const valA = PRIORITY_ORDER[a.priority] ?? 99;
      const valB = PRIORITY_ORDER[b.priority] ?? 99;
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  const username = localStorage.getItem("username") || "";
  const userId = localStorage.getItem("userId");
  const avatarLetter = username ? username.charAt(0).toUpperCase() : "U";

  /* ── LOGOUT ── */
  const logout = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    setUser(null);
  }, [setUser]);

  /* ── FETCH TASKS ── */
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tasks/${userId}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ── AUTO-LOGOUT after 15 min of inactivity ── */
  useEffect(() => {
    const TIMEOUT_MS = 15 * 60 * 1000;
    const WARNING_MS = 14 * 60 * 1000;
    let warningTimer, logoutTimer;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      setShowWarning(false);
      warningTimer = setTimeout(() => setShowWarning(true), WARNING_MS);
      logoutTimer = setTimeout(() => {
        setShowWarning(false);
        logout();
      }, TIMEOUT_MS);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimers));
    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, [logout]);

  /* ── TASK ACTIONS ── */
  const addTask = async () => {
    if (!title) return;
    await fetch(`${API_URL}/add-task`, {
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
    await fetch(`${API_URL}/delete-task/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const completeTask = async (id) => {
    await fetch(`${API_URL}/complete-task/${id}`, { method: "PUT" });
    fetchTasks();
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const SIDEBAR_WIDTH = 260;

  /* ── On desktop, close sidebar when resizing to mobile ── */
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  return (
    <div style={styles.root}>
      {/* ── GLOBAL RESPONSIVE STYLES (injected once) ── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @media (max-width: 639px) {
          .dash-content { padding: 12px 12px 80px 12px !important; }
          .top-bar { flex-direction: column !important; align-items: flex-start !important; }
          .btn-row { width: 100%; justify-content: flex-start !important; flex-wrap: wrap; }
          .card-row { gap: 8px !important; }
          .stat-card { min-width: 80px !important; padding: 12px !important; }
          .task-title { font-size: 14px !important; }
          .greeting { font-size: 18px !important; }
          .modal-box { margin: 12px !important; max-width: 100% !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .dash-content { padding: 20px 20px 40px 20px !important; }
          .top-bar { flex-wrap: wrap !important; }
          .greeting { font-size: 20px !important; }
        }
      `}</style>

      {/* ── SESSION WARNING BANNER ── */}
      {showWarning && (
        <div style={styles.warningBanner}>
          ⚠️ You will be logged out in <b>1 minute</b> due to inactivity.{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => setShowWarning(false)}
          >
            Stay logged in
          </span>
        </div>
      )}

      {/* ── BACKDROP (mobile/tablet) ── */}
      {isOpen && (
        <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <div
        style={{
          ...styles.sidebar,
          left: isOpen ? 0 : `-${SIDEBAR_WIDTH}px`,
          top: showWarning ? "44px" : 0,
          height: showWarning ? "calc(100vh - 44px)" : "100vh",
        }}
      >
        <div>
          <h2 style={styles.sidebarTitle}>TaskFlow</h2>
          <div style={styles.userInfo}>
            <div style={styles.avatarCircle}>{avatarLetter}</div>
            <div>
              <p style={styles.usernameText}>{username || "User"}</p>
              <p style={styles.welcomeText}>Welcome back!</p>
            </div>
          </div>
        </div>
        <div>
          <button style={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        className="dash-content"
        style={{
          ...styles.content,
          marginLeft: isOpen && !isMobile ? `${SIDEBAR_WIDTH}px` : "0px",
          paddingTop: showWarning
            ? isMobile
              ? "60px"
              : "64px"
            : isMobile
              ? "20px"
              : "20px",
        }}
      >
        {/* Hamburger */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Top bar */}
        <div className="top-bar" style={styles.topBar}>
          <div style={{ marginLeft: isMobile ? "44px" : "44px" }}>
            <h2 className="greeting" style={styles.greeting}>
              Welcome{username ? `, ${username}` : ""} 👋
            </h2>
            <p style={styles.subGreeting}>Here's your to-do list for today</p>
          </div>

          <div className="btn-row" style={styles.btnRow}>
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
              📅 {isMobile ? "" : "Deadline "}
              {sortField === "deadline" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>

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
              🔥 {isMobile ? "" : "Priority "}
              {sortField === "priority" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>

            <button style={styles.addBtnTop} onClick={() => setShowModal(true)}>
              ➕ {isMobile ? "Add" : "Add New Task"}
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="card-row" style={styles.cardRow}>
          <div
            className="stat-card"
            style={{ ...styles.card, background: "#3b82f6" }}
          >
            <div style={styles.cardNum}>{total}</div>
            <div style={styles.cardLabel}>Total</div>
          </div>
          <div
            className="stat-card"
            style={{ ...styles.card, background: "#22c55e" }}
          >
            <div style={styles.cardNum}>{completed}</div>
            <div style={styles.cardLabel}>Completed</div>
          </div>
          <div
            className="stat-card"
            style={{ ...styles.card, background: "#f59e0b" }}
          >
            <div style={styles.cardNum}>{pending}</div>
            <div style={styles.cardLabel}>Pending</div>
          </div>
        </div>

        {/* ── TASK LIST ── */}
        {tasks.length === 0 && (
          <p
            style={{
              color: "#94a3b8",
              marginTop: "20px",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            No tasks yet. Tap "Add" to get started!
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
                className="task-title"
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  fontWeight: "bold",
                  color: task.completed ? "#94a3b8" : "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "15px",
                }}
              >
                {task.title}
              </div>
              <div style={{ fontSize: "11px", color: "#60a5fa", marginTop: 4 }}>
                📅 {task.deadline || "No deadline"} &nbsp;•&nbsp;
                <span
                  style={{
                    color:
                      task.priority === "High"
                        ? "#f87171"
                        : task.priority === "Medium"
                          ? "#fbbf24"
                          : "#86efac",
                  }}
                >
                  {task.priority}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexShrink: 0,
                marginLeft: "8px",
              }}
            >
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

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <div style={styles.bottomNav}>
          <button
            style={styles.bottomNavBtn}
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰ Menu
          </button>
          <button
            style={{
              ...styles.bottomNavBtn,
              background: "#3b82f6",
              fontWeight: "bold",
            }}
            onClick={() => setShowModal(true)}
          >
            ➕ Add
          </button>
          <button
            style={{ ...styles.bottomNavBtn, background: "#ef4444" }}
            onClick={logout}
          >
            🚪 Out
          </button>
        </div>
      )}

      {/* ── ADD TASK MODAL ── */}
      {showModal && (
        <div style={styles.overlay}>
          <div className="modal-box" style={styles.modal}>
            <h3
              style={{
                marginBottom: "16px",
                fontSize: isMobile ? "16px" : "18px",
              }}
            >
              Add New Task
            </h3>
            <input
              style={styles.input}
              placeholder="Task Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              style={{ ...styles.input, height: "70px", resize: "vertical" }}
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
          <div className="modal-box" style={styles.modal}>
            <h3
              style={{
                marginBottom: "14px",
                fontSize: isMobile ? "16px" : "18px",
              }}
            >
              Task Details
            </h3>
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
              <b>Priority:</b>{" "}
              <span
                style={{
                  color:
                    selectedTask.priority === "High"
                      ? "#f87171"
                      : selectedTask.priority === "Medium"
                        ? "#fbbf24"
                        : "#86efac",
                }}
              >
                {selectedTask.priority}
              </span>
            </p>
            <p style={{ marginTop: 6 }}>
              <b>Status:</b>{" "}
              {selectedTask.completed ? "Completed ✅" : "Pending ⏳"}
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
                flexWrap: "wrap",
              }}
            >
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
    overflowX: "hidden",
  },
  warningBanner: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#f59e0b",
    color: "#1a1a1a",
    textAlign: "center",
    padding: "10px 16px",
    zIndex: 9999,
    fontSize: "13px",
    fontWeight: "500",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    width: "260px",
    background: "#1e293b",
    padding: "24px 20px",
    transition: "left 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 1000,
    boxSizing: "border-box",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#60a5fa",
  },
  userInfo: { display: "flex", alignItems: "center", gap: "12px" },
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
    flexShrink: 0,
  },
  usernameText: {
    fontWeight: "bold",
    fontSize: "15px",
    margin: 0,
    wordBreak: "break-word",
  },
  welcomeText: { fontSize: "12px", color: "#94a3b8", margin: 0 },
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
    background: "rgba(0,0,0,0.55)",
    zIndex: 999,
  },
  content: {
    padding: "20px 24px 40px 24px",
    minHeight: "100vh",
    overflowY: "auto",
    boxSizing: "border-box",
    transition: "margin-left 0.3s ease",
  },
  menuBtn: {
    position: "fixed",
    top: "12px",
    left: "12px",
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
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
    paddingTop: "8px",
  },
  greeting: { fontSize: "22px", fontWeight: "bold", margin: 0 },
  subGreeting: { fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" },
  btnRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  sortBtn: {
    padding: "9px 12px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  addBtnTop: {
    padding: "9px 16px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  cardRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 100px",
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
    color: "white",
    minWidth: "80px",
  },
  cardNum: { fontSize: "24px", fontWeight: "bold" },
  cardLabel: { fontSize: "12px", marginTop: "4px" },
  taskBox: {
    background: "#1e293b",
    padding: "12px 14px",
    marginBottom: "10px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #334155",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "7px 11px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  delBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "7px 11px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "16px",
  },
  modal: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "420px",
    border: "1px solid #334155",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  input: {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    width: "100%",
    colorScheme: "dark",
    fontSize: "15px",
  },
  cancelBtn: {
    background: "#475569",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#1e293b",
    borderTop: "1px solid #334155",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 8px",
    zIndex: 1050,
  },
  bottomNavBtn: {
    flex: 1,
    margin: "0 4px",
    padding: "10px 6px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};

export default Dashboard;
