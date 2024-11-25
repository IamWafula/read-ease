
// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API

const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);

function getWikipediaText() {
    const text = document.getElementById("bodyContent").innerText;
    return text;
}


// function for highlights
function updateHighlightStyle(color) {
    return `
        .read-ease-highlight {
            background-color: ${color};
            border-radius: 2px;
        }
    `;
}


function highlightWords(phrases) {
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED'];
    
    // Sort phrases by length to avoid overlapping matches
    phrases.sort((a, b) => b.length - a.length);

    // Escape special characters in phrases
    phrases = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Add negative lookbehind and negative lookahead to each phrase
    phrases = phrases.map(phrase => `(?<!\\w)${phrase}(?!\\w)`);

    // Combine phrases into a single regex pattern
    const regex = new RegExp(phrases.join('|'), 'gi');

    // Collect all text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip empty nodes and unwanted parents
                if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                if (node.parentElement && skipTags.includes(node.parentElement.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node;
    let nodes = [];
    let textContent = '';
    let offsets = [];

    // Build a combined text and map of nodes
    while (node = walker.nextNode()) {
        offsets.push(textContent.length);
        textContent += node.textContent;
        nodes.push(node);
    }

    // Collect matches, handling overlaps
    let match;
    let matches = [];

    while ((match = regex.exec(textContent)) !== null) {
        matches.push({
            start: match.index,
            end: regex.lastIndex,
            match: match[0]
        });
    }

    // Handle overlapping matches
    matches = matches.filter((match, index) => {
        if (index === 0) return true;
        const prevMatch = matches[index - 1];
        return match.start >= prevMatch.end;
    });

    // Apply highlights to matches
    for (let i = 0; i < matches.length; i++) {
        let match = matches[i];
        let startIndex = match.start;
        let endIndex = match.end;

        // Find starting node
        let startNodeIndex = offsets.findIndex((offset, idx) =>
            offset <= startIndex && (offsets[idx + 1] > startIndex || idx === offsets.length - 1)
        );
        let startNode = nodes[startNodeIndex];
        let startOffset = startIndex - offsets[startNodeIndex];

        // Find ending node
        let endNodeIndex = offsets.findIndex((offset, idx) =>
            offset <= endIndex && (offsets[idx + 1] > endIndex || idx === offsets.length - 1)
        );
        let endNode = nodes[endNodeIndex];
        let endOffset = endIndex - offsets[endNodeIndex];

        // Create range and apply highlight
        let range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        let highlightSpan = document.createElement('span');
        highlightSpan.className = 'read-ease-highlight';
        range.surroundContents(highlightSpan);
    }
}

// Listener to trigger the highlight function when the popup sends a message
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
    return true;
});