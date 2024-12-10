import React, { useState, useRef } from 'react';

export default function Document() {
  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [highlightColor, setHighlightColor] = useState('#FFFF00'); // Default: Yellow
  const [highlightOpacity, setHighlightOpacity] = useState(1); // Default: Fully opaque
  const [boldColor, setBoldColor] = useState('#FF0000'); // Default: Red

  const editableBoxRef = useRef(null); // Reference to the contentEditable box

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    return {
      range,
      selection,
    };
  };

  const restoreCaretPosition = (caretData) => {
    const { range, selection } = caretData;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      alert('Please paste some text to process.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to process text');
      }

      const data = await response.json();
      setKeywords(data.keywords || []);
      setSentences(data.sentences || []);
      applyHighlighting(data.keywords, data.sentences);
    } catch (error) {
      console.error('Error processing text:', error);
      alert('There was an error processing the text.');
    }
  };

  const applyHighlighting = (keywords, sentences) => {
    const caretData = saveCaretPosition();

    const editableBox = editableBoxRef.current;
    let content = editableBox.innerText;

    // Highlight sentences
    sentences.forEach((sentence) => {
      const sentenceRegex = new RegExp(`(${sentence})`, 'gi');
      content = content.replace(
        sentenceRegex,
        `<span style="background-color: ${highlightColor}; opacity: ${highlightOpacity};">$1</span>`
      );
    });

    // Bold keywords
    keywords.forEach((keyword) => {
      const keywordRegex = new RegExp(`(${keyword})`, 'gi');
      content = content.replace(
        keywordRegex,
        `<b style="color: ${boldColor};">$1</b>`
      );
    });

    editableBox.innerHTML = content;
    restoreCaretPosition(caretData);
  };

  const handleInputChange = () => {
    const editableBox = editableBoxRef.current;
    setInputText(editableBox.innerText);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Paste Your Text</h1>

      {/* Editable Box */}
      <div
        id="editable-box"
        ref={editableBoxRef}
        contentEditable="true"
        suppressContentEditableWarning={true}
        className="w-full p-2 border border-gray-300 rounded overflow-y-auto"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          resize: 'both',
          minHeight: '150px',
        }}
        onInput={handleInputChange}
      ></div>

      {/* Customization Controls */}
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label className="font-bold">Highlight Color</label>
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="font-bold">Highlight Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={highlightOpacity}
            onChange={(e) => setHighlightOpacity(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="font-bold">Bold Color</label>
          <input
            type="color"
            value={boldColor}
            onChange={(e) => setBoldColor(e.target.value)}
          />
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessText}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Process Text
      </button>
    </div>
  );
}