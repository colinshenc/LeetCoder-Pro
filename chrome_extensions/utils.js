// wrapper to get cookie value
// async function getCookieValue(cookieName) {
//     return new Promise((resolve, reject) => {
//         chrome.cookies.getAll({domain: ".leetcode.com", name: cookieName}, (value) => window.alert(value[0]["value"]));
//     })
// }

chrome.runtime.onMessage.addListener (
  (request, sender, sendResponse) => {
    // only handle message from self
    if (sender.id === chrome.runtime.id) {
        // console.log("received message");
        // console.log(request["name"]);
        chrome.cookies.getAll({domain: ".leetcode.com", name: request["name"]}, (result) => sendResponse(result[0]["value"]));

        // keep sendResponse channel open
        return true;
    }
  }
);