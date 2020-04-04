var showdown = require('showdown');
var hljs = require('highlight.js');

//extension source: https://github.com/showdownjs/showdown/issues/577#issuecomment-417181311 
showdown.extension('highlight', function () {
return [{
    type: "output",
    filter: function (text, converter, options) {
        var left = "<pre><code\\b[^>]*>",
            right = "</code></pre>",
            flags = "g";
        var replacement = function (wholeMatch, match, left, right) {
            var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
            left = left.slice(0, 18) + 'hljs ' + left.slice(18);
            match = match
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            if (lang && hljs.getLanguage(lang)) {
                return left + hljs.highlight(lang, match).value + right;
            } else {
                return left + hljs.highlightAuto(match).value + right;
            }
        };
        return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
}];
});

var converter = new showdown.Converter({
extensions: ['highlight']
});
converter.setOption('parseImgDimensions', true);
converter.setOption('simplifiedAutoLink', true);
converter.setOption('ghCodeBlocks', true);
// converter.setOption('smoothLivePreview', true);
converter.setFlavor('github');

var fs = require('fs');
var markdownFilePath = process.argv[2];
var outputFile = process.argv[3];
fs.readFile( markdownFilePath, 'utf8', function(err, text) {
    if (err) throw err;
    var genHTML = converter.makeHtml(text);
    fs.writeFile(outputFile, genHTML, (err) => {
        if (err) throw err;
        console.log('The generated html has been saved');
      });
});

/* usage: node index.js markdown_input_file html_output_file */