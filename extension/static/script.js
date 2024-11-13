const circles = document.querySelectorAll('.highlight-circle');
const opacitySlider = document.getElementById('opacity-slider'); // Global opacity slider

let globalOpacity = 1; // Default opacity

// Track the currently active circle
let activeCircle = null;

circles.forEach(circle => {
    const arrowIcon = circle.querySelector('.arrow-icon');
    const colorPicker = circle.querySelector('.color-picker');

    // Initialize state variables for color picker open and arrow visibility
    let isColorPickerOpen = false;

    // Handle click event on each circle
    circle.addEventListener('click', (e) => {
        e.stopPropagation();

        if (activeCircle !== circle) {
            if (activeCircle) {
                const activeArrowIcon = activeCircle.querySelector('.arrow-icon');
                const activeColorPicker = activeCircle.querySelector('.color-picker');

                if (activeArrowIcon) activeArrowIcon.style.display = 'none';
                if (activeColorPicker) activeColorPicker.style.display = 'none';

                activeCircle.classList.remove('selected');
            }

            activeCircle = circle;
            isColorPickerOpen = false;

            if (arrowIcon) arrowIcon.style.display = 'block';
            circle.classList.add('selected');
        } else {
            if (isColorPickerOpen) {
                if (colorPicker) colorPicker.style.display = 'none';
                isColorPickerOpen = false;
            } else {
                if (colorPicker) {
                    const currentColor = window.getComputedStyle(circle).backgroundColor;
                    colorPicker.value = rgbToHex(currentColor);
                    colorPicker.style.display = 'block';
                    colorPicker.focus();
                }
                isColorPickerOpen = true;
            }
        }
    });

    // When a color is picked, update the circle's background color with global opacity
    if (colorPicker) {
        colorPicker.addEventListener('input', () => {
            updateCircleBackground(circle, colorPicker.value, globalOpacity);
        });
    }
});

// Update all circles when the global opacity slider is adjusted
opacitySlider.addEventListener('input', (event) => {
    globalOpacity = event.target.value;
    circles.forEach(circle => {
        const color = circle.getAttribute('data-color') || '#FFD700';
        updateCircleBackground(circle, color, globalOpacity);
    });
});

// Function to update background color with opacity
function updateCircleBackground(circle, color, opacity) {
    const rgbaColor = hexToRgba(color, opacity);
    circle.style.backgroundColor = rgbaColor;
    circle.setAttribute('data-color', color); // Store color without opacity in data attribute
}

// Utility function to convert HEX color to RGBA with opacity
function hexToRgba(hex, opacity) {
    const rgbValues = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
}

// Utility function to convert RGB to HEX (used to set initial color)
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g).map(Number);
    return (
        '#' +
        rgbValues
            .map(val => val.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
    );
}

// Hide the color picker and arrow when clicking outside
document.addEventListener('click', () => {
    if (activeCircle) {
        const arrowIcon = activeCircle.querySelector('.arrow-icon');
        const colorPicker = activeCircle.querySelector('.color-picker');

        if (arrowIcon) arrowIcon.style.display = 'none';
        if (colorPicker) colorPicker.style.display = 'none';

        activeCircle.classList.remove('selected');
        activeCircle = null;
    }
});
