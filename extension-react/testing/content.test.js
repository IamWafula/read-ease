const { hexToRgba, updateHighlightStyle, highlightWords } = require('../src/scripts/content');

describe('Content Script', () => {
  // Test for converting hex color to RGBA with correct opacity
  test('converts hex to rgba with correct opacity', () => {
    // Check if the hex color '#FF0000' is correctly converted to 'rgba(255, 0, 0, 0.5)'
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  // Test for updating highlight styles correctly with the given color and opacity
  test('updates highlight styles correctly', () => {
    // Simulate calling updateHighlightStyle with red color and 0.8 opacity
    const style = updateHighlightStyle('#FF0000', 0.8);
    // Ensure that the returned style contains the expected RGBA background-color
    expect(style).toContain('background-color: rgba(255, 0, 0, 0.8)');
  });

  // Test for highlighting words correctly in the document
  test('highlights words correctly', () => {
    // Set up a basic HTML structure with a div containing the text 'Hello world'
    document.body.innerHTML = '<div id="test">Hello world</div>';
    // Call highlightWords function with 'Hello' to highlight it
    highlightWords(['Hello']);
    
    // Check if the highlighted word has been wrapped with the correct class
    const highlighted = document.querySelector('.read-ease-highlight');
    expect(highlighted).not.toBeNull(); // Ensure the highlighted element is found
    expect(highlighted.textContent).toBe('Hello'); // Ensure the highlighted text is 'Hello'
  });
});
