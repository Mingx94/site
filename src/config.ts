export default {
  site: {
    title: "Vartifact | 部落格",
    base_url: import.meta.env.DEV
      ? "http://localhost:4321"
      : "https://vartifact.cc",
    favicon: "/favicon.svg",
    favicon_dark: "/favicon-dark.svg",
  },

  settings: {
    pagination: 5,
    summary_length: 100,
    num_posts_on_homepage: 3,
  },

  metadata: {
    meta_author: "Michael Tsai",
    meta_description: "分享技術及生活",
  },

  params: {
    copyright: "© 2025–2026 Michael Tsai",
  },

  social: {
    facebook: "",
    twitter: "https://x.com/mingx94",
    instagram: "",
    youtube: "",
    linkedin: "https://www.linkedin.com/in/ming-hsuan-tsai94/",
    mastodon: "",
    github: "https://github.com/Mingx94",
    codepen: "",
    reddit: "",
    rss: "/rss.xml",
    email: "",
    bluesky: "https://bsky.app/profile/vartifact.cc",
    threads: "",
  },
};
