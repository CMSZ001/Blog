// 查询 Umami 访问量并填充页面元素。
// 配置通过 <script data-umami-views> 标签的 data-* 属性传递。
// 页面切换（Astro view transitions）后监听 astro:after-swap 重新查询。
// fetchUmamiStats 定义在 ./umami-share，由 Astro 合并为同一 chunk。
import { fetchUmamiStats } from "./umami-share";

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VIEWS_CACHE_TTL = 3600_000; // 命中 TTL 内缓存直接填值，不再发网络请求
// v2：修复 umami v3 数字型响应，改前缀以作废旧缓存里的错误 0 值
const CACHE_PREFIX = "umami-views:v2";
const cacheKey = (path: string): string => `${CACHE_PREFIX}:${path}`;

interface ViewsCache {
  n: number;
  ts: number;
}

const readCache = (path: string): ViewsCache | null => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(cacheKey(path)) ?? ""
    ) as Partial<ViewsCache>;
    if (parsed && Number.isFinite(parsed.n))
      return { n: parsed.n!, ts: parsed.ts! };
  } catch {}
  return null;
};
const writeCache = (path: string, n: number): void => {
  try {
    localStorage.setItem(cacheKey(path), JSON.stringify({ ts: Date.now(), n }));
  } catch {
    // localStorage 不可用时忽略，仅失去切页缓存
  }
};

function animateCount(countEl: Element, target: number, duration = 800): void {
  const fmt = (n: number): string => n.toLocaleString();
  const startValue =
    parseInt(countEl.textContent?.replace(/\D/g, "") ?? "", 10) || 0;
  if (prefersReducedMotion() || target <= startValue) {
    countEl.textContent = fmt(target);
    return;
  }
  const start = performance.now();
  const tick = (now: number): void => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    countEl.textContent = fmt(
      Math.round(startValue + (target - startValue) * eased)
    );
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

function fill(countEl: Element, value: number): void {
  countEl.textContent = value.toLocaleString();
}

function viewsCount(stats: {
  pageviews?: number | { value?: number };
}): number {
  const pv = stats.pageviews;
  return typeof pv === "number" ? pv : (pv?.value ?? 0);
}

function collect(animate = false): void {
  const cfgScript = document.querySelector<HTMLScriptElement>(
    "script[data-umami-views]"
  );
  if (!cfgScript) return;

  const targets: Array<[HTMLElement, string, ViewsCache | null]> = [];
  document.querySelectorAll<HTMLElement>(".views").forEach(el => {
    if (el.dataset.loaded) return;
    const path = el.dataset.path ?? "";
    const countEl = el.querySelector("[data-views-count]") ?? el;
    const cached = readCache(path);
    // TTL 内命中缓存：跳过请求直接填值（首访走动画，切页直接填）
    if (cached && Date.now() - cached.ts < VIEWS_CACHE_TTL) {
      if (animate) animateCount(countEl, cached.n);
      else fill(countEl, cached.n);
      el.dataset.loaded = "1";
      return;
    }
    targets.push([el, path, cached]); // cached 可能过期，切页占位再用
  });
  if (!targets.length) return;

  const load = async ([el, path, cached]: [
    HTMLElement,
    string,
    ViewsCache | null,
  ]): Promise<void> => {
    const countEl = el.querySelector("[data-views-count]") ?? el;
    // 切页用过期缓存填占位避免闪烁，随后 fetch 刷新；新鲜缓存已在上层拦截
    if (!animate && cached) fill(countEl, cached.n);
    try {
      const timezone = cfgScript.dataset.umamiTimezone;
      const stats = await fetchUmamiStats(
        cfgScript.dataset.umamiBaseUrl ?? "",
        cfgScript.dataset.umamiShareId ?? "",
        path ? { timezone, path: `eq.${path}` } : { timezone }
      );
      const n = viewsCount(stats);
      writeCache(path, n);
      if (animate) animateCount(countEl, n);
      else fill(countEl, n);
      el.dataset.loaded = "1";
    } catch {
      // 访问量为渐进增强，统计失败时保留当前值即可
    }
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const target = targets.find(([el]) => el === en.target);
      if (target) load(target);
    });
  });
  targets.forEach(([el]) => io.observe(el));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => collect(true));
} else {
  collect(true);
}
// view transitions 切页不重播动画，直接复用缓存/查询值
document.addEventListener("astro:after-swap", () => collect(false));
