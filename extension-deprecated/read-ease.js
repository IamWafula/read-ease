// read-ease.js
// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API


function getWikipediaText() {
    const text = document.getElementById("bodyContent").innerText;
    return text;
}

window.onload = () => {

    // get current URL
    var currentUrl = window.location.href;
    var mainText = null;

    // check if URL is wikipedia
    // TODO: Regex would be better for URL matching
    if (currentUrl.includes("wikipedia.org")) {
        // run the wikipedia script
        mainText = getWikipediaText();
    }

    console.log(mainText);
    // TODO: send the text to the background script OR Backend
}

// CSS for highlights
const highlightStyle = `
  .read-ease-highlight {
    background-color: yellow;
    border-radius: 2px;
  }
`;

// Add styles to page
const styleSheet = document.createElement("style");
styleSheet.textContent = highlightStyle;
document.head.appendChild(styleSheet);

function highlightWords(words) {
    // Select main content area, for wikipedia it is .mw-body-content
    const contentArea = document.querySelector('.mw-body-content');
    console.log('Starting node:', contentArea);

    // Use recursive approach to check all text nodes in main content area
    function processTextNodes(element) {
        if (!element) return;

        // Handle text nodes
        if (element.nodeType === Node.TEXT_NODE) {
            let text = element.textContent.trim();
            if (!text) return;

            //console.log('Processing text node:', text.slice(0, 50));
            let highlighted = false;

            words.forEach(word => {
                // Some regex Claude spewed out, it works 👍🏼
                const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                if (regex.test(text)) {
                    highlighted = true;
                    text = text.replace(regex, '<span class="read-ease-highlight">$1</span>');
                }
            });

            // If any of the words were highlighted, replace them in the main page
            if (highlighted) {
                const span = document.createElement('span');
                span.innerHTML = text;
                element.parentNode.replaceChild(span, element);
            }
            return;
        }

        // Skip unwanted elements
        const unwantedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT'];
        if (unwantedTags.includes(element.tagName)) return;

        // Process children
        Array.from(element.childNodes).forEach(child => {
            processTextNodes(child);
        });
    }

    processTextNodes(contentArea);
}

// Listener to trigger the highlight function when the popup sends a message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightWords") {
        const testWords = ['the', 'and', 'test', 'Main'];
        highlightWords(testWords);
        sendResponse({ status: "highlighted" });
    }
});
