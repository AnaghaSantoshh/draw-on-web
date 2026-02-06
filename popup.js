function sendMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

document.getElementById("draw").onclick = () => {
  sendMessage({ action: "enable" });
  sendMessage({ action: "mode", value: "draw" });
};

document.getElementById("highlight").onclick = () => {
  sendMessage({ action: "enable" });
  sendMessage({ action: "mode", value: "highlight" });
};

document.getElementById("clear").onclick = () => {
  sendMessage({ action: "clear" });
};

document.getElementById("disable").onclick = () => {
  sendMessage({ action: "disable" });
};
