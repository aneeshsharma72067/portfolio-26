/* ============================================================================
   analytics.ts — Google Analytics 4 (GA4) integration.

   Uses the native gtag.js snippet loaded dynamically (no third-party npm
   dependency — GA4 is just two globals: `dataLayer` + `gtag`). The Measurement
   ID is read from the `VITE_GA_MEASUREMENT_ID` env var and is NEVER hardcoded.

   Design notes:
     - initAnalytics() is idempotent: a module-level guard means React 18
       StrictMode's double-mount (and the app's once-a-second clock re-renders)
       can call it repeatedly without injecting the script twice.
     - If the Measurement ID is absent (e.g. local dev without a .env, or a
       preview build), every function becomes a silent no-op — nothing loads,
       nothing throws.
     - Automatic page_view is DISABLED at config time (`send_page_view:false`)
       because this app drives its own route changes; we send page_view
       manually via trackPageView() so SPA navigations aren't missed and the
       initial load isn't double-counted.
     - Scroll depth, outbound-link clicks and file downloads are intentionally
       NOT reimplemented here — GA4 Enhanced Measurement already captures them.
       The custom events below add a dimension EM can't: *which* project, *which*
       social link, etc.
   ========================================================================== */

// The gtag command signature is variadic and loosely typed by design; this is
// the shape Google ships. Keeping it local avoids leaking `any` elsewhere.
type GtagCommand = 'js' | 'config' | 'event' | 'set';
type GtagFn = (command: GtagCommand, ...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: GtagFn;
  }
}

/** Measurement ID from the environment. Empty string when unset. */
const MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';

/** True in `vite dev`; used to log events to the console instead of relying
    solely on the GA Realtime dashboard while developing. */
const IS_DEV: boolean = import.meta.env.DEV;

/** Guards against duplicate script injection / config (StrictMode, re-renders). */
let initialized = false;

/** True once GA is actually usable (has an ID and has been initialized). */
function isEnabled(): boolean {
  return initialized && Boolean(MEASUREMENT_ID) && typeof window.gtag === 'function';
}

/**
 * Inject gtag.js and configure GA4. Safe to call multiple times — only the
 * first call with a valid Measurement ID does any work. No-op without an ID.
 */
export function initAnalytics(): void {
  if (initialized) return;
  if (!MEASUREMENT_ID) {
    if (IS_DEV) console.debug('[analytics] VITE_GA_MEASUREMENT_ID not set — GA4 disabled.');
    return;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Standard gtag.js bootstrap.
  window.dataLayer = window.dataLayer || [];
  const gtag: GtagFn = (...args) => {
    window.dataLayer.push(args);
  };
  window.gtag = gtag;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  // send_page_view:false → we emit page_view manually (SPA-aware, no dupes).
  gtag('config', MEASUREMENT_ID, { send_page_view: false });

  initialized = true;
  if (IS_DEV) console.debug('[analytics] GA4 initialized', MEASUREMENT_ID);
}

/**
 * Low-level event dispatcher. All helpers below funnel through here so dev
 * logging + the enabled-check live in one place.
 */
function track(eventName: string, params: Record<string, unknown> = {}): void {
  if (IS_DEV) console.debug('[analytics] event:', eventName, params);
  if (!isEnabled()) return;
  window.gtag!('event', eventName, params);
}

/**
 * Send a SPA page_view. Call on every route change (and once on load). Defaults
 * to the current location so callers usually pass nothing.
 */
export function trackPageView(path: string = window.location.pathname): void {
  if (IS_DEV) console.debug('[analytics] page_view:', path);
  if (!isEnabled()) return;
  window.gtag!('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/* --------------------------------------------------------------- event helpers
   Thin, self-describing wrappers. Add new ones here as the site grows — one
   line each — and call them from the relevant onClick. */

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

/** Generic outbound link — use only where the destination label adds insight
    beyond GA4 Enhanced Measurement's automatic outbound-click tracking. */
export function trackExternalLink(url: string, label = ''): void {
  track('external_link_click', { url, label });
}
