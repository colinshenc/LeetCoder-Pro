var storageAPI = chrome.storage.sync;
if (navigator.userAgent.match(/chrome|chromium|crios/i)) {
  storageAPI = chrome.storage.sync;
} else if (navigator.userAgent.match(/firefox|fxios/i)) {
  storageAPI = browser.storage.local;
}

chrome.runtime.onInstalled.addListener(() => {
  storageAPI.set({ buttonState: 1 }, function () {
    //console.log("Status saved");
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // only handle message from self
  if (sender.id === chrome.runtime.id) {
    // console.log("received message");
    // console.log(request["name"]);
    chrome.cookies.getAll(
      { domain: ".leetcode.com", name: request["name"] },
      (result) => {
        if (result.length == 0) {
          sendResponse(null);
        } else {
          sendResponse(result[0]["value"]);
        }
      }
    );
    // keep sendResponse channel open
    return true;
  }
});
