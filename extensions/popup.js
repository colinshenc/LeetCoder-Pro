var storageAPI = chrome.storage.sync;
if(navigator.userAgent.match(/chrome|chromium|crios/i)) {
  storageAPI = chrome.storage.sync;
} else if (navigator.userAgent.match(/firefox|fxios/i)) {
  storageAPI = browser.storage.local;
}

// Initialize button to based on storage value
storageAPI.get('buttonState', function (data) {
  let button = document.getElementById("switch");
  console.log('buttonState', data);
  if (data['buttonState'] == 1) {
    button.innerHTML = "ON";
  }
  else {
    button.innerHTML = "OFF";
  }
})

// Add listener for button
document.addEventListener('DOMContentLoaded', function () {
  let button = document.getElementById("switch");
  var isExtensionOn = 0;
  var obj = {}
  button.addEventListener("click", function () {
    if (button.innerHTML == "ON") {
      button.innerHTML = "OFF";
      isExtensionOn = 0;
    }
    else {
      button.innerHTML = "ON";
      isExtensionOn = 1;
    }
    storageAPI.set({ 'buttonState': isExtensionOn }, function () {
      console.log('Status saved');
    })
    chrome.tabs.query({url: "*://*.leetcode.com/*" }, function (tab) {
      // If the page is not opened
      console.log(tab);
      if (tab[0] == null) {
        console.log("Not found in opened tabs");
      }
      else {
        console.log("Page reloaded");
        for (var i = 0; i < tab.length;i++) {
          chrome.tabs.reload(tab[i].id);
        }
      }
    })
  });
})
