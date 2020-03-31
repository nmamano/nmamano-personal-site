$(document).ready(function() {

$('#frmFile').on('load', function(){

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

  var oFrame = document.getElementById("frmFile");
  var text = oFrame.contentWindow.document.body.childNodes[0].innerText;
  if (text == "") {
    console.log("failed to load markdown from iframe");
    document.getElementById('mdToHtml').innerHTML = "Blog post did not load correctly. Try reloading the page.";
  } else {
    document.getElementById('mdToHtml').innerHTML = converter.makeHtml(text);
  }

});

});