// Umami share API 客户端：通过 shareId 换取 websiteId + token，再带 token 查询统计。
// API 语义（umami v2.20）：share 端点仅返回凭据，stats 端点需 x-umami-share-token 头。
interface ShareData {
  websiteId: string;
  token: string;
}

interface StatsData {
  /** umami v3 直接返回数字，旧版本为 { value } 对象 */
  pageviews?: number | { value?: number };
}

interface StatsQueryParams {
  timezone?: string;
  path?: string;
}

const SHARE_CACHE_KEY = "umami-share-cache";
const SHARE_CACHE_TTL = 3600_000; // 1h
let sharePromise: Promise<ShareData> | null = null;
const dataCache = new Map<string, Promise<StatsData>>();

async function fetchShareData(
  baseUrl: string,
  shareId: string
): Promise<ShareData> {
  const cached = localStorage.getItem(SHARE_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as {
        timestamp: number;
        value: ShareData;
      };
      if (Date.now() - parsed.timestamp < SHARE_CACHE_TTL) {
        return parsed.value;
      }
    } catch {
      localStorage.removeItem(SHARE_CACHE_KEY);
    }
  }
  const res = await fetch(`${baseUrl}/api/share/${shareId}`);
  if (!res.ok) throw new Error("获取 Umami 分享信息失败");
  const data = (await res.json()) as ShareData;
  localStorage.setItem(
    SHARE_CACHE_KEY,
    JSON.stringify({ timestamp: Date.now(), value: data })
  );
  return data;
}

function getUmamiShareData(
  baseUrl: string,
  shareId: string
): Promise<ShareData> {
  if (!sharePromise) {
    sharePromise = fetchShareData(baseUrl, shareId).catch(err => {
      sharePromise = null;
      throw err;
    });
  }
  return sharePromise;
}

function clearUmamiShareCache(): void {
  localStorage.removeItem(SHARE_CACHE_KEY);
  sharePromise = null;
}

export function fetchUmamiStats(
  baseUrl: string,
  shareId: string,
  queryParams: StatsQueryParams
): Promise<StatsData> {
  const statsKey = `${baseUrl}|${shareId}|${JSON.stringify(queryParams)}`;
  // 缓存 in-flight Promise：同 path 的并发查询共享一次请求，失败后删除以便重试
  const cached = dataCache.get(statsKey);
  if (cached) return cached;

  async function doFetch(isRetry = false): Promise<StatsData> {
    const { websiteId, token } = await getUmamiShareData(baseUrl, shareId);
    const params = new URLSearchParams({
      startAt: "0",
      endAt: String(Date.now()),
    });
    if (queryParams.timezone) params.set("timezone", queryParams.timezone);
    if (queryParams.path) params.set("path", queryParams.path);
    const res = await fetch(
      `${baseUrl}/api/websites/${websiteId}/stats?${params.toString()}`,
      {
        headers: {
          "x-umami-share-token": token,
          "x-umami-share-context": "1",
        },
      }
    );
    if (!res.ok) {
      if (res.status === 401 && !isRetry) {
        clearUmamiShareCache();
        return doFetch(true);
      }
      throw new Error("获取统计数据失败");
    }
    return (await res.json()) as StatsData;
  }

  const promise = doFetch().catch(err => {
    dataCache.delete(statsKey);
    throw err;
  });
  dataCache.set(statsKey, promise);
  return promise;
}
