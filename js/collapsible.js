
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      this.style.boxShadow = "none";
      this.style.border= "none";
    } else {
      content.style.display = "block";
      this.style.boxShadow = "0px 10px 5px #aaaaaa";
      this.style.border=""
      this.style.borderTop="1px solid black";
      this.style.borderBottom="1px solid black";
    }
  });
}
