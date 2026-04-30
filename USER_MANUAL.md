# 📘 User Manual — Process Lifecycle Visualizer

> A simple tool to visualize CPU scheduling algorithms and process state transitions.  
> Built with **HTML, CSS, JavaScript, and C** for college-level Operating Systems coursework.

---

## 📁 Project Structure

```
osp/
├── index.html          → Main webpage (open in browser)
├── style.css           → All styling (dark + light themes)
├── script.js           → Scheduling algorithms + animation logic
├── scheduling.c        → Standalone C program (terminal-based)
├── screenshots/        → Reference screenshots
│   ├── dark_theme.png
│   ├── light_theme.png
│   └── simulation_result.png
└── USER_MANUAL.md      → This file
```

---

## 🚀 How to Run

### Frontend (Web Interface)

No installation needed — just open the HTML file:

1. Navigate to the `osp/` folder
2. **Double-click `index.html`** — it opens in your default browser
3. That's it! No server, no npm, no build step

> **Tip:** Use Chrome, Edge, or Firefox for best results.

### C Program (Terminal)

Requires a C compiler (GCC recommended):

```bash
# Compile
gcc scheduling.c -o scheduling

# Run
./scheduling          # Linux / Mac
scheduling.exe        # Windows
```

If you're using an IDE like **Code::Blocks** or **Dev-C++**, simply open `scheduling.c` and press "Build & Run".

---

## 🖥️ Web Interface Guide

### Dark Theme (Default)

![Dark Theme](screenshots/dark_theme.png)

### Light Theme

![Light Theme](screenshots/light_theme.png)

---

### 1. 🎛 Configuration Panel

This is where you set up your simulation.

#### Adding Processes

| Field      | Description                              | Example |
|------------|------------------------------------------|---------|
| **PID**    | Process ID (auto-assigned if left blank) | 1       |
| **Arrival**| Time the process arrives in the system   | 0       |
| **Burst**  | CPU time the process needs               | 4       |
| **Priority**| Priority level (lower number = higher priority) | 1 |

**Steps:**
1. Fill in **Arrival Time** and **Burst Time** (required)
2. Optionally set **Priority** (used only by Priority algorithm)
3. Click **＋ Add Process**
4. The process appears as a chip below: `P1 (A:0 B:4 Pr:1)`
5. Repeat to add more processes

> **Note:** 4 sample processes are pre-loaded when the page opens. You can remove them by clicking the **×** on each chip.

#### Removing Processes

Click the **×** button on any process chip to remove it.

#### Selecting Algorithm

Choose from the dropdown:

| Algorithm | Description |
|-----------|-------------|
| **FCFS** | First Come First Serve — processes run in arrival order |
| **SJF** | Shortest Job First (Non-Preemptive) — shortest burst runs first |
| **SRTF** | Shortest Remaining Time First (Preemptive) — can interrupt running process |
| **Round Robin** | Each process gets a fixed time slice (quantum) |
| **Priority** | Highest priority (lowest number) runs first (Non-Preemptive) |

> **Quantum field** only appears when "Round Robin" is selected. Default is 2.

#### Speed Control

Use the **Speed slider** to control animation speed:
- **100ms** → Fast (quick playback)
- **600ms** → Normal (default)
- **1500ms** → Slow (good for presentations)

#### Action Buttons

| Button | Action |
|--------|--------|
| **▶ Start** | Runs the simulation with selected algorithm |
| **↺ Reset** | Clears everything — processes, logs, charts |

---

### 2. 🔄 Process State Diagram

Shows the 5 states a process goes through:

```
NEW → READY → RUNNING → WAITING → TERMINATED
```

| State | Color | Meaning |
|-------|-------|---------|
| **New** | Grey | Process just created |
| **Ready** | Blue | Waiting in ready queue for CPU |
| **Running** | Green | Currently executing on CPU |
| **Waiting** | Yellow/Orange | Preempted, waiting for next turn |
| **Terminated** | Red | Execution completed |

During simulation, the **active state box glows and scales up** to show which state the current process is in.

---

### 3. 📋 Process Table

Displays all added processes with their current state:

| Column | Description |
|--------|-------------|
| PID | Process identifier |
| Arrival | When the process arrives |
| Burst | Total CPU time needed |
| Priority | Priority level |
| State | Current state (badge updates during animation) |

The **State badge** changes color in real-time as the simulation runs.

---

### 4. 📜 Transition Log

A console-style log showing every state change:

```
▶ FCFS Scheduling
PID 1 → NEW  (t=0)
PID 1 → READY  (t=0)
PID 1 → RUNNING  (t=0)
PID 1 → TERMINATED  (t=3)
PID 2 → NEW  (t=1)
...
✅ Simulation complete!
```

Each entry shows: **which process** → **new state** → **at what time**

---

### 5. 📊 Gantt Chart

After clicking Start, a **visual Gantt chart** appears showing:

- **Color-coded blocks** for each process (P1, P2, etc.)
- **IDLE blocks** (grey) when CPU has no process to run
- **Timeline** with start times below each block
- Block **width proportional** to execution duration

