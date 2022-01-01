chrome.runtime.onMessage.addListener (
  (request, sender, sendResponse) => {
    // only handle message from self
    if (sender.id === chrome.runtime.id) {
        chrome.cookies.getAll({domain: ".leetcode.com", name: request["name"]}, (result) => sendResponse(result[0]["value"]));

        // keep sendResponse channel open
        return true;
    }
  }
);