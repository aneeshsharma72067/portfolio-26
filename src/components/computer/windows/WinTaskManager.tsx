import { useState } from 'react';
import { Cpu, HardDrive, MemoryStick, Wifi, X } from 'lucide-react';
import type { WindowState } from '@/os/types';
import { useProcesses } from '@/os/useProcesses';

type Props = {
  windows: WindowState[];
  /** "End task" genuinely closes the window the row maps to. */
  onEndTask: (windowId: string) => void;
};

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinTaskManager — Windows 11 Task Manager, Processes tab.
 *
 * WINDOWS-ONLY. macOS gets `MacActivityMonitor`, which is a genuinely different
 * app: tabs across the top, a bottom summary strip, different column names
 * ("% CPU" vs "CPU"), and no heat map. Only the sampler (`useProcesses`) is
 * shared, so both agree about what's running.
 *
 * The Windows tell people recognise instantly: the HEAT MAP. Each cell's
 * background gets more orange the busier it is, and the column headers carry
 * the machine-wide total. Nothing else looks like that.
 */
export default function WinTaskManager({ windows, onEndTask }: Props) {
  const { processes, totals } = useProcesses('windows', windows);
  const [selected, setSelected] = useState<number | null>(null);

  const selectedProcess = processes.find((p) => p.pid === selected);

  /**
   * Task Manager's heat map: a light wash at idle, deepening to amber under
   * load. The alpha is what carries the signal, so it stays readable in a
   * dense table where a full-saturation fill would not.
   */
  const heat = (value: number, max: number) => {
    const t = Math.min(1, value / max);
    if (t < 0.04) return 'transparent';
    return `rgba(${Math.round(255 - t * 40)}, ${Math.round(200 - t * 120)}, ${Math.round(60 - t * 40)}, ${0.1 + t * 0.55})`;
  };

  const headers: { label: string; value: string; icon: React.ReactNode; percent: number }[] =
    [
      {
        label: 'CPU',
        value: `${totals.cpuPercent.toFixed(0)}%`,
        icon: <Cpu size={11} />,
        percent: totals.cpuPercent,
      },
      {
        label: 'Memory',
        value: `${totals.memoryPercent.toFixed(0)}%`,
        icon: <MemoryStick size={11} />,
        percent: totals.memoryPercent,
      },
      {
        label: 'Disk',
        value: `${totals.diskPercent.toFixed(0)}%`,
        icon: <HardDrive size={11} />,
        percent: totals.diskPercent,
      },
      {
        label: 'Network',
        value: `${totals.networkMbps.toFixed(1)} Mbps`,
        icon: <Wifi size={11} />,
        percent: Math.min(100, totals.networkMbps * 12),
      },
    ];

  return (
    <div
      className="flex h-full select-none flex-col bg-[#191919] text-[11.5px] text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ══════════════════════════════════════════════════════ command bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#202020] px-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white">Processes</span>
          <span className="text-white/40">
            {processes.length} processes running
          </span>
        </div>

        <button
          disabled={!selectedProcess || selectedProcess.system || !selectedProcess.windowId}
          title={
            selectedProcess?.system
              ? 'Windows will not let you end a system process'
              : 'End task'
          }
          onClick={() => {
            if (selectedProcess?.windowId) {
              onEndTask(selectedProcess.windowId);
              setSelected(null);
            }
          }}
          className="flex items-center gap-1.5 rounded-md bg-[#0078d4] px-3 py-1 font-medium text-white transition-colors hover:bg-[#0086ef] disabled:bg-white/8 disabled:text-white/25"
        >
          <X size={12} />
          End task
        </button>
      </div>

      {/* ════════════════════════════════════════════════ the heat-mapped table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-[#1f1f1f] text-[11px]">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 font-normal text-white/60">Name</th>
              {headers.map((h) => (
                <th key={h.label} className="w-24 px-3 py-1.5 font-normal">
                  {/* Header carries the machine-wide total — a Task Manager tell. */}
                  <div className="flex flex-col items-end leading-tight">
                    <span
                      className={`text-[13px] font-semibold ${
                        h.percent > 70 ? 'text-amber-400' : 'text-white/85'
                      }`}
                    >
                      {h.value}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-white/45">
                      {h.icon}
                      {h.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {processes.map((p) => (
              <tr
                key={p.pid}
                onClick={() => setSelected(p.pid)}
                className={`cursor-pointer border-b border-white/[0.04] transition-colors ${
                  selected === p.pid ? 'bg-[#0078d4]/35' : 'hover:bg-white/5'
                }`}
              >
                <td className="truncate px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        p.system ? 'bg-white/25' : 'bg-[#4cc2ff]'
                      }`}
                    />
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-[10px] text-white/30">{p.pid}</span>
                  </div>
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums"
                  style={{ background: heat(p.cpu, 30) }}
                >
                  {p.cpu.toFixed(1)}%
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums"
                  style={{ background: heat(p.memory, 1400) }}
                >
                  {p.memory < 1024
                    ? `${p.memory.toFixed(0)} MB`
                    : `${(p.memory / 1024).toFixed(1)} GB`}
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums"
                  style={{ background: heat(p.network * 2, 12) }}
                >
                  {(p.network * 1.4).toFixed(1)} MB/s
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums"
                  style={{ background: heat(p.network, 6) }}
                >
                  {p.network.toFixed(1)} Mbps
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════ status bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-[#202020] px-3 text-[10.5px] text-white/50">
        <span>
          Memory: {(totals.memoryUsedMb / 1024).toFixed(1)} GB /{' '}
          {(totals.memoryTotalMb / 1024).toFixed(0)} GB
        </span>
        <span>Fewer details ⌄</span>
      </div>
    </div>
  );
}
