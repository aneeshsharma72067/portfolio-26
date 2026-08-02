import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

interface LeetCodeData {
  username: string;
  streak: number;
  totalSolved: number;
  loading: boolean;
}

const LEETCODE_USERNAME = 'aneesh1024';

export default function LeetCodeProfile() {
  const { t } = useTranslation();
  const [data, setData] = useState<LeetCodeData>({
    username: LEETCODE_USERNAME,
    streak: 74,
    totalSolved: 437,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    // Total solved + submission stats
    fetch(`https://leetcode-api-faisalshohag.vercel.app/${LEETCODE_USERNAME}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!isMounted || !res || typeof res.totalSolved !== 'number') return;
        setData((prev) => ({ ...prev, totalSolved: res.totalSolved, loading: false }));
      })
      .catch(() => {
        if (isMounted) setData((prev) => ({ ...prev, loading: false }));
      });

    // Streak, derived from the submission calendar so freeze/travel days count
    const query = `
      query getStreak($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            streak
            submissionCalendar
          }
        }
      }
    `;

    fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!isMounted) return;
        const calendar = res?.data?.matchedUser?.userCalendar;
        if (!calendar) return;

        let streak = calendar.streak ?? 74;

        if (calendar.submissionCalendar) {
          try {
            const parsed = JSON.parse(calendar.submissionCalendar);
            const days = Object.keys(parsed).map(Number).sort((a, b) => a - b);
            const daySecs = 86400;
            let count = 0;
            for (let i = days.length - 1; i > 0; i--) {
              const gap = Math.round((days[i] - days[i - 1]) / daySecs);
              if (gap <= 2) count += gap;
              else break;
            }
            if (count > 0) streak = count + 1;
          } catch {
            // keep fetched/default streak
          }
        }

        setData((prev) => ({ ...prev, streak }));
      })
      .catch(() => {
        // silent fallback to defaults
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const code = 'JetBrains Mono, "Fira Code", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace';

  return (
    <a
      href={`https://leetcode.com/u/${data.username}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-full select-none rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] shadow-floating overflow-hidden transition-colors duration-300 hover:border-[#FFA116]/40"
      style={{ fontFamily: code, minHeight: '186px' }}
    >
      {/* title bar */}
      <div className="flex items-center justify-between bg-[#252526] px-3 py-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4A4A4A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4A4A4A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4A4A4A]" />
          </div>
          <span className="truncate text-[11px] text-[#9A9A9A]">
            {data.username}<span className="text-[#5A5A5A]">.stats.ts</span>
          </span>
        </div>
        <span className="shrink-0 text-[9px] font-bold tracking-wider text-[#FFA116]/70">
          LEETCODE
        </span>
      </div>

      {/* code body */}
      <div className="px-3 py-2.5 text-[12px] leading-[1.55]">
        <Line n={1}>
          <span className="text-[#6A9955]">{`// ${data.username} · solved problems`}</span>
        </Line>
        <Line n={2}>
          <span className="text-[#C586C0]">import</span>{' '}
          <span className="text-[#D4D4D4]">{'{ '}</span>
          <span className="text-[#4EC9B0]">Profile</span>
          <span className="text-[#D4D4D4]">{' }'}</span>{' '}
          <span className="text-[#C586C0]">from</span>{' '}
          <span className="text-[#CE9178]">'./leetcode'</span>
          <span className="text-[#D4D4D4]">;</span>
        </Line>
        <Line n={3}>&nbsp;</Line>
        <Line n={4}>
          <span className="text-[#C586C0]">const</span>{' '}
          <span className="text-[#9CDCFE]">streak</span>{' '}
          <span className="text-[#D4D4D4]">=</span>{' '}
          <span className="text-[#B5CEA8]">{data.streak}</span>
          <span className="text-[#D4D4D4]">;</span>
          <Flame
            size={12}
            className="ml-2 inline -translate-y-[1px] text-[#FFA116] fill-[#FFA116]/30 transition-transform duration-300 group-hover:-translate-y-[3px]"
          />
        </Line>
        <Line n={5}>
          <span className="text-[#C586C0]">const</span>{' '}
          <span className="text-[#9CDCFE]">totalSolved</span>{' '}
          <span className="text-[#D4D4D4]">=</span>{' '}
          <span className="text-[#B5CEA8]">{data.totalSolved}</span>
          <span className="text-[#D4D4D4]">;</span>
        </Line>
        <Line n={6}>&nbsp;</Line>
        <Line n={7}>
          <span className="text-[#C586C0]">export</span>{' '}
          <span className="text-[#C586C0]">default</span>{' '}
          <span className="text-[#DCDCAA]">Profile</span>
          <span className="text-[#D4D4D4]">(</span>
          <span className="text-[#9CDCFE]">streak</span>
          <span className="text-[#D4D4D4]">, </span>
          <span className="text-[#9CDCFE]">totalSolved</span>
          <span className="text-[#D4D4D4]">);</span>
          <span
            className="ml-1 inline-block h-[13px] w-[6px] translate-y-[2px] bg-[#FFA116] motion-safe:animate-[caret_1.1s_steps(1)_infinite] motion-reduce:opacity-70"
            aria-hidden="true"
          />
        </Line>
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between border-t border-[#2A2A2A] bg-[#252526] px-3 py-1.5 text-[10px] text-[#7A7A7A]">
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${data.loading ? 'bg-[#7A7A7A]' : 'bg-[#4EC9B0]'}`}
          />
          {data.loading ? (t('syncing') || 'syncing…') : (t('synced') || 'synced')}
        </span>
        <span className="text-[#FFA116]/80 transition-colors group-hover:text-[#FFA116]">
          {t('viewProfile') || 'open profile →'}
        </span>
      </div>

      <style>{`
        @keyframes caret {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </a>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-5 shrink-0 select-none text-right pr-3 text-[#5A5A5A]">{n}</span>
      <span className="whitespace-pre">{children}</span>
    </div>
  );
}