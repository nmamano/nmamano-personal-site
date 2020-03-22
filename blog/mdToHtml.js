document.getElementById('frmFile').onload = function() {
  wait(300);
  LoadFile();
};

function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}

function LoadFile() {
  // taken from: https://github.com/showdownjs/showdown/issues/577#issuecomment-417181311 
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

  var oFrame = document.getElementById("frmFile");
  var text = oFrame.contentWindow.document.body.childNodes[0].innerText;
  var target = document.getElementById('mdToHtml');
  var converter = new showdown.Converter({
    extensions: ['highlight']
  });
  converter.setOption('parseImgDimensions', true);
  converter.setOption('simplifiedAutoLink', true);
  converter.setOption('ghCodeBlocks', true);
  // converter.setOption('smoothLivePreview', true);
  converter.setFlavor('github');
  target.innerHTML = converter.makeHtml(text);
}