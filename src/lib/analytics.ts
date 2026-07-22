/* ============================================================================
   analytics.ts — Google Analytics 4 (GA4) integration.

   Uses the native gtag.js snippet loaded dynamically (no third-party npm
   dependency). The Measurement ID is read from VITE_GA_MEASUREMENT_ID and
   is NEVER hardcoded.

   ── Why the original implementation was broken ──────────────────────────────
   The previous gtag function used a rest parameter spread:

       const gtag: GtagFn = (...args) => { window.dataLayer.push(args); };

   This pushes a plain JavaScript Array onto dataLayer.
   Google's gtag.js runtime distinguishes gtag commands from raw dataLayer
   objects by checking whether each entry is an `Arguments` object (the special
   internal type produced only by `function gtag(){dataLayer.push(arguments)}`).
   Arrays are silently ignored. As a result every `gtag('event', ...)` call was
   queued but never dispatched — zero requests to /g/collect were made.

   The fix is the exact function body Google ships:

       function gtag(){ window.dataLayer.push(arguments); }

   Because TypeScript's arrow functions cannot produce `arguments`, we use a
   traditional function expression and cast its type.

   ── Other design notes ───────────────────────────────────────────────────────
   - initAnalytics() is idempotent: a module-level guard means it can safely be
     called on every React render / route change.
   - Without a Measurement ID every function is a silent no-op.
   - send_page_view is left to its default (true) for the initial config call so
     the very first load is tracked even before the script has fully executed.
     For SPA route changes we call window.gtag('config', ID) again, which GA4
     treats as a new page_view — this is the officially documented SPA pattern.
   - Scroll depth, outbound clicks, and file downloads are NOT reimplemented —
     GA4 Enhanced Measurement captures those. Custom events here add the
     dimension EM can't provide (which project, which social, etc.).
   ========================================================================== */

/** Measurement ID from the Vite environment. Empty string when unset. */
const MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';

/** True during `vite dev` — used for console logging. */
const IS_DEV: boolean = import.meta.env.DEV;

/** Prevents duplicate script injection across re-renders / hot reloads. */
let initialized = false;

/* ─── Type declarations ───────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GtagArgs = [string, ...any[]];

declare global {
  interface Window {
    // dataLayer must be typed as IArguments[] because that is exactly what
    // `function gtag(){ dataLayer.push(arguments) }` pushes — not arrays.
    // Using `unknown[]` is fine for TypeScript; what matters is runtime type.
    dataLayer: IArguments[];
    gtag: (...args: GtagArgs) => void;
  }
}

/* ─── Core bootstrap ──────────────────────────────────────────────────────── */

/**
 * Inject the gtag.js script and configure GA4. Safe to call repeatedly —
 * only the first call with a valid Measurement ID does any work.
 *
 * IMPORTANT: The gtag function MUST use `function` + `arguments`, not an
 * arrow function. This is not stylistic — gtag.js identifies queued commands
 * by checking `entry instanceof IArguments` (internal slot [[Class]]).
 * An arrow function's spread produces a plain Array which gtag.js ignores.
 */
export function initAnalytics(): void {
  if (initialized) return;
  if (!MEASUREMENT_ID) {
    if (IS_DEV) console.debug('[analytics] VITE_GA_MEASUREMENT_ID not set — GA4 disabled.');
    return;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // ── Official Google bootstrap (verbatim, typed for TypeScript) ──────────
  window.dataLayer = window.dataLayer || [];

  // MUST be a regular function — arrow functions don't have `arguments`.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer.push(arguments as unknown as IArguments); };

  // Inject the remote script.
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Bootstrap timestamp (required by GA4 — must come before config).
  window.gtag('js', new Date());

  // Initial config. Omitting send_page_view lets GA4 send the first
  // page_view automatically, which is correct for the landing load.
  // For subsequent SPA navigations we call gtag('config', ID, {...}) again.
  window.gtag('config', MEASUREMENT_ID);

  initialized = true;
  if (IS_DEV) console.debug('[analytics] GA4 initialized with', MEASUREMENT_ID);
}

/* ─── Internal helper ─────────────────────────────────────────────────────── */

/** Dispatch a custom event. All public helpers funnel through here. */
function track(eventName: string, params: Record<string, unknown> = {}): void {
  if (IS_DEV) console.debug('[analytics] event:', eventName, params);
  if (!initialized || !MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/* ─── Page-view tracking (SPA) ───────────────────────────────────────────── */

/**
 * Call on every SPA route change AFTER the initial mount.
 * Re-calling `gtag('config', ID)` is the officially documented way to send a
 * page_view for SPA navigations — it re-fires the config hit with the current
 * page location, which GA4 records as a new page_view.
 */
export function trackPageView(path: string = window.location.pathname): void {
  if (IS_DEV) console.debug('[analytics] page_view:', path);
  if (!initialized || !MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', MEASUREMENT_ID, {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/* ─── Event helpers ───────────────────────────────────────────────────────── */

export function trackResumeDownload(): void {
  track('resume_download');
}

export function trackGithubClick(location = 'unknown'): void {
  track('github_click', { location });
}

export function trackLinkedinClick(): void {
  track('linkedin_click');
}

export function trackContactClick(method = 'email'): void {
  track('contact_click', { method });
}

/** A project's live-demo link was clicked. */
export function trackProjectClick(projectName: string): void {
  track('project_demo_click', { project_name: projectName });
}

/** A project's source-code (GitHub) link was clicked. */
export function trackProjectSourceClick(projectName: string): void {
  track('project_source_click', { project_name: projectName });
}

/**
 * Generic outbound link. Use only where the destination label adds insight
 * beyond GA4 Enhanced Measurement's automatic outbound-click tracking.
 */
export function trackExternalLink(url: string, label = ''): void {
  track('external_link_click', { url, label });
}
