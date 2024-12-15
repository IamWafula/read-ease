
// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API

console.log('Content script loaded.');

const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);

function getWikipediaText() {
    const text = document.getElementById("bodyContent").innerText;
    console.log('in getWikipediaText', text);
    return text;
}

// function for highlights
function updateHighlightStyle(color, opacity) {
    const rgbaColor = hexToRgba(color, opacity);
    return `
        .read-ease-highlight {
            background-color: ${rgbaColor} !important;
            // opacity: ${opacity} !important;
            border-radius: 2px;
        }
    `;
}

function applyHighlightStyles(color, opacity) {
    console.log('Updating highlight styles...');
    const rgbaColor = hexToRgba(color, opacity);
    const styleContent = `
        .read-ease-highlight {
            background-color: ${rgbaColor} !important; /* Opacity only applies to the background */
            // opacity: inherit !important; /* Preserve original text color */
        }
    `;
    styleSheet.textContent = styleContent;
    console.log(`Highlight styles updated to color: ${color}, opacity: ${opacity}`);
}

function hexToRgba(hex, opacity) {
    // Remove '#' if present
    hex = hex.replace('#', '');
    // Handle shorthand hex codes (e.g., '#abc')
    if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
    }
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
}

function highlightWords(phrases) {
    console.log('Starting highlightWords with phrases:', phrases);
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED'];
    
    // Sort phrases by length to avoid overlapping matches
    phrases.sort((a, b) => b.length - a.length);
    console.log('Sorted phrases:', phrases);

    // Escape special characters in phrases
    phrases = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Add negative lookbehind and negative lookahead to each phrase
    phrases = phrases.map(phrase => `(?<!\\w)${phrase}(?!\\w)`);
    console.log('Processed phrases:', phrases);

    // Combine phrases into a single regex pattern
    const regex = new RegExp(phrases.join('|'), 'gi');
    console.log('Created regex:', regex);

    // Collect all text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
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

    while (node = walker.nextNode()) {
        offsets.push(textContent.length);
        textContent += node.textContent;
        nodes.push(node);
    }

    //console.log('Collected text content:', textContent.substring(0, 100) + '...');
    //console.log('Number of text nodes found:', nodes.length);

    let match;
    let matches = [];

    while ((match = regex.exec(textContent)) !== null) {
        matches.push({
            start: match.index,
            end: regex.lastIndex,
            match: match[0]
        });
    }

    //console.log('Found matches:', matches);

    // Handle overlapping matches
    matches = matches.filter((match, index) => {
        if (index === 0) return true;
        const prevMatch = matches[index - 1];
        return match.start >= prevMatch.end;
    });

    //console.log('After filtering overlaps:', matches);

    // Apply highlights to matches
    for (let i = matches.length - 1; i >= 0; i--) {
        let match = matches[i];
        console.log('Processing match:', match);

        try {
            // Find starting node
            let startNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= match.start && (offsets[idx + 1] > match.start || idx === offsets.length - 1)
            );
            let startNode = nodes[startNodeIndex];
            let startOffset = match.start - offsets[startNodeIndex];

            console.log('Start node found:', {
                index: startNodeIndex,
                offset: startOffset,
                text: startNode.textContent
            });

            // Find ending node
            let endNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= match.end && (offsets[idx + 1] > match.end || idx === offsets.length - 1)
            );
            let endNode = nodes[endNodeIndex];
            let endOffset = match.end - offsets[endNodeIndex];

            console.log('End node found:', {
                index: endNodeIndex,
                offset: endOffset,
                text: endNode.textContent
            });

            let range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);

            let highlightSpan = document.createElement('span');
            highlightSpan.className = 'read-ease-highlight';
            
            try {
                range.surroundContents(highlightSpan);
                console.log('Successfully highlighted:', match.match);
            } catch (e) {
                console.log('surroundContents failed, trying alternative method:', e);
                const fragment = range.extractContents();
                highlightSpan.appendChild(fragment);
                range.insertNode(highlightSpan);
                console.log('Alternative highlight method completed');
            }

        } catch (e) {
            console.error('Failed to highlight match:', match.match, e);
            continue;
        }
    }
    
    console.log('Highlighting process completed');
}


// Listener to trigger the highlight function when the popup sends a message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightWords") {
        // TODO: Implement this function
        const color = request.color || 'yellow';  // Default to yellow if no color provided
        const opacity = request.opacity || 1;
        styleSheet.textContent = updateHighlightStyle(color, opacity);  // Update global style

        const currentUrl = window.location.href;
        let mainText = null;

        (async function getKeywords() {

            if (currentUrl.includes("wikipedia.org")) {
                // Get text from Wikipedia page
                mainText = getWikipediaText();
            } else {
                // For other pages, implement your own text extraction
                mainText = document.body.innerText;
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
                console.log('Starting highlighting process...');
                const startTime = performance.now();
                highlightWords(data.sentences);
                const endTime = performance.now();
                console.log(`Highlighting completed in ${(endTime - startTime).toFixed(2)}ms`);
                sendResponse({ status: "highlighted" });
            }

            console.log(data);            
        })();

        return true;

    } else if (request.action === "applyHighlightStyles") {
        const color = request.color || 'yellow';  // Default to yellow if no color provided
        const opacity = request.opacity || 1;

        // Update global style to change the highlight color and opacity
        styleSheet.textContent = updateHighlightStyle(color, opacity);

        console.log('Highlight styles updated.');
        sendResponse({ status: "styles_updated" });

        // No need to keep the listener alive for asynchronous response
        return false;
    }
});