/*
 * scheduling.c — Process Scheduling Simulator (Enhanced)
 * Algorithms: FCFS, SJF, SRTF, Round Robin, Priority
 *
 * COMPILE & RUN:
 *   gcc scheduling.c -o scheduling
 *   ./scheduling          (Linux/Mac)
 *   scheduling.exe        (Windows)
 */

#include <stdio.h>
#include <limits.h>

#define MAX 20

struct Process {
    int pid, arrival, burst, priority;
    int waiting, turnaround, completion;
    int remaining; /* used by preemptive algorithms */
};

/* ---- Utility: copy burst to remaining ---- */
void initRemaining(struct Process p[], int n) {
    for (int i = 0; i < n; i++) p[i].remaining = p[i].burst;
}

/* ---- 1. FCFS ---- */
void fcfs(struct Process p[], int n) {
    int t = 0;
    printf("\n=== FCFS Scheduling ===\n");
    /* Sort by arrival (bubble sort) */
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (p[j].arrival > p[j+1].arrival) {
                struct Process tmp = p[j]; p[j] = p[j+1]; p[j+1] = tmp;
            }
    printf("Gantt: |");
    for (int i = 0; i < n; i++) {
        if (t < p[i].arrival) { printf(" IDLE(%d-%d) |", t, p[i].arrival); t = p[i].arrival; }
        printf(" P%d(%d-%d) |", p[i].pid, t, t + p[i].burst);
        p[i].waiting = t - p[i].arrival;
        t += p[i].burst;
        p[i].completion = t;
        p[i].turnaround = t - p[i].arrival;
        printf("\n  PID %d -> NEW -> READY -> RUNNING -> TERMINATED\n", p[i].pid);
    }
    printf("\n");
}

/* ---- 2. SJF (Non-Preemptive) ---- */
void sjf(struct Process p[], int n) {
    int done[MAX] = {0}, completed = 0, t = 0;
    printf("\n=== SJF (Non-Preemptive) ===\n");
    printf("Gantt: |");
    while (completed < n) {
        int idx = -1, minB = INT_MAX;
        for (int i = 0; i < n; i++)
            if (!done[i] && p[i].arrival <= t && p[i].burst < minB)
                { minB = p[i].burst; idx = i; }
        if (idx == -1) { t++; continue; }
        printf(" P%d(%d-%d) |", p[idx].pid, t, t + p[idx].burst);
        p[idx].waiting = t - p[idx].arrival;
        t += p[idx].burst;
        p[idx].completion = t;
        p[idx].turnaround = t - p[idx].arrival;
        done[idx] = 1; completed++;
        printf("\n  PID %d -> NEW -> READY -> RUNNING -> TERMINATED\n", p[idx].pid);
    }
    printf("\n");
}

/* ---- 3. SRTF (Preemptive SJF) ---- */
void srtf(struct Process p[], int n) {
    int completed = 0, t = 0, lastPid = -1;
    initRemaining(p, n);
    printf("\n=== SRTF (Preemptive SJF) ===\n");
    printf("Gantt: |");
    while (completed < n) {
        int idx = -1, minR = INT_MAX;
        for (int i = 0; i < n; i++)
            if (p[i].arrival <= t && p[i].remaining > 0 && p[i].remaining < minR)
                { minR = p[i].remaining; idx = i; }
        if (idx == -1) { t++; continue; }
        if (p[idx].pid != lastPid) {
            if (lastPid != -1) printf(" |");
            printf(" P%d", p[idx].pid);
            lastPid = p[idx].pid;
        }
        p[idx].remaining--;
        t++;
        if (p[idx].remaining == 0) {
            p[idx].completion = t;
            p[idx].turnaround = t - p[idx].arrival;
            p[idx].waiting = p[idx].turnaround - p[idx].burst;
            completed++;
            printf("(%d)", t);
            lastPid = -1;
        }
    }
    printf(" |\n");
    for (int i = 0; i < n; i++)
        printf("  PID %d -> NEW -> READY -> RUNNING -> TERMINATED\n", p[i].pid);
    printf("\n");
}

/* ---- 4. Round Robin ---- */
void roundRobin(struct Process p[], int n, int q) {
    int t = 0, completed = 0;
    initRemaining(p, n);
    printf("\n=== Round Robin (Quantum=%d) ===\n", q);
    printf("Gantt: |");
    while (completed < n) {
        int progress = 0;
        for (int i = 0; i < n; i++) {
            if (p[i].remaining > 0 && p[i].arrival <= t) {
                int run = (p[i].remaining < q) ? p[i].remaining : q;
                printf(" P%d(%d-%d) |", p[i].pid, t, t + run);
                t += run;
                p[i].remaining -= run;
                if (p[i].remaining == 0) {
                    p[i].completion = t;
                    p[i].turnaround = t - p[i].arrival;
                    p[i].waiting = p[i].turnaround - p[i].burst;
                    completed++;
                }
                progress = 1;
            }
        }
        if (!progress) t++;
    }
    printf("\n");
    for (int i = 0; i < n; i++)
        printf("  PID %d -> NEW -> READY -> RUNNING -> TERMINATED\n", p[i].pid);
    printf("\n");
}

/* ---- 5. Priority (Non-Preemptive) ---- */
void priority(struct Process p[], int n) {
    int done[MAX] = {0}, completed = 0, t = 0;
    printf("\n=== Priority Scheduling (lower = higher) ===\n");
    printf("Gantt: |");
    while (completed < n) {
        int idx = -1, best = INT_MAX;
        for (int i = 0; i < n; i++)
            if (!done[i] && p[i].arrival <= t && p[i].priority < best)
                { best = p[i].priority; idx = i; }
        if (idx == -1) { t++; continue; }
        printf(" P%d(%d-%d) |", p[idx].pid, t, t + p[idx].burst);
        p[idx].waiting = t - p[idx].arrival;
        t += p[idx].burst;
        p[idx].completion = t;
        p[idx].turnaround = t - p[idx].arrival;
        done[idx] = 1; completed++;
        printf("\n  PID %d -> NEW -> READY -> RUNNING -> TERMINATED\n", p[idx].pid);
    }
    printf("\n");
}

/* ---- Results Table ---- */
void printResults(struct Process p[], int n) {
    float tw = 0, tt = 0;
    printf("+-----+---------+-------+------+------------+----------+------------+\n");
    printf("| PID | Arrival | Burst | Prio | Completion | Waiting  | Turnaround |\n");
    printf("+-----+---------+-------+------+------------+----------+------------+\n");
    for (int i = 0; i < n; i++) {
        printf("|  %2d |    %2d   |  %2d   |  %2d  |     %2d     |    %2d    |     %2d     |\n",
               p[i].pid, p[i].arrival, p[i].burst, p[i].priority,
               p[i].completion, p[i].waiting, p[i].turnaround);
        tw += p[i].waiting;
        tt += p[i].turnaround;
    }
    printf("+-----+---------+-------+------+------------+----------+------------+\n");
    printf("Avg Waiting Time    : %.2f\n", tw / n);
    printf("Avg Turnaround Time : %.2f\n", tt / n);
}

/* ---- Main ---- */
int main() {
    struct Process p[MAX];
    int n, choice, quantum;

    printf("========================================\n");
    printf("   Process Scheduling Simulator\n");
    printf("========================================\n");
    printf("Number of processes (max %d): ", MAX);
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        p[i].pid = i + 1;
        printf("\n--- Process %d ---\n", i + 1);
        printf("  Arrival Time : "); scanf("%d", &p[i].arrival);
        printf("  Burst Time   : "); scanf("%d", &p[i].burst);
        printf("  Priority     : "); scanf("%d", &p[i].priority);
        p[i].waiting = p[i].turnaround = p[i].completion = 0;
    }

    printf("\nAlgorithms:\n");
    printf("  1. FCFS\n  2. SJF (Non-Preemptive)\n  3. SRTF (Preemptive)\n");
    printf("  4. Round Robin\n  5. Priority\n");
    printf("Choice: "); scanf("%d", &choice);

    switch (choice) {
        case 1: fcfs(p, n); break;
        case 2: sjf(p, n); break;
        case 3: srtf(p, n); break;
        case 4:
            printf("Time Quantum: "); scanf("%d", &quantum);
            roundRobin(p, n, quantum); break;
        case 5: priority(p, n); break;
        default: printf("Invalid!\n"); return 1;
    }

    printResults(p, n);
    return 0;
}
