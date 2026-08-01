import { useState } from 'react';
import { Octagon } from 'lucide-react';
import type { WindowState } from '@/os/types';
import { useProcesses } from '@/os/useProcesses';

type Props = {
  windows: WindowState[];
  onEndTask: (windowId: string) => void;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

const TABS = ['CPU', 'Memory', 'Energy', 'Disk', 'Network'] as const;
type Tab = (typeof TABS)[number];

/**
 * MacActivityMonitor — macOS Activity Monitor.
 *
 * macOS-ONLY. Windows has `WinTaskManager`, which is a heat-mapped table with
 * totals in the column headers. This is a different app in every visible way:
 * a segmented tab bar, a red octagonal "quit" button in a toolbar, per-tab
 * column sets, and a SUMMARY STRIP pinned to the bottom with a live CPU graph —
 * the thing Activity Monitor has and Task Manager does not.
 *
 * Only the sampler (`useProcesses`) is shared, so both agree about what runs.
 */
export default function MacActivityMonitor({ windows, onEndTask }: Props) {
  const { processes, totals, cpuHistory } = useProcesses('mac', windows);
  const [tab, setTab] = useState<Tab>('CPU');
  const [selected, setSelected] = useState<number | null>(null);

  const selectedProcess = processes.find((p) => p.pid === selected);

  /* Each tab shows its own columns — Activity Monitor doesn't just re-sort. */
  const columns: Record<Tab, { label: string; render: (p: (typeof processes)[number]) => string }[]> =
    {
      CPU: [
        { label: '% CPU', render: (p) => `${p.cpu.toFixed(1)}` },
        { label: 'CPU Time', render: (p) => `${(p.cpu * 3.2).toFixed(2)}` },
        { label: 'Threads', render: (p) => `${Math.round(4 + p.memory / 80)}` },
      ],
      Memory: [
        { label: 'Memory', render: (p) => `${p.memory.toFixed(0)} MB` },
        { label: 'Compressed', render: (p) => `${(p.memory * 0.12).toFixed(0)} MB` },
        { label: 'Ports', render: (p) => `${Math.round(120 + p.memory / 4)}` },
      ],
      Energy: [
        { label: 'Energy Impact', render: (p) => `${(p.cpu * 1.4).toFixed(1)}` },
        { label: '12 hr Power', render: (p) => `${(p.cpu * 0.6).toFixed(2)}` },
        { label: 'App Nap', render: (p) => (p.cpu < 1 ? 'Yes' : 'No') },
      ],
      Disk: [
        { label: 'Bytes Read', render: (p) => `${(p.memory * 3.1).toFixed(0)} MB` },
        { label: 'Bytes Written', render: (p) => `${(p.memory * 0.7).toFixed(0)} MB` },
        { label: 'Reads In', render: (p) => `${Math.round(p.memory * 12)}` },
      ],
      Network: [
        { label: 'Sent Bytes', render: (p) => `${(p.network * 240).toFixed(0)} KB` },
        { label: 'Rcvd Bytes', render: (p) => `${(p.network * 610).toFixed(0)} KB` },
        { label: 'Packets', render: (p) => `${Math.round(p.network * 1800)}` },
      ],
    };

  /** The live CPU sparkline in the bottom strip, as an SVG polyline. */
  const sparkline = cpuHistory
    .map((v, i) => `${(i / (cpuHistory.length - 1)) * 100},${28 - (v / 100) * 26}`)
    .join(' ');

  return (
    <div
      className="flex h-full select-none flex-col bg-black/10 text-[11.5px] text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ═════════════════════════════════════════════════════════ toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-3">
        {/* The red octagon quit button — Activity Monitor's signature control. */}
        <button
          disabled={!selectedProcess || selectedProcess.system || !selectedProcess.windowId}
          title={
            selectedProcess?.system
              ? 'macOS will not let you quit a system process'
              : 'Quit process'
          }
          onClick={() => {
            if (selectedProcess?.windowId) {
              onEndTask(selectedProcess.windowId);
              setSelected(null);
            }
          }}
          className="grid h-7 w-9 place-items-center rounded-md border border-white/10 bg-white/5 text-[#ff5f57] transition-colors hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-white/5"
        >
          <Octagon size={14} className="fill-current" />
        </button>

        {/* Segmented tab control. */}
        <div className="flex items-center rounded-md bg-white/10 p-0.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1 text-[11.5px] transition-colors ${
                tab === t ? 'bg-white/20 font-semibold text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <span className="w-9 text-right text-[10.5px] text-white/35">
          {processes.length}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════ process table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-black/40 text-[10.5px] text-white/50 backdrop-blur">
            <tr className="border-b border-white/10">
              <th className="px-3 py-1.5 font-normal">Process Name</th>
              {columns[tab].map((c) => (
                <th key={c.label} className="w-24 px-3 py-1.5 text-right font-normal">
                  {c.label}
                </th>
              ))}
              <th className="w-16 px-3 py-1.5 text-right font-normal">PID</th>
            </tr>
          </thead>

          <tbody>
            {processes.map((p) => (
              <tr
                key={p.pid}
                onClick={() => setSelected(p.pid)}
                className={`cursor-pointer transition-colors ${
                  selected === p.pid
                    ? 'bg-[#0a84ff] text-white'
                    : 'odd:bg-white/[0.03] hover:bg-white/10'
                }`}
              >
                <td className="truncate px-3 py-1">{p.name}</td>
                {columns[tab].map((c) => (
                  <td key={c.label} className="px-3 py-1 text-right tabular-nums">
                    {c.render(p)}
                  </td>
                ))}
                <td className="px-3 py-1 text-right tabular-nums opacity-50">{p.pid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════ the bottom summary strip — the macOS signature */}
      <div className="flex h-[74px] shrink-0 items-center gap-6 border-t border-white/10 bg-black/25 px-4">
        <div className="flex flex-col gap-1 text-[10.5px]">
          <div className="flex justify-between gap-6">
            <span className="text-white/50">System:</span>
            <span className="tabular-nums">{(totals.cpuPercent * 0.4).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-white/50">User:</span>
            <span className="tabular-nums">{(totals.cpuPercent * 0.6).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Idle:</span>
            <span className="tabular-nums">{(100 - totals.cpuPercent).toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[10.5px]">
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Threads:</span>
            <span className="tabular-nums">
              {processes.reduce((s, p) => s + Math.round(4 + p.memory / 80), 0)}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Processes:</span>
            <span className="tabular-nums">{processes.length}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Memory:</span>
            <span className="tabular-nums">
              {(totals.memoryUsedMb / 1024).toFixed(2)} GB
            </span>
          </div>
        </div>

        {/* Live CPU history graph. */}
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] text-white/45">CPU LOAD</span>
          <svg
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="h-9 w-full rounded border border-white/10 bg-black/30"
          >
            <polyline
              points={sparkline}
              fill="none"
              stroke="#5af78e"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              points={`0,28 ${sparkline} 100,28`}
              fill="rgba(90, 247, 142, 0.16)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
