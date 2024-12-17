console.log('Content script loaded.');

const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);

function updateHighlightStyle(color, opacity) {
    const rgbaColor = hexToRgba(color, opacity);
    return `
        .read-ease-highlight {
            background-color: ${rgbaColor} !important;
            border-radius: 2px;
        }
        .read-ease-bold {
            font-weight: bold;
        }
    `;
}

function hexToRgba(hex, opacity = 1) {
    opacity = Math.min(Math.max(parseFloat(opacity) || 1, 0), 1);
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
    }
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
    phrases.sort((a, b) => b.length - a.length);
    phrases = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    phrases = phrases.map(phrase => `(?<!\\w)${phrase}(?!\\w)`);
    const regex = new RegExp(phrases.join('|'), 'gi');

    let match;
    let matches = [];

    while ((match = regex.exec(textContent)) !== null) {
        matches.push({
            start: match.index,
            end: regex.lastIndex,
            match: match[0]
        });
    }

    matches = matches.filter((m, index) => {
        if (index === 0) return true;
        const prevMatch = matches[index - 1];
        return m.start >= prevMatch.end;
    });

    for (let i = matches.length - 1; i >= 0; i--) {
        let m = matches[i];
        try {
            let startNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= m.start && (offsets[idx + 1] > m.start || idx === offsets.length - 1)
            );
            let startNode = nodes[startNodeIndex];
            let startOffset = m.start - offsets[startNodeIndex];

            let endNodeIndex = offsets.findIndex((offset, idx) =>
                offset <= m.end && (offsets[idx + 1] > m.end || idx === offsets.length - 1)
            );
            let endNode = nodes[endNodeIndex];
            let endOffset = m.end - offsets[endNodeIndex];

            let range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);

            let highlightSpan = document.createElement('span');
            highlightSpan.className = 'read-ease-highlight';
            
            try {
                range.surroundContents(highlightSpan);
            } catch (e) {
                const fragment = range.extractContents();
                highlightSpan.appendChild(fragment);
                range.insertNode(highlightSpan);
            }

        } catch (e) {
            console.error('Failed to highlight match:', m.match, e);
            continue;
        }
    }
}

function boldKeywords(keywords, nodes, offsets, textContent) {
    keywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
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

    for (let i = matches.length - 1; i >= 0; i--) {
        let m = matches[i];
        try {
            let startNodeIndex = offsets.findIndex(
                (offset, idx) => offset <= m.start && (offsets[idx + 1] > m.start || idx === offsets.length - 1)
            );
            let startNode = nodes[startNodeIndex];
            let startOffset = m.start - offsets[startNodeIndex];

            let endNodeIndex = offsets.findIndex(
                (offset, idx) => offset <= m.end && (offsets[idx + 1] > m.end || idx === offsets.length - 1)
            );
            let endNode = nodes[endNodeIndex];
            let endOffset = m.end - offsets[endNodeIndex];

            if (startOffset < 0) startOffset = 0;
            if (startOffset > startNode.length) startOffset = startNode.length;
            if (endOffset < 0) endOffset = 0;
            if (endOffset > endNode.length) endOffset = endNode.length;

            let range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);

            let boldSpan = document.createElement('span');
            boldSpan.className = 'read-ease-bold';

            try {
                range.surroundContents(boldSpan);
            } catch (e) {
                const fragment = range.extractContents();
                boldSpan.appendChild(fragment);
                range.insertNode(boldSpan);
            }

        } catch (e) {
            console.error(`Failed to bold keyword: ${m.match}`, e);
            continue;
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightWords") {
        const color = request.color || 'yellow';
        const opacity = request.opacity || 1;
        const uid = request.uid;
        const token = request.auth_token;
        styleSheet.textContent = updateHighlightStyle(color, opacity);

        const currentUrl = window.location.href;

        (async function getKeywords() {
            const { textContent, nodes, offsets } = retrieveText();
            try {
                const response = await fetch('https://read-ease.eefka0ebbvvqc.us-east-1.cs.amazonlightsail.com/process-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        "text": textContent,
                        "uid" : uid,
                        "url" : currentUrl
                     })
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (!data || !data.keywords || !data.sentences) {
                    console.error('Invalid response format:', data);
                    alert('Received invalid data. Please try again.');
                    return;
                }

                if (data.sentences.length > 0) {
                    highlightInPlace(data.sentences, nodes, offsets, textContent);
                }
                if (data.keywords.length > 0) {
                    boldKeywords(data.keywords, nodes, offsets, textContent);
                }

                sendResponse({ 
                  status: "highlighted", 
                  keywords: data.keywords, 
                  sentences: data.sentences 
                });

            } catch (error) {
                console.error('Error fetching or processing data:', error);
                alert('Failed to fetch data. Please check your connection or try again later.');
            }
        })();
        
        return true;

    } else if (request.action === "applyHighlightStyles") {
        const color = request.color || 'yellow';
        const opacity = request.opacity || 1;
        styleSheet.textContent = updateHighlightStyle(color, opacity);
        sendResponse({ status: "styles_updated" });
        return false;
    }
    return true;
});
