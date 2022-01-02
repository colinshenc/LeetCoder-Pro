// Reference: https://stackoverflow.com/a/8578840/11954837
// Need to start Live Server from VSC
var inject = function (d, url) {
  script = d.createElement("script");
  script.type = "module";
  script.async = true;
  script.onload = function () {
    // remote script has loaded
  };
  script.src = url;
  d.getElementsByTagName("head")[0].appendChild(script);
};

inject(document, "http://127.0.0.1:5500/manipulate_page.js");
inject(document, "http://127.0.0.1:5500/parse_ts.js");
