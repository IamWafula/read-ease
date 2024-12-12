import React, { useState, useRef } from 'react';

export default function Document() {
  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [highlightColor, setHighlightColor] = useState('#FFFF00'); // Default: Yellow
  const [highlightOpacity, setHighlightOpacity] = useState(1); // Default: Fully opaque
  const [boldColor, setBoldColor] = useState('#FF0000'); // Default: Red
  const [docTitle, setDocTitle] = useState('Untitled Document'); // Default: Untitled Document
  const [isProcessing, setIsProcessing] = useState(false); // Track processing state
  const [errorMessage, setErrorMessage] = useState('');
  
  const editableBoxRef = useRef(null); // Reference to the contentEditable box

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    return { range, selection };
  };

  const restoreCaretPosition = (caretData) => {
    const { range, selection } = caretData;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please paste some text to process.');
      return;
    }

    setErrorMessage(''); // Reset any previous error message
    setIsProcessing(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error('Failed to process text');

      const data = await response.json();
      setKeywords(data.keywords || []);
      setSentences(data.sentences || []);
      applyHighlighting(data.keywords, data.sentences);
    } catch (error) {
      console.error('Error processing text:', error);
      setErrorMessage('There was an error processing the text.');
    } finally {
      setIsProcessing(false); // Reset loading state
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
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Document Title Input */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Untitled Document"
        />
      </div>

      {/* Editable Box */}
      <div
        ref={editableBoxRef}
        contentEditable="true"
        suppressContentEditableWarning={true}
        className="w-full max-w-4xl p-4 border-2 border-gray-300 rounded-lg bg-white shadow-lg resize-y overflow-auto mb-6"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          minHeight: '200px',
        }}
        onInput={handleInputChange}
      ></div>

      {/* Error Message */}
      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      {/* Customization Controls */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-2">Highlight Color</label>
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className="w-16 h-16 border rounded-lg p-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-2">Highlight Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={highlightOpacity}
            onChange={(e) => setHighlightOpacity(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-2">Bold Color</label>
          <input
            type="color"
            value={boldColor}
            onChange={(e) => setBoldColor(e.target.value)}
            className="w-16 h-16 border rounded-lg p-1"
          />
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessText}
        disabled={isProcessing}
        className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200"
      >
        {isProcessing ? 'Processing...' : 'Process Text'}
      </button>
    </div>
  );
}


