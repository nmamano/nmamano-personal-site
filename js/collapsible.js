
var coll = document.getElementsByClassName("data");

for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.parentElement.classList.toggle("active");
    var content = this.parentElement.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      this.parentElement.style.boxShadow = "none";
      this.parentElement.style.border= "none";
    } else {
      content.style.display = "block";
      this.parentElement.style.boxShadow = "0px 10px 5px #aaaaaa";
      this.parentElement.style.borderTop="1px solid black";
      this.parentElement.style.borderBottom="1px solid black";
    }
  });
}
