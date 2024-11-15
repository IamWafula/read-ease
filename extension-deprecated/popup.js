// Get all highlight circles
const highlightCircles = document.getElementsByClassName('highlight-circle');

// Add click listener to each circle
Array.from(highlightCircles).forEach(circle => {
    circle.addEventListener('click', () => {
        const color = circle.dataset.color;
        console.log('circle click registered')
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "highlightWords",
                words: ["test", "the", "and"],
                color: color
            });
        });
    });
});

// Handle color picker
const colorPickers = document.getElementsByClassName('color-picker');
Array.from(colorPickers).forEach(picker => {
    picker.addEventListener('change', (e) => {
        const circle = e.target.parentElement;
        circle.style.backgroundColor = e.target.value;
        circle.dataset.color = e.target.value;
    });
});