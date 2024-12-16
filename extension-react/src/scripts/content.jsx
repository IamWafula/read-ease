
// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API

console.log('Content script loaded.');

const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);


// Function for highlights and bolding
function updateHighlightStyle(color, opacity) {
    const rgbaColor = hexToRgba(color, opacity);
    return `
        .read-ease-highlight {
            background-color: ${rgbaColor} !important;
            // opacity: ${opacity} !important;
            border-radius: 2px;
        }
        .read-ease-bold {
            font-weight: bold;
        }
    `;
}


function hexToRgba(hex, opacity = 1) {
    // Ensure opacity is a number between 0 and 1
    opacity = Math.min(Math.max(parseFloat(opacity) || 1, 0), 1);
    
    // Remove '#' if present
    hex = hex.replace('#', '');
    
    // Handle shorthand hex codes (e.g., '#abc')
    if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
    }
    
    // Validate hex color
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        console.warn('Invalid hex color, defaulting to yellow');
        hex = 'FFFF00';
    }
    
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
}

function retrieveText() {
    console.log('Retrieving text from the page');
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED'];

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

    while ((node = walker.nextNode())) {
        offsets.push(textContent.length);
        textContent += node.textContent;
        nodes.push(node);
    }

    return { textContent, nodes, offsets };
}

function highlightInPlace(phrases, nodes, offsets, textContent) {
    //console.log('Starting highlightInPlace with phrases:', phrases);

    // Sort phrases by length to avoid overlapping matches
    phrases.sort((a, b) => b.length - a.length);
    //console.log('Sorted phrases:', phrases);

    // Escape special characters in phrases
    phrases = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Add negative lookbehind and negative lookahead to each phrase
    phrases = phrases.map(phrase => `(?<!\\w)${phrase}(?!\\w)`);
    //console.log('Processed phrases:', phrases);

    // Combine phrases into a single regex pattern
    const regex = new RegExp(phrases.join('|'), 'gi');
    //console.log('Created regex:', regex);

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

            // Find ending node
            let endNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= match.end && (offsets[idx + 1] > match.end || idx === offsets.length - 1)
            );
            let endNode = nodes[endNodeIndex];
            let endOffset = match.end - offsets[endNodeIndex];

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

function boldKeywords(keywords, nodes, offsets, textContent) {
    console.log('Starting boldKeywords with keywords:', keywords);

    // Escape special characters in keywords
    keywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Combine keywords into a single regex pattern
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');

    let match;
    let matches = [];

    while ((match = regex.exec(textContent)) !== null) {
        matches.push({
            start: match.index,
            end: regex.lastIndex,
            match: match[0]
        });
    }

    // Apply bold styling to matches (process in reverse order)
    for (let i = matches.length - 1; i >= 0; i--) {
        let match = matches[i];

        try {
            // Find starting node
            let startNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= match.start && (offsets[idx + 1] > match.start || idx === offsets.length - 1)
            );
            let startNode = nodes[startNodeIndex];
            let startOffset = match.start - offsets[startNodeIndex];

            // Find ending node
            let endNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= match.end && (offsets[idx + 1] > match.end || idx === offsets.length - 1)
            );
            let endNode = nodes[endNodeIndex];
            let endOffset = match.end - offsets[endNodeIndex];

            // **Validate offsets to ensure they are within node boundaries**
            if (startOffset < 0) startOffset = 0;
            if (startOffset > startNode.length) startOffset = startNode.length;

            if (endOffset < 0) endOffset = 0;
            if (endOffset > endNode.length) endOffset = endNode.length;

            // Add debug logging
            console.log(`Bolding keyword: ${match.match}`);
            console.log(`Start Node Length: ${startNode.length}, Start Offset: ${startOffset}`);
            console.log(`End Node Length: ${endNode.length}, End Offset: ${endOffset}`);

            let range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);

            let boldSpan = document.createElement('span');
            boldSpan.className = 'read-ease-bold';

            try {
                range.surroundContents(boldSpan);
            } catch (e) {
                // Handle cases where surroundContents fails due to overlapping elements
                const fragment = range.extractContents();
                boldSpan.appendChild(fragment);
                range.insertNode(boldSpan);
            }

        } catch (e) {
            console.error(`Failed to bold keyword: ${match.match}`, e);
            continue;
        }
    }

    console.log('Keyword bolding process completed');
}

// Listener to trigger the highlight function when the popup sends a message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightWords") {
        const color = request.color || 'yellow';  // Default to yellow if no color provided
        const opacity = request.opacity || 1;
        styleSheet.textContent = updateHighlightStyle(color, opacity);  // Update global style

        const currentUrl = window.location.href;
        let mainText = null;
        styleSheet.textContent = updateHighlightStyle(color);  // Update global style

        async function getKeywords() {
            const { textContent, nodes, offsets } = retrieveText();
            try {
                const response = await fetch('http://127.0.0.1:5000/process-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "text": textContent })
                });
                // Check if response is not OK
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                // Validate data structure
                if (!data || !data.keywords || !data.sentences) {
                    console.error('Invalid response format:', data);
                    alert('Received invalid data. Please try again.');
                    return;
                }
                if (data.sentences.length > 0 || data.keywords.length > 0) {
                    console.log('Starting highlighting and bolding process...');
                    const startTime = performance.now();
                    if (data.sentences.length > 0) {
                        highlightInPlace(data.sentences, nodes, offsets, textContent);
                    }
                    if (data.keywords.length > 0) {
                        boldKeywords(data.keywords, nodes, offsets, textContent);
                    }
                    const endTime = performance.now();
                    console.log(`Highlighting and bolding completed in ${(endTime - startTime).toFixed(2)}ms`);
                }
            } catch (error) {
                console.error('Error fetching or processing data:', error);
                alert('Failed to fetch data. Please check your connection or try again later.');
            }
        }
        
        getKeywords();
        sendResponse({ status: "highlighted" });
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
    return true;
});