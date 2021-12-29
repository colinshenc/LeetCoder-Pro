//Gets an array of problems and numbers from current page.
var problems_on_page = Array.from(document.querySelectorAll(".h-5"))
  .filter((node) => node.innerHTML.match("\\d\\.( \\w*)+"))
  .map((node) => node.innerHTML);
