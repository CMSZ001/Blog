<?xml version="1.0" encoding="utf-8"?>
<!--
  RSS 订阅源预览样式表（pretty-feed-v3 定制版）

  基于 aboutfeeds/pretty-feed-v3.xsl 定制：
  - 配色对齐博客主题 src/styles/theme.css（含 prefers-color-scheme 暗色适配）
  - 字体栈对齐博客的 font-app

  原项目: https://github.com/genmon/aboutfeeds
  由 src/pages/rss.xml.ts 在 RSS XML 顶部引用：
    <?xml-stylesheet href="/assets/rss/pretty-feed-v3.xsl" type="text/xsl"?>
-->
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> RSS 订阅源</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          :root {
            --bg: #fdfdfd;
            --fg: #282728;
            --accent: #006cac;
            --muted-fg: #6b7280;
            --border: #ece9e9;
            --banner-bg: #fff6d6;
            --banner-fg: #9a6700;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #2f3741;
              --fg: #e6e6e6;
              --accent: #1ad9d9;
              --muted-fg: #8faabb;
              --border: #3b4655;
              --banner-bg: #4a3b22;
              --banner-fg: #d29922;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              "PingFang SC", HarmonyOS_Regular, "Hiragino Sans GB",
              "Microsoft YaHei", "Helvetica Neue", Helvetica,
              "Source Han Sans SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei",
              Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: var(--fg);
            background: var(--bg);
          }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .wrap { max-width: 46rem; margin: 0 auto; padding: 1.25rem 1rem; }
          .banner {
            margin: 0 0 1.5rem;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: var(--banner-fg);
            background: var(--banner-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
          }
          .banner a { color: inherit; text-decoration: underline; }
          .rss-header { padding: 2rem 0 1.25rem; }
          .rss-header h1 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0 0 0.75rem;
            padding-bottom: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            border-bottom: 1px solid var(--border);
          }
          .rss-header .feed-title {
            margin: 0 0 0.25rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
          .rss-header p { margin: 0 0 1rem; color: var(--muted-fg); }
          .head_link { font-weight: 500; }
          .rss-list { margin-top: 1.5rem; }
          .rss-list h2 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 700; }
          .rss-item { padding-bottom: 1.5rem; }
          .rss-item h3 { margin: 0 0 0.25rem; font-size: 1.125rem; font-weight: 600; }
          .rss-item h3 a { color: var(--fg); }
          .rss-item h3 a:hover { color: var(--accent); }
          .rss-item time { color: var(--muted-fg); font-size: 0.875rem; }
        </style>
      </head>
      <body>
        <nav class="wrap">
          <p class="banner">
            <strong>这是一个 Web Feed（RSS 源）。</strong>将地址栏中的 URL 复制到你的阅读器中即可<strong>订阅</strong>。访问
            <a href="https://aboutfeeds.com">About Feeds</a> 了解如何开始使用阅读器和订阅，完全免费。
          </p>
        </nav>
        <div class="wrap">
          <header class="rss-header">
            <h1>
              <!-- https://commons.wikimedia.org/wiki/File:Feed-icon.svg -->
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="width:1.2em;height:1.2em;vertical-align:text-bottom" id="RSSicon" viewBox="0 0 256 256" aria-hidden="true">
                <defs>
                  <linearGradient x1="0.085" y1="0.085" x2="0.915" y2="0.915" id="RSSg">
                    <stop offset="0.0" stop-color="#E3702D"/><stop offset="0.1071" stop-color="#EA7D31"/>
                    <stop offset="0.3503" stop-color="#F69537"/><stop offset="0.5" stop-color="#FB9E3A"/>
                    <stop offset="0.7016" stop-color="#EA7C31"/><stop offset="0.8866" stop-color="#DE642B"/>
                    <stop offset="1.0" stop-color="#D95B29"/>
                  </linearGradient>
                </defs>
                <rect width="256" height="256" rx="55" ry="55" x="0" y="0" fill="#CC5D15"/>
                <rect width="246" height="246" rx="50" ry="50" x="5" y="5" fill="#F49C52"/>
                <rect width="236" height="236" rx="47" ry="47" x="10" y="10" fill="url(#RSSg)"/>
                <circle cx="68" cy="189" r="24" fill="#FFF"/>
                <path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="#FFF"/>
                <path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="#FFF"/>
              </svg>
              Web Feed 预览
            </h1>
            <p class="feed-title"><xsl:value-of select="/rss/channel/title"/></p>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <a class="head_link" target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              访问网站 &#x2192;
            </a>
          </header>
          <div class="rss-list">
            <h2>最近更新</h2>
            <xsl:for-each select="/rss/channel/item">
              <div class="rss-item">
                <h3>
                  <a target="_blank">
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <time>发布于：<xsl:value-of select="pubDate"/></time>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
