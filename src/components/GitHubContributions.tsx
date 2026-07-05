import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
 * GitHubContributions
 *
 * Fetches the last-year contribution calendar from the public proxy
 * https://github-contributions-api.jogruber.de (no auth needed) and
 * renders a heatmap grid styled in the Stdout mint-green palette.
 *
 * Layout mirrors the reference (bharath.codes):
 *   • Small eyebrow: "GitHub Contributions • @username"
 *   • Month labels row
 *   • 53-col × 7-row contribution grid (one cell = one day)
 *   • Footer: total count (left) + Less/More legend (right)
 * ───────────────────────────────────────────────────────────────── */

type Day = {
  date: string;
  count: number;
  /** 0 = none, 1 = low, 2 = medium, 3 = high, 4 = very high */
  level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
  total: Record<string, number>;
  contributions: Day[];
};

const GITHUB_USERNAME = 'aneeshsharma72067';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Stdout theme contribution-level colours.
 * 0 = empty surface, 1–4 = mint ramp from faint → primary.
 */
const LEVEL_COLOR: Record<number, string> = {
  0: '#1a1f2d',  // surface-container — "empty" day
  1: '#0c3124',  // very sparse
  2: '#125c3f',  // moderate
  3: '#2ebf91',  // primary-container — active
  4: '#55ddad',  // primary (accent) — very active
};

/** Cell size and gap in px — keeps the grid compact */
const CELL = 11;
const GAP  = 3;
const WEEK_W = CELL + GAP; // 14 px per column

/* ── helpers ──────────────────────────────────────────────────── */

/** Split a flat day array into columns of 7 (one column = one week) */
function chunkWeeks(days: Day[]): Day[][] {
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/**
 * Walk the weeks and emit a label whenever the month changes.
 * Returns { label, x } where x is the pixel offset of that column.
 */
function buildMonthLabels(weeks: Day[][]): { label: string; x: number }[] {
  const labels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    if (!week[0]) return;
    const m = new Date(week[0].date).getMonth();
    if (m !== lastMonth) {
      labels.push({ label: MONTHS[m], x: wi * WEEK_W });
      lastMonth = m;
    }
  });
  return labels;
}

/* ── component ───────────────────────────────────────────────── */

const GitHubContributions = () => {
  const [weeks, setWeeks]     = useState<Day[][]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

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
        // `lastYear` is the key for the trailing-12-months total
        const yr = json.total['lastYear'] ?? Object.values(json.total).reduce((a, b) => a + b, 0);
        setTotal(yr);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const monthLabels = buildMonthLabels(weeks);
  const gridWidth   = weeks.length * WEEK_W;

  return (
    <section className="mt-10 w-full">
      {/* ── eyebrow ── */}
      <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-label text-outline">
        GitHub Contributions{' '}
        <span className="font-label text-[11px] normal-case tracking-normal text-primary/60">
          • @{GITHUB_USERNAME}
        </span>
      </p>

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

      {/* ── graph ── */}
      {!loading && !error && (
        /* Horizontally scrollable on small screens */
        <div className="overflow-x-auto rounded-soft">
          <div style={{ width: Math.max(gridWidth, 0) }}>

            {/* Month label row */}
            <div className="relative mb-2" style={{ height: 16 }}>
              {monthLabels.map(({ label, x }) => (
                <span
                  key={`${label}-${x}`}
                  className="absolute font-label text-[10px] text-outline"
                  style={{ left: x }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Heatmap grid — flex of week columns */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        backgroundColor: LEVEL_COLOR[day.level] ?? LEVEL_COLOR[0],
                        cursor: 'default',
                        // Subtle pop on the brightest cells for depth
                        boxShadow:
                          day.level === 4
                            ? '0 0 6px rgba(85,221,173,0.4)'
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer: total (left) — legend (right) */}
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
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: LEVEL_COLOR[l],
                    }}
                  />
                ))}
                <span className="font-label text-[10px] text-outline">More</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default GitHubContributions;
