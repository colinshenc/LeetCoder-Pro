// // Initialize button to based on storage value
browser.storage.local.get("buttonState", function (data) {
  let button = document.getElementById("switch");
  console.log("buttonState", data);
  if (data["buttonState"] == 1) {
    button.innerHTML = "ON";
  } else {
    button.innerHTML = "OFF";
  }
});

// Add listener for button
document.addEventListener("DOMContentLoaded", function () {
  let button = document.getElementById("switch");
  var isExtensionOn = 0;
  var obj = {};
  button.addEventListener("click", function () {
    if (button.innerHTML == "ON") {
      button.innerHTML = "OFF";
      isExtensionOn = 0;
    } else {
      button.innerHTML = "ON";
      isExtensionOn = 1;
    }
    browser.storage.local.set({ buttonState: isExtensionOn }, function () {
      console.log("Status saved");
    });

    browser.tabs.query({ url: "*://*.leetcode.com/*" }, function (tab) {
      // If the page is not opened
      console.log(tab);
      if (tab[0] == null) {
        console.log("Not found in opened tabs");
      } else {
        console.log("Page reloaded");
        for (var i = 0; i < tab.length; i++) {
          browser.tabs.reload(tab[i].id);
        }
      }
    });
  });
});
