import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("posts/*.{md,html}").sort((a, b) => b.date - a.date)
  );
  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