This makes it easy to see which process ran when.

---

### 6. 📈 Scheduling Results

After the simulation animation completes, results are shown:

#### Summary Cards

| Card | Meaning |
|------|---------|
| **Avg Waiting Time** | Average time processes spent waiting |
| **Avg Turnaround Time** | Average total time from arrival to completion |
| **Total Processes** | Number of processes simulated |
| **Throughput** | Processes completed per time unit |

#### Detailed Results Table

| Column | Formula |
|--------|---------|
| Completion Time | When the process finished |
| Waiting Time | Turnaround Time − Burst Time |
| Turnaround Time | Completion Time − Arrival Time |

---

### 7. 🌙/☀️ Theme Toggle

Click the **moon/sun button** in the top-right corner of the header:

- **🌙** → Dark theme (default)
- **☀️** → Light theme

Your preference is **saved automatically** and persists across page reloads.

---

## 💻 C Program Guide

The C program (`scheduling.c`) provides a **terminal-based** version of the same simulation.

### Running the Program

```
========================================
   Process Scheduling Simulator
========================================
Number of processes (max 20): 3

--- Process 1 ---
  Arrival Time : 0
  Burst Time   : 3
  Priority     : 2

--- Process 2 ---
  Arrival Time : 1
  Burst Time   : 5
  Priority     : 1

--- Process 3 ---
  Arrival Time : 2
  Burst Time   : 2
  Priority     : 3

Algorithms:
  1. FCFS
  2. SJF (Non-Preemptive)
  3. SRTF (Preemptive)
  4. Round Robin
  5. Priority
Choice: 1
```

### Sample Output

```
=== FCFS Scheduling ===
Gantt: | P1(0-3) | P2(3-8) | P3(8-10) |
  PID 1 -> NEW -> READY -> RUNNING -> TERMINATED
  PID 2 -> NEW -> READY -> RUNNING -> TERMINATED
  PID 3 -> NEW -> READY -> RUNNING -> TERMINATED

+-----+---------+-------+------+------------+----------+------------+
| PID | Arrival | Burst | Prio | Completion | Waiting  | Turnaround |
+-----+---------+-------+------+------------+----------+------------+
|   1 |     0   |   3   |   2  |      3     |     0    |      3     |
|   2 |     1   |   5   |   1  |      8     |     2    |      7     |
|   3 |     2   |   2   |   3  |     10     |     6    |      8     |
+-----+---------+-------+------+------------+----------+------------+
Avg Waiting Time    : 2.67
Avg Turnaround Time : 6.00
```

---

## 📚 Algorithm Explanations

### 1. FCFS (First Come First Serve)

- Processes execute in **order of arrival**
- Simple, fair, but can cause **convoy effect** (short processes wait behind long ones)
- **Non-preemptive** — once a process starts, it runs to completion

### 2. SJF (Shortest Job First — Non-Preemptive)

- Among arrived processes, the one with **shortest burst time** runs first
- **Optimal** for minimizing average waiting time
- **Non-preemptive** — once started, it finishes

### 3. SRTF (Shortest Remaining Time First — Preemptive)

- Preemptive version of SJF
- If a new process arrives with a **shorter remaining time**, the current process is **interrupted**
- Gives **lowest average waiting time** but causes more context switches

### 4. Round Robin

- Each process gets a fixed **time quantum** (default: 2 units)
- If not finished within the quantum, the process goes to the **back of the queue**
- **Fair** — every process gets equal CPU time
- Good for **time-sharing systems**

### 5. Priority Scheduling (Non-Preemptive)

- Each process has a **priority number**
- **Lower number = higher priority**
- Highest priority process runs first
- Can cause **starvation** — low-priority processes may never run

---

## ❓ FAQ

**Q: Do I need to install anything for the web interface?**  
A: No! Just open `index.html` in any modern browser.

**Q: Is the C program connected to the web interface?**  
A: No. They are independent. The web interface simulates everything in JavaScript. The C program is a standalone terminal tool.

**Q: Can I add more than 4 processes?**  
A: Yes! Use the "＋ Add Process" button to add as many as you want. The pre-loaded 4 are just samples.

**Q: What compiler do I need for the C program?**  
A: GCC is recommended. On Windows, install [MinGW](https://www.mingw-w64.org/) or use Dev-C++ / Code::Blocks.

**Q: Why does the Quantum field only appear sometimes?**  
A: It only shows when "Round Robin" algorithm is selected, since other algorithms don't use a time quantum.

**Q: How do I change the time quantum?**  
A: Select "Round Robin" from the dropdown, then change the value in the Quantum input field.

---

## 🛠 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Page structure and semantic elements |
| **CSS3** | Styling, animations, dark/light themes |
| **JavaScript** | Scheduling algorithms, DOM manipulation, animation |
| **C** | Terminal-based scheduling simulator |
| **Google Fonts** | Inter font family |
| **localStorage** | Persisting theme preference |

---

## 👤 Credits

Built as a college assignment for **Operating Systems** coursework.  
Demonstrates process lifecycle management and CPU scheduling concepts.

---

*Last updated: April 2026*
