let isPopupOpen = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openPopup") {
        chrome.action.openPopup();
        isPopupOpen = true;
        notifyPopupState();
    }
    else if (request.action === "checkPopupState") {
        sendResponse({ isOpen: isPopupOpen });
    }
    return true;
});

// Listen for popup window close
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        port.onDisconnect.addListener(() => {
            isPopupOpen = false;
            notifyPopupState();
        });
    }
});

function notifyPopupState() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "popupStateChange",
                isOpen: isPopupOpen
            });
        }
    });
}