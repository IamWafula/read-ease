document.getElementById('highlight').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log(tabs, tabs[0], tabs[0].id)
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "highlightWords",
            words: ["test", "the", "and"] // Example test words
        });
    });
});