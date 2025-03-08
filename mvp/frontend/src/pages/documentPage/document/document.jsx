// This module has been adapted from the web version of ReadEease
// All URLS have been updated to the local server
// Implemented threshold to find optimum : 3
// Changed to Single Page
// - Removed user authentication 
// - Removed Document Creation 
// - Removed Caching


import React, { useState, useRef } from 'react';
import { useEffect } from 'react';

export default function Document() {
  const [inputText, setInputText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [highlightColor, setHighlightColor] = useState('#FFFF00'); // Default: Yellow
  const [highlightOpacity, setHighlightOpacity] = useState(1); // Default: Fully opaque
  const [boldColor, setBoldColor] = useState('#FF0000'); // Default: Red
  const [docTitle, setDocTitle] = useState('Untitled Document'); // Default: Untitled Document
  const [thresholdValue, setThresholdValue] = useState(3); // Default: 1
  const [buttonDisabled, setButtonDisabled] = useState(false);
  
  
  const SERVER_URL = 'http://localhost:3000';


  const editableBoxRef = useRef(null); // Reference to the contentEditable box

  const getCurrentUrl = () => {
    return window.location.href.split('/').pop();
  };


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

    console.log(localStorage.getItem('read-ease-token'));

    try {
      setButtonDisabled(true);
      const response = await fetch(`${SERVER_URL}/process-text/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
        },
        body: JSON.stringify({ 
          text: inputText,
          uid: localStorage.getItem('read-ease-uid'),
          ranking: parseInt(thresholdValue),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process text');
      }

      const data = await response.json();
      setKeywords(data.keywords || []);
      setSentences(data.sentences || []);
      applyHighlighting(data.keywords, data.sentences);

      setButtonDisabled(false);
    } catch (error) {
      console.error('Error processing text:', error);
      alert('There was an error processing the text.');
    }
  };

  const applyHighlighting = (keywords, sentences) => {
    const caretData = saveCaretPosition();
    
    let content = originalText;
    const editableBox = editableBoxRef.current;

    // Highlight sentences
    sentences.forEach((sentence) => {
      try{
        const sentenceRegex = new RegExp(`(${sentence})`, 'gi');
        content = content.replace(
          sentenceRegex,
          `<span style="background-color: ${highlightColor}; opacity: ${highlightOpacity};">$1</span>`
        );
      } catch (e) {
        console.log(e);
      }
    });

    // Bold keywords
    keywords.forEach((keyword) => {

      try{
        const keywordRegex = new RegExp(`(${keyword})`, 'gi');
        content = content.replace(
          keywordRegex,
          `<b style="color: ${boldColor};">$1</b>`
        );
      } catch (e) {
        console.log(e);
      }
    });

    editableBox.innerHTML = content;
    restoreCaretPosition(caretData);
  };

  const handleInputChange = () => {
    const editableBox = editableBoxRef.current;

    setOriginalText(editableBox.innerText);
    setInputText(editableBox.innerText);
  };


  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      {/* Document Title Input */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="p-3 border-2 border-gray-300 rounded-md text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Untitled Document"
        />
      </div>

      {/* Editable Box */}
      <div
        id="editable-box"
        ref={editableBoxRef}
        contentEditable="true"
        suppressContentEditableWarning={true}
        className="w-full p-4 border-2 border-gray-300 rounded-lg overflow-y-auto"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          resize: 'both',
          minHeight: '150px',
        }}
        onInput={handleInputChange}
      ></div>

      {/* Customization Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <label className="font-bold text-lg">Highlight Color</label>
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className="w-full p-2 border rounded-full cursor-pointer"
            style={{ height: '40px' }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="font-bold text-lg">Highlight Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={highlightOpacity}
            onChange={(e) => setHighlightOpacity(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>0.1</span>
            <span>1.0</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="font-bold text-lg">Bold Color</label>
          <input
            type="color"
            value={boldColor}
            onChange={(e) => setBoldColor(e.target.value)}
            className="w-full p-2 border rounded-full cursor-pointer"
            style={{ height: '40px' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-bold text-lg">Threshold</label>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between text-sm">
          <span>Extensive Highlights</span>
          <span>Concise Highlights</span>
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessText}
        disabled={buttonDisabled}
        className={`px-6 py-3 rounded-lg transition-all mt-6 self-center ${
          buttonDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Process Text
      </button>
    </div>
  );
}