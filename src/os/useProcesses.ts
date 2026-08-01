import { useEffect, useMemo, useRef, useState } from 'react';
import type { WindowState } from './types';

/**
 * useProcesses — a plausible process table driven by the windows actually open.
 *
 * ENGINE ONLY. Task Manager and Activity Monitor render this completely
 * differently (Windows: a heat-mapped table with a header row of totals; macOS:
 * a tab bar with a bottom summary and a pie-adjacent CPU strip), but the
 * numbers underneath should agree — an app you can see open should appear in
 * the list, and closing it should remove it.
 *
 * Values wander via a bounded random walk rather than `Math.random()` per tick:
 * numbers that jump from 4% to 61% and back read as fake, whereas a value that
 * drifts a few points per second reads as a real sampler.
 */

export interface Process {
  pid: number;
  name: string;
  /** Percent of one core, 0–100. */
  cpu: number;
  /** Megabytes. */
  memory: number;
  /** Megabits per second. */
  network: number;
  /** True for the OS's own processes, which the UI refuses to end. */
  system: boolean;
  /** Window this row maps to, if any — so "End task" can close it. */
  windowId?: string;
}

/** Human app names per platform. Same window, different vendor's wording. */
const APP_NAMES: Record<string, { windows: string; mac: string }> = {
  files: { windows: 'Windows Explorer', mac: 'Finder' },
  settings: { windows: 'Settings', mac: 'System Settings' },
  photos: { windows: 'Photos', mac: 'Photos' },
  notes: { windows: 'Notepad', mac: 'Notes' },
  reader: { windows: 'Notepad', mac: 'TextEdit' },
  image: { windows: 'Photos', mac: 'Preview' },
  terminal: { windows: 'Windows Terminal', mac: 'Terminal' },
  taskmgr: { windows: 'Task Manager', mac: 'Activity Monitor' },
  trash: { windows: 'Recycle Bin', mac: 'Trash' },
  calc: { windows: 'Calculator', mac: 'Calculator' },
};

/** The background processes every machine has, whatever is open. */
const SYSTEM_PROCESSES: Record<'windows' | 'mac', { name: string; cpu: number; mem: number }[]> =
  {
    windows: [
      { name: 'System', cpu: 0.4, mem: 148 },
      { name: 'Registry', cpu: 0.1, mem: 92 },
      { name: 'csrss.exe', cpu: 0.2, mem: 12 },
      { name: 'dwm.exe', cpu: 3.1, mem: 214 },
      { name: 'svchost.exe', cpu: 0.6, mem: 88 },
      { name: 'SearchIndexer.exe', cpu: 1.2, mem: 132 },
      { name: 'MsMpEng.exe', cpu: 2.4, mem: 276 },
      { name: 'chrome.exe', cpu: 8.6, mem: 1284 },
    ],
    mac: [
      { name: 'kernel_task', cpu: 3.2, mem: 1420 },
      { name: 'WindowServer', cpu: 5.4, mem: 486 },
      { name: 'launchd', cpu: 0.1, mem: 24 },
      { name: 'mds_stores', cpu: 1.1, mem: 118 },
      { name: 'coreaudiod', cpu: 0.3, mem: 32 },
      { name: 'Spotlight', cpu: 0.8, mem: 76 },
      { name: 'Safari', cpu: 7.2, mem: 984 },
    ],
  };

/** One process's wandering values. */
interface Sample {
  cpu: number;
  memory: number;
  network: number;
}

/** Nudge a value by a small random step and clamp it to a range. */
const drift = (value: number, step: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value + (Math.random() - 0.5) * step));

/**
 * @param platform which naming and system-process table to use
 * @param windows  the live window list, so open apps appear as processes
 */
export function useProcesses(platform: 'windows' | 'mac', windows: WindowState[]) {
  /**
   * Per-process wandering values, keyed by a stable per-process key.
   *
   * Held in state, not a ref: the render output is a plain function of this
   * table, so mutating it invisibly inside a memo would leave React unable to
   * tell anything had changed. The interval below is the only writer.
   */
  const [drifts, setDrifts] = useState<Record<string, Sample>>({});

  /**
   * The live process list, seeded on the fly for anything not yet sampled.
   *
   * Seeding here rather than in the interval means a window opened a moment ago
   * already has plausible numbers on its first frame, instead of showing 0%
   * until the next tick.
   */
  const processes = useMemo(() => {
    const list: Process[] = [];
    let pid = 1204;

    const push = (
      key: string,
      name: string,
      seedCpu: number,
      seedMem: number,
      system: boolean,
      windowId?: string,
    ) => {
      const s = drifts[key] ?? { cpu: seedCpu, memory: seedMem, network: 0.2 };
      list.push({
        pid: (pid += system ? 53 : 37),
        name,
        cpu: s.cpu,
        memory: s.memory,
        network: s.network,
        system,
        windowId,
      });
    };

    /* Open windows first — the rows the user can actually act on. */
    windows
      .filter((w) => w.phase !== 'closing')
      .forEach((w) => {
        const names = APP_NAMES[w.app];
        push(`app:${w.id}`, names ? names[platform] : w.app, 6, 260, false, w.id);
      });

    /* Then the background furniture every machine has. */
    SYSTEM_PROCESSES[platform].forEach((p) => {
      push(`sys:${p.name}`, p.name, p.cpu, p.mem, true);
    });

    return list.sort((a, b) => b.cpu - a.cpu);
  }, [platform, windows, drifts]);

  /**
   * One sample per second: walk every known value a small step from where it
   * was, and seed any process that appeared since the last tick.
   *
   * A bounded random walk, not a fresh `Math.random()` per tick — values that
   * jump from 4% to 61% and back read as fake, whereas a few points of drift a
   * second reads as a real sampler.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setDrifts((prev) => {
        const next: Record<string, Sample> = {};
        for (const p of processes) {
          const key = p.windowId ? `app:${p.windowId}` : `sys:${p.name}`;
          const v = prev[key] ?? { cpu: p.cpu, memory: p.memory, network: p.network };
          next[key] = {
            cpu: drift(v.cpu, 1.6, 0, 40),
            memory: drift(v.memory, v.memory * 0.04, v.memory * 0.7, v.memory * 1.3),
            network: drift(v.network, 0.3, 0, 6),
          };
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [processes]);

  /** Machine-wide totals for the header / summary strips. */
  const totals = useMemo(() => {
    const cpu = processes.reduce((sum, p) => sum + p.cpu, 0);
    const memory = processes.reduce((sum, p) => sum + p.memory, 0);
    const network = processes.reduce((sum, p) => sum + p.network, 0);
    const TOTAL_RAM_MB = 16 * 1024;
    return {
      // Eight virtual cores, so summed per-core percentages scale down.
      cpuPercent: Math.min(99, cpu / 8),
      memoryUsedMb: memory,
      memoryTotalMb: TOTAL_RAM_MB,
      memoryPercent: Math.min(99, (memory / TOTAL_RAM_MB) * 100),
      networkMbps: network,
      diskPercent: Math.min(99, 2 + network * 3),
    };
  }, [processes]);

  /**
   * Rolling CPU history for the sparkline Activity Monitor draws.
   *
   * Sampled on its own timer rather than from `totals`, because `totals` is
   * recomputed on every render — appending from an effect that depends on it
   * would append on every render and run away.
   */
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(40).fill(0));
  const latestCpu = useRef(0);
  latestCpu.current = totals.cpuPercent;

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuHistory((prev) => [...prev.slice(1), latestCpu.current]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { processes, totals, cpuHistory };
}
