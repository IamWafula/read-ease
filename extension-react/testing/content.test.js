const { hexToRgba, updateHighlightStyle, highlightWords } = require('../src/scripts/content');

describe('Content Script', () => {
  test('converts hex to rgba with correct opacity', () => {
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  test('updates highlight styles correctly', () => {
    const style = updateHighlightStyle('#FF0000', 0.8);
    expect(style).toContain('background-color: rgba(255, 0, 0, 0.8)');
  });

  test('highlights words correctly', () => {
    document.body.innerHTML = '<div id="test">Hello world</div>';
    highlightWords(['Hello']);
    const highlighted = document.querySelector('.read-ease-highlight');
    expect(highlighted).not.toBeNull();
    expect(highlighted.textContent).toBe('Hello');
  });
});
