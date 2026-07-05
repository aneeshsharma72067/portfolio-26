import { useEffect, useRef, useState } from 'react';
import { links } from '@/data/content';

/* ─────────────────────────────────────────────────────────────────
 * GitHubContributions
 *
 * Features:
 *  • Fetches live calendar from github-contributions-api.jogruber.de
 *  • Animated tooltip on cell hover (fade + slide, 150 ms)
 *    - Shows count + nicely-formatted date
 *    - Downward caret arrow pointing to the hovered cell
 *  • Clicking anywhere on the graph opens the GitHub profile
 *  • Month labels row, total count + Less/More legend
 * ───────────────────────────────────────────────────────────────── */

type Day = {
  date: string;
  count: number;
  /** 0 = none · 1 = low · 2 = medium · 3 = high · 4 = very high */
  level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
  total: Record<string, number>;
  contributions: Day[];
};

/** Tooltip anchor — page-absolute centre of the hovered cell */
type TooltipAnchor = { day: Day; cx: number; top: number };

const GITHUB_USERNAME = 'aneeshsharma72067';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Contribution-level colours — Stdout mint ramp.
 * 0 = empty surface, 1 → 4 = faint → primary accent.
 */
const LEVEL_COLOR: Record<number, string> = {
  0: '#1a1f2d',  // surface-container
  1: '#0c3124',  // very sparse
  2: '#125c3f',  // moderate
  3: '#2ebf91',  // primary-container
  4: '#55ddad',  // primary (full accent)
};

/** Colour used for the tooltip card background + caret */
const TOOLTIP_BG = '#2f3443'; // surface-container-highest

const CELL   = 11; // px — cell size
const GAP    = 3;  // px — gap between cells
const WEEK_W = CELL + GAP; // 14 px per week column

/* ── helpers ──────────────────────────────────────────────────── */

/** Chunk a flat day array into week columns of 7 */
function chunkWeeks(days: Day[]): Day[][] {
  const out: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
  return out;
}

/** Return { label, pct } for each month-boundary week */
function buildMonthLabels(weeks: Day[][]): { label: string; pct: number }[] {
  const labels: { label: string; pct: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    if (!week[0]) return;
    const m = new Date(week[0].date).getMonth();
    if (m !== lastMonth) {
      labels.push({ label: MONTHS[m], pct: (wi / weeks.length) * 100 });
      lastMonth = m;
    }
  });
  return labels;
}

/** "Mon, Jul 5, 2026" */
function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ── component ───────────────────────────────────────────────── */

const GitHubContributions = () => {
  const [weeks,   setWeeks]   = useState<Day[][]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  /* Tooltip state:
   *   anchor  — positional data + day; null = not hovering
   *   visible — drives the CSS transition (true = shown) */
  const [anchor,  setAnchor]  = useState<TooltipAnchor | null>(null);
  const [visible, setVisible] = useState(false);

  /** Delayed clear so the exit transition plays before unmounting */
  const hideTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
    )
      .then((r) => {
        if (!r.ok) throw new Error('non-200');
        return r.json() as Promise<ApiResponse>;
      })
      .then((json) => {
        setWeeks(chunkWeeks(json.contributions));
        const yr =
          json.total['lastYear'] ??
          Object.values(json.total).reduce((a, b) => a + b, 0);
        setTotal(yr);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  /* ── tooltip handlers ───────────────────────────────────────── */

  const onEnter = (day: Day, e: React.MouseEvent<HTMLDivElement>) => {
    clearTimeout(hideTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchor({ day, cx: rect.left + rect.width / 2, top: rect.top });
    // rAF ensures the element is in DOM before the transition starts
    requestAnimationFrame(() => setVisible(true));
  };

  const onLeave = () => {
    // Trigger exit transition first …
    setVisible(false);
    // … then remove from DOM after it completes (200 ms matches transition)
    hideTimer.current = setTimeout(() => setAnchor(null), 200);
  };

  /* ── derived ────────────────────────────────────────────────── */

  const monthLabels = buildMonthLabels(weeks);

  return (
    <section className="relative mt-10 w-full">

      {/* ── eyebrow — clicks to GitHub ── */}
      <a
        href={links.github}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-outline transition-colors duration-200 hover:text-on-surface"
      >
        GitHub Contributions
        <span className="normal-case tracking-normal text-primary/60">
          • @{GITHUB_USERNAME}
        </span>
      </a>

      {/* ── loading ── */}
      {loading && (
        <div className="flex h-24 items-center">
          <span className="animate-pulse font-body text-sm italic text-outline">
            Loading contributions…
          </span>
        </div>
      )}

      {/* ── error ── */}
      {error && (
        <div className="flex h-24 items-center">
          <span className="font-body text-sm italic text-on-surface-variant">
            Could not load GitHub contributions.
          </span>
        </div>
      )}

      {/* ── graph — clicking opens GitHub ── */}
      {!loading && !error && (
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-x-auto rounded-soft w-full border border-outline-variant/30 bg-surface-container-low/10 p-4"
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          <div className="w-full min-w-[720px]">

            {/* Month labels */}
            <div className="relative mb-2 w-full" style={{ height: 16 }}>
              {monthLabels.map(({ label, pct }) => (
                <span
                  key={`${label}-${pct}`}
                  className="absolute font-label text-[10px] text-outline"
                  style={{ left: `${pct}%` }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Heatmap grid using CSS Grid for responsive 100% container width */}
            <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-[2px] sm:gap-[3px] w-full">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-rows-7 gap-[2px] sm:gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={(e) => onEnter(day, e)}
                      onMouseLeave={onLeave}
                      className="w-full aspect-square rounded-[1px] sm:rounded-[2px]"
                      style={{
                        backgroundColor: LEVEL_COLOR[day.level] ?? LEVEL_COLOR[0],
                        // Subtle glow on the most-active cells
                        boxShadow:
                          day.level === 4
                            ? '0 0 6px rgba(85,221,173,0.45)'
                            : undefined,
                        cursor: 'inherit',
                        transition: 'filter 100ms ease',
                      }}
                      onFocus={() => {}}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-body text-xs text-outline">
                {total.toLocaleString()} contributions in the last year
              </span>

              <div className="flex items-center gap-1.5">
                <span className="font-label text-[10px] text-outline">Less</span>
                {([0, 1, 2, 3, 4] as const).map((l) => (
                  <div
                    key={l}
                    style={{
                      width: CELL, height: CELL, borderRadius: 2,
                      backgroundColor: LEVEL_COLOR[l],
                    }}
                  />
                ))}
                <span className="font-label text-[10px] text-outline">More</span>
              </div>
            </div>

          </div>
        </a>
      )}

      {/* ── Animated tooltip ─────────────────────────────────────
       *  Fixed-position so it escapes any overflow:hidden parent.
       *  Transitions: opacity + translateY (150 ms ease).
       *  Downward caret aligns with the hovered cell's centre.
       * ─────────────────────────────────────────────────────── */}
      {anchor && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[9999]"
          style={{
            /* Position above the cell centre */
            left: anchor.cx,
            top: anchor.top,
            /* Enter: slide up 6 px + fade in | Exit: slide down + fade out */
            opacity: visible ? 1 : 0,
            transform: `translateX(-50%) translateY(${
              visible ? 'calc(-100% - 10px)' : 'calc(-100% - 4px)'
            })`,
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
        >
          {/* Card */}
          <div
            className="relative rounded border border-white/10 px-3 py-2 shadow-floating"
            style={{ backgroundColor: TOOLTIP_BG, minWidth: 140 }}
          >
            {/* Count — prominent */}
            <p className="whitespace-nowrap font-headline text-[12px] font-bold text-on-surface">
              {anchor.day.count === 0
                ? 'No contributions'
                : `${anchor.day.count} contribution${anchor.day.count !== 1 ? 's' : ''}`}
            </p>

            {/* Date — muted italic */}
            <p className="mt-0.5 whitespace-nowrap font-body text-[10px] italic text-on-surface-variant">
              {fmtDate(anchor.day.date)}
            </p>

            {/* Caret pointing downward toward the cell */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${TOOLTIP_BG}`,
              }}
            />
          </div>
        </div>
      )}

    </section>
  );
};

export default GitHubContributions;
