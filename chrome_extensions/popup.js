// Initialize button to based on storage value
chrome.storage.sync.get('buttonState', function (data) {
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
document.addEventListener('DOMContentLoaded', function() {
  let button = document.getElementById("switch");
  var isExtensionOn = 0;
  var obj = {}
  button.addEventListener("click", function() {
    if (button.innerHTML == "ON") {
      button.innerHTML = "OFF";
      isExtensionOn = 0;
    }
    else {
      button.innerHTML = "ON";
      isExtensionOn = 1;
    }
    chrome.storage.sync.set({'buttonState': isExtensionOn}, function() {
      console.log('Status saved');
    })
  
  });
})

