import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.acmsz.top/",
    title: "CMSZ's Blog",
    description: "CMSZ 的个人博客，分享技术心得、开发经验与生活记录。",
    author: "CMSZ",
    profile: undefined,
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/CMSZ001/Blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/CMSZ0001/", linkTitle: "Github" },
    { name: "ifdian", url: "https://www.ifdian.net/a/acmsz", linkTitle: "爱发电" },
    // { name: "x",        url: "https://x.com/username" },
    // { name: "linkedin", url: "https://www.linkedin.com/in/username/" },
    { name: "mail", url: "mailto:me@acmsz.top", linkTitle: "邮箱" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
  license: {
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    name: "CC BY-NC-SA 4.0",
  },
  comments: {
    enable: true,
    provider: "artalk",
    artalk: {
      server: "https://artalk.acmsz.top",
      site: "CMSZ's Blog",
      gravatar: {
        mirror: 'https://weavatar.com/avatar/',
        params: 'sha256=1&d=mp&s=40&d=retro',
      }
    },
  }
});