// .eleventy.js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");  
  eleventyConfig.addPassthroughCopy("src/css");

  eleventyConfig.setTemplateFormats(["md", "njk"]);

  // Add a collection to include all pages
  eleventyConfig.addCollection("pages", function(collection) {
  return collection.getFilteredByGlob("src/pages/*.md");
    });

  
  return {
      markdownTemplateEngine: 'njk',
      dataTemplateEngine: 'njk',
      htmlTemplateEngine: 'njk',

      dir: {
        input: "src",
        includes: "_includes",
        data: "_data",
        output: "_site"
      }
    };

  };
  