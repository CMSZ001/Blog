import { getContainerRenderer } from "@astrojs/mdx/container-renderer";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getCollection, render } from "astro:content";
import { transform, walk } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import config from "@/config";

export async function GET(context: APIContext) {
  const baseUrl = (context.site?.href ?? config.site.url).replace(/\/$/, "");

  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);

  const items = [];
  for (const post of sortedPosts) {
    const { Content } = await render(post);

    const rawContent = await container.renderToString(Content);

    const content = await transform(rawContent.replace(/^<!DOCTYPE html>/, ""), [
      async (node) => {
        await walk(node, (node) => {
          if (node.name === "a" && node.attributes.href?.startsWith("/")) {
            node.attributes.href = baseUrl + node.attributes.href;
          }
          if (node.name === "img" && node.attributes.src?.startsWith("/")) {
            node.attributes.src = baseUrl + node.attributes.src;
          }
          // Astro 容器渲染可能生成空的 srcset，RSS 阅读器用不到，直接清除
          if (node.attributes?.srcset === "") {
            delete node.attributes.srcset;
          }
        });
        return node;
      },
      sanitize({ dropElements: ["script", "style"] }),
    ]);

    items.push({
      link: getPostUrl(post.id, post.filePath, config.site.lang),
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.pubDatetime),
      categories: post.data.tags,
      content,
    });
  }

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: baseUrl,
    stylesheet: "/assets/rss/pretty-feed-v3.xsl",
    items,
    customData: `<language>${config.site.lang}</language>`,
  });
}
