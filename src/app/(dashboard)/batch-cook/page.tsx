"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChefHat,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { CookTask } from "@/components/features/batch-cook/cook-task";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import {
  useCurrentMealPlan,
  useBatchChecklist,
  useToggleBatchTask,
  useResetBatchChecklist,
} from "@/hooks/use-api";

// ─── Timer Hook ─────────────────────────────────────────────────────────────

function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
  }, []);

  const formatted = useMemo(() => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  return { seconds, running, formatted, start, pause, reset };
}

// ─── Parallel Cooking Hints ─────────────────────────────────────────────────

function getParallelHint(description: string): string | undefined {
  const lower = description.toLowerCase();
  if (lower.includes("roast") || lower.includes("bake") || lower.includes("oven")) {
    return "While this is in the oven, start prepping the next task.";
  }
  if (lower.includes("simmer") || lower.includes("boil")) {
    return "While this simmers, you can work on portioning or other prep.";
  }
  if (lower.includes("marinate") || lower.includes("soak")) {
    return "Let this sit and move on to the next task.";
  }
  return undefined;
}

// ─── Task sections ──────────────────────────────────────────────────────────

function categorizeTask(description: string, order: number, totalTasks: number): string {
  const lower = description.toLowerCase();
  if (
    lower.includes("chop") ||
    lower.includes("dice") ||
    lower.includes("prep") ||
    lower.includes("wash") ||
    lower.includes("measure") ||
    lower.includes("marinate") ||
    order < totalTasks * 0.3
  ) {
    return "Pre-cook Prep";
  }
  if (
    lower.includes("portion") ||
    lower.includes("store") ||
    lower.includes("container") ||
    lower.includes("label") ||
    lower.includes("cool") ||
    order > totalTasks * 0.7
  ) {
    return "Portioning & Storage";
  }
  return "Cooking";
}

// ─── Skeletons & Errors ─────────────────────────────────────────────────────

function BatchCookSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-8 w-full rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ))}
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center space-y-3">
      <AlertCircle className="h-8 w-8 text-[var(--destructive)] mx-auto" />
      <p className="text-sm text-[var(--destructive)]">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity min-h-[44px]"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function BatchCookPage() {
  const { data: plan, isLoading: planLoading } = useCurrentMealPlan();
  const planId = plan?.id ?? null;
  const {
    data: checklist,
    isLoading: checklistLoading,
    error,
    refetch,
  } = useBatchChecklist(planId);
  const toggleTask = useToggleBatchTask();
  const resetChecklist = useResetBatchChecklist();
  const timer = useSessionTimer();

  const isLoading = planLoading || checklistLoading;

  const tasks = checklist?.tasks ?? [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isChecked).length;
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalMinutes = checklist?.totalMinutes ?? tasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  // Group tasks by section
  const sections = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      const section = task.section || categorizeTask(task.description, task.order, totalTasks);
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(task);
    }
    // Sort sections in canonical order
    const order = ["Pre-cook Prep", "Cooking", "Portioning & Storage"];
    return order
      .filter((s) => grouped[s]?.length > 0)
      .map((s) => ({ name: s, tasks: grouped[s] }))
      .concat(
        Object.entries(grouped)
          .filter(([name]) => !order.includes(name))
          .map(([name, tasks]) => ({ name, tasks }))
      );
  }, [tasks, totalTasks]);

  function handleToggle(taskId: string, checked: boolean) {
    if (!planId) return;
    toggleTask.mutate({ planId, taskId, isChecked: checked });
  }

  function handleReset() {
    if (!planId) return;
    if (window.confirm("Reset all tasks for next week? This will uncheck everything.")) {
      resetChecklist.mutate(planId);
      timer.reset();
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Batch Cook Day</h1>
        <BatchCookSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Batch Cook Day</h1>
        <ErrorCard
          message="Failed to load your cook day checklist."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!planId || totalTasks === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Batch Cook Day</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--primary)]/10">
            <ChefHat className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold">No cook day tasks yet</h2>
          <p className="text-[var(--muted-foreground)] max-w-sm">
            Generate a meal plan first, and your batch cook checklist will be
            created automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with timer */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Batch Cook Day</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Estimated total: {Math.floor(totalMinutes / 60)}h{" "}
              {totalMinutes % 60}m &middot; {completedTasks}/{totalTasks}{" "}
              tasks done
            </p>
          </div>

          {/* Session timer */}
          <div className="flex items-center gap-2">
            <div className="font-mono text-2xl font-bold tabular-nums text-[var(--primary)]">
              {timer.formatted}
            </div>
            <div className="flex gap-1">
              {timer.running ? (
                <button
                  onClick={timer.pause}
                  className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
                  aria-label="Pause timer"
                >
                  <Pause className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={timer.start}
                  className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
                  aria-label="Start timer"
                >
                  <Play className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={timer.reset}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={progressPct}
        label="Cook day progress"
        variant="accent"
      />

      {/* Task sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.name} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
              {section.name}
            </h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]/50">
              {section.tasks.map((task) => (
                <CookTask
                  key={task.id}
                  id={task.id}
                  description={task.description}
                  estimatedMinutes={task.estimatedMinutes}
                  isChecked={task.isChecked}
                  onToggle={handleToggle}
                  disabled={toggleTask.isPending}
                  hint={getParallelHint(task.description)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        disabled={resetChecklist.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors min-h-[44px]"
      >
        {resetChecklist.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Reset for next week
      </button>
    </div>
  );
}
