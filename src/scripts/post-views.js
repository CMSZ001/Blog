(function () {
    const umamiConfig = { "enable": true, "baseUrl": "https://umami.acmsz.top", "shareId": "CFirWMQoiIUmgPLm", "timezone": "Asia/Shanghai" };

    // 获取文章浏览量统计
    async function fetchPostCardViews(slug) {
        if (!umamiConfig.enable) {
            return;
        }

        try {
            // 第一步：获取网站ID和token
            const shareResponse = await fetch(`${umamiConfig.baseUrl}/api/share/${umamiConfig.shareId}`);
            if (!shareResponse.ok) {
                throw new Error('获取分享信息失败');
            }
            const shareData = await shareResponse.json();
            const { websiteId, token } = shareData;

            // 第二步：获取统计数据
            const currentTimestamp = Date.now();
            const statsUrl = `${umamiConfig.baseUrl}/api/websites/${websiteId}/stats?startAt=0&endAt=${currentTimestamp}&unit=hour&timezone=${encodeURIComponent(umamiConfig.timezone)}&url=%2Fposts%2F${slug}%2F&compare=false`;

            const statsResponse = await fetch(statsUrl, {
                headers: {
                    'x-umami-share-token': token
                }
            });

            if (!statsResponse.ok) {
                throw new Error('获取统计数据失败');
            }

            const statsData = await statsResponse.json();
            const pageViews = statsData.pageviews?.value || 0;
            const visits = statsData.visits?.value || 0;

            const displayElement = document.getElementById(`page-views-${slug}`);
            if (displayElement) {
                displayElement.textContent = `浏览量 ${pageViews} · 访问数 ${visits}`;
            }
        } catch (error) {
            console.error('Error fetching page views for', slug, ':', error);
            const displayElement = document.getElementById(`page-views-${slug}`);
            if (displayElement) {
                displayElement.textContent = '统计不可用';
            }
        }
    }

    // 页面加载完成后获取统计数据
    function initPostCardStats() {
        const slug = entry.slug;
        if (slug) {
            fetchPostCardViews(slug);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPostCardStats);
    } else {
        initPostCardStats();
    }
})();