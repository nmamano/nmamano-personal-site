const showdown = require("showdown");
const hljs = require("highlight.js");
const fs = require("fs");
const path = require("path");

// Extension source: https://github.com/showdownjs/showdown/issues/577#issuecomment-417181311
showdown.extension("highlight", () => [
  {
    type: "output",
    filter: (text) => {
      const left = "<pre><code\\b[^>]*>";
      const right = "</code></pre>";
      const flags = "g";

      const replacement = (wholeMatch, match, left, right) => {
        const lang = (left.match(/class="([^ "]*)/) || [])[1];
        left = left.slice(0, 18) + "hljs " + left.slice(18);
        match = match
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");

        if (lang && hljs.getLanguage(lang)) {
          return left + hljs.highlight(lang, match).value + right;
        } else {
          return left + hljs.highlightAuto(match).value + right;
        }
      };

      return showdown.helper.replaceRecursiveRegExp(
        text,
        replacement,
        left,
        right,
        flags
      );
    },
  },
]);

// Custom extension to fix image URLs by adding the input directory path
showdown.extension("fixImagePaths", function () {
  return [
    {
      type: "output",
      filter: function (text) {
        return text.replace(/<img src="([^"]+)"/g, (match, url) => {
          if (
            !url.startsWith("http") &&
            !url.startsWith("/") &&
            !url.startsWith(inputDir)
          ) {
            return `<img src="${path.basename(inputDir)}/${url}"`;
          }
          return match;
        });
      },
    },
  ];
});

const converter = new showdown.Converter({
  extensions: ["highlight", "fixImagePaths"],
  parseImgDimensions: true,
  simplifiedAutoLink: true,
  ghCodeBlocks: true,
});
converter.setFlavor("github");

const markdownFilePath = process.argv[2];
const outputFile = path.join(
  path.dirname(path.dirname(markdownFilePath)),
  `${path.basename(markdownFilePath, ".md")}.html`
);
const outputDir = path.dirname(outputFile);
const inputDir = path.dirname(markdownFilePath);

fs.readFile(markdownFilePath, "utf8", (err, text) => {
  if (err) throw err;

  let firstLine = text.split("\n")[0].replace(/^#\s*/, "");
  const url = `https://nilmamano.com/blog/${outputDir}.html`;
  const thumbnailUrl = `https://nilmamano.com/blog/${inputDir}/thumbnail.png`;

  const prefix = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Nil Mamano | Blog</title>
  <meta name="person" content="Nil Mamano">
  <meta name="sortname" content="Mamano, Nil">
  <meta name="keywords" content="personal site,computer science,blog">
  <meta name="description" content="${firstLine}">

  <meta property="og:title" content="Nil Mamano | Blog" />
  <meta property="og:description" content="${firstLine}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${thumbnailUrl}" />

  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
  <link href="../css/style.css" rel="stylesheet">
  <link rel="stylesheet" href="css/default.min.css">

</head>

<body class="blogpostpage">
  <main class="blogpost">
    <div class="blogreturn">
      <p>Return to the <a href="../blog.html">blog's main page</a>.</p>
    </div>
    
    <div id="mdToHtml">
`;

  const suffix = `    </div>

    <div class="blogreturn">
      <p>Return to the <a href="../blog.html">blog's main page</a>.</p>
    </div>
  </main>

</body>
`;

  const genHTML = converter.makeHtml(text);
  fs.writeFile(outputFile, `${prefix}${genHTML}${suffix}`, (err) => {
    if (err) throw err;
    console.log("The generated HTML has been saved as " + outputFile);
  });
});

/* Usage: node index.js markdown_file
   The result will be in the same folder with the same name but with a .html extension
   Assumes there is a 
*/
