import { useEffect, useState } from 'react';
import { Flame, Code2, Trophy, Award, Target, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

interface LeetCodeData {
  avatar: string;
  realName: string;
  username: string;
  ranking: number;
  streak: number;
  totalActiveDays: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  reputation: number;
  loading: boolean;
}

export default function LeetCodeProfile() {
  const { t } = useTranslation();
  const [data, setData] = useState<LeetCodeData>({
    avatar: 'https://assets.leetcode.com/users/aneesh1024/avatar_1724996020.png',
    realName: 'Aneesh',
    username: 'aneesh1024',
    ranking: 262277,
    streak: 32,
    totalActiveDays: 182,
    totalSolved: 437,
    easySolved: 151,
    mediumSolved: 229,
    hardSolved: 57,
    reputation: 139,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    
    // Primary API query directly to LeetCode GraphQL via our Vercel API or public endpoint fallback
    fetch('https://leetcode-api-faisalshohag.vercel.app/aneesh1024')
      .then((r) => {
        if (!r.ok) throw new Error('Primary fetch failed');
        return r.json();
      })
      .then((resData) => {
        if (!isMounted) return;
        if (resData && typeof resData.totalSolved === 'number') {
          setData((prev) => ({
            ...prev,
            ranking: resData.ranking || prev.ranking,
            totalSolved: resData.totalSolved || prev.totalSolved,
            easySolved: resData.easySolved || prev.easySolved,
            mediumSolved: resData.mediumSolved || prev.mediumSolved,
            hardSolved: resData.hardSolved || prev.hardSolved,
            reputation: resData.reputation || prev.reputation,
            loading: false,
          }));
        }
      })
      .catch(() => {
        if (isMounted) setData((prev) => ({ ...prev, loading: false }));
      });

    // Supplementary GraphQL query to get user calendar streak and avatar
    const query = `
      query getLeetCodeProfile($username: String!) {
        matchedUser(username: $username) {
          profile {
            userAvatar
            realName
            ranking
          }
          userCalendar {
            streak
            totalActiveDays
          }
        }
      }
    `;

    fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username: 'aneesh1024' } }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!isMounted || !res?.data?.matchedUser) return;
        const user = res.data.matchedUser;
        setData((prev) => ({
          ...prev,
          avatar: user.profile?.userAvatar || prev.avatar,
          realName: user.profile?.realName || prev.realName,
          ranking: user.profile?.ranking || prev.ranking,
          streak: user.userCalendar?.streak ?? prev.streak,
          totalActiveDays: user.userCalendar?.totalActiveDays ?? prev.totalActiveDays,
        }));
      })
      .catch(() => {
        // Fallback gracefully to default state
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalTarget = 800; // Visual progress bar target scale
  const easyPct = (data.easySolved / data.totalSolved) * 100 || 0;
  const medPct = (data.mediumSolved / data.totalSolved) * 100 || 0;
  const hardPct = (data.hardSolved / data.totalSolved) * 100 || 0;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-[#FFA116]/20 bg-[#1A1A1A] p-4 shadow-floating transition-all duration-300 hover:border-[#FFA116]/50 w-full h-full select-none overflow-hidden"
      style={{ fontFamily: 'sans-serif', minHeight: '186px' }}
    >
      {/* Background LeetCode aesthetic branding watermarks */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-5 text-[#FFA116] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-10">
        <Code2 size={160} />
      </div>

      {/* Top Header Row: Profile Avatar, Username, Streak Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <a
          href="https://leetcode.com/u/aneesh1024/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 min-w-0 group/link"
        >
          {/* Quirky Glowing Avatar Frame */}
          <div className="relative shrink-0">
            <img
              src={data.avatar}
              alt={data.username}
              className="h-11 w-11 rounded-xl border-2 border-[#FFA116]/80 object-cover shadow-[0_0_12px_rgba(255,161,22,0.35)] transition-transform duration-300 group-hover/link:scale-105"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFA116] text-[8px] font-black text-black">
              LC
            </span>
          </div>

          {/* User info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-headline text-base font-extrabold text-white transition-colors group-hover/link:text-[#FFA116]">
                {data.username}
              </span>
              <ExternalLink size={12} className="text-[#FFA116]/70 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#8A8A8A]">
              <span className="flex items-center gap-1 text-[#FFA116]">
                <Trophy size={11} /> #{data.ranking ? data.ranking.toLocaleString() : '262,277'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-zinc-400">
                <Target size={11} /> {data.totalActiveDays} Days
              </span>
            </div>
          </div>
        </a>

        {/* Quirky Streak Flame Pill */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#FFA116]/40 bg-[#FFA116]/10 px-3 py-1 text-xs font-black text-[#FFA116] shadow-[0_0_10px_rgba(255,161,22,0.15)] animate-pulse">
          <Flame size={15} className="fill-[#FFA116] text-[#FFA116] animate-bounce" />
          <span className="font-mono">{data.streak}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFA116]/80">Streak</span>
        </div>
      </div>

      {/* Middle Section: Big Solved Number + Stacked Segmented Progress */}
      <div className="relative z-10 mt-3 w-full">
        <div className="flex items-end justify-between mb-1.5">
          <div>
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              {data.totalSolved}
            </span>
            <span className="ml-1.5 text-[11px] font-semibold text-[#8A8A8A]">
              {t('totalSolved') || 'Solved'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 font-mono">
            <Award size={12} className="text-[#FFA116]" />
            <span>{data.reputation} Rep</span>
          </div>
        </div>

        {/* Multi-color difficulty progress bar */}
        <div className="relative flex h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A] p-0.5">
          <div
            className="h-full bg-[#00B8A3] rounded-l-full transition-all duration-500"
            style={{ width: `${easyPct}%` }}
            title={`Easy: ${data.easySolved}`}
          />
          <div
            className="h-full bg-[#FFC01E] transition-all duration-500"
            style={{ width: `${medPct}%` }}
            title={`Medium: ${data.mediumSolved}`}
          />
          <div
            className="h-full bg-[#FF375F] rounded-r-full transition-all duration-500"
            style={{ width: `${hardPct}%` }}
            title={`Hard: ${data.hardSolved}`}
          />
        </div>
      </div>

      {/* Bottom Section: Quirky Easy / Medium / Hard Stat Badges */}
      <div className="relative z-10 mt-3 flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[11px]">
        {/* Easy */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[#00B8A3]/10 px-2 py-1 border border-[#00B8A3]/20">
          <span className="h-2 w-2 rounded-full bg-[#00B8A3]" />
          <span className="text-[#00B8A3] font-bold">Easy</span>
          <span className="font-extrabold text-white">{data.easySolved}</span>
        </div>

        {/* Medium */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[#FFC01E]/10 px-2 py-1 border border-[#FFC01E]/20">
          <span className="h-2 w-2 rounded-full bg-[#FFC01E]" />
          <span className="text-[#FFC01E] font-bold">Med</span>
          <span className="font-extrabold text-white">{data.mediumSolved}</span>
        </div>

        {/* Hard */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[#FF375F]/10 px-2 py-1 border border-[#FF375F]/20">
          <span className="h-2 w-2 rounded-full bg-[#FF375F]" />
          <span className="text-[#FF375F] font-bold">Hard</span>
          <span className="font-extrabold text-white">{data.hardSolved}</span>
        </div>
      </div>
    </div>
  );
}
