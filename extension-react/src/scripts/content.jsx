
// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API

function getWikipediaText() {
    const text = document.getElementById("bodyContent").innerText;
    return text;
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



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightWords") {
        // TODO: Implement this function
        const color = request.color;
        const opacity = request.opacity;

        var currentUrl = window.location.href;
        var mainText = null;

        async function getKeywords(){

            if (currentUrl.includes("wikipedia.org")) {
                // run the wikipedia script
                mainText = getWikipediaText();                            
            }

            const response = await fetch('http://127.0.0.1:5000/process-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"text": mainText})
            });
            const data = await response.json();

            if (data.keywords.length > 0) {
                highlightWords(data.keywords);
            }

            console.log(data);            
        }


        getKeywords(mainText);
                
        sendResponse({ status: "highlighted" });
    }
});