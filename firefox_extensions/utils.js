browser.storage.local.set({"buttonState": 0}, function() {
  console.log('Status saved');
})

browser.runtime.onMessage.addListener (
  (request, sender, sendResponse) => {
    // only handle message from self
    if (sender.id === browser.runtime.id) {
        browser.cookies.getAll({domain: ".leetcode.com", name: request["name"]}, (result) => sendResponse(result[0]["value"]));

        // keep sendResponse channel open
        return true;
    }
  }
);
