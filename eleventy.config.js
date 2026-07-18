import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPassthroughCopy("favicon.svg");

  // Reading time from the rendered post body. ~220 wpm, technical prose, min 1.
  // Strip <style>/<script> bodies first, else per-post CSS is counted as words.
  eleventyConfig.addFilter("readingTime", (html) => {
    const text = String(html)
      .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ");
    const words = text.match(/\S+/g)?.length || 0;
    return `${Math.max(1, Math.round(words / 220))} min read`;
  });

  // Date object (or ISO string) -> "YYYY-MM-DD", UTC so it never drifts a day.
  eleventyConfig.addFilter("ymd", (d) => new Date(d).toISOString().slice(0, 10));

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("posts/*.{md,html}").sort((a, b) => b.date - a.date)
  );
  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
