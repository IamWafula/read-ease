const circles = document.querySelectorAll('.highlight-circle');

circles.forEach(circle => {
    const arrowIcon = circle.querySelector('.arrow-icon');
    const colorPicker = circle.querySelector('.color-picker');
    let isColorPickerOpen = false; // Track if the color picker is open
    let isArrowVisible = false; // Track if the arrow is currently visible

    // Handle click event on each circle
    circle.addEventListener('click', (e) => {
        // Prevent click from immediately closing the color picker
        e.stopPropagation();

        // Check if the arrow is already visible (second click)
        if (isArrowVisible) {
            // Toggle the color picker on the second click
            if (isColorPickerOpen) {
                colorPicker.style.display = 'none'; // Hide color picker if open
                isColorPickerOpen = false;
            } else {
                colorPicker.style.display = 'block'; // Show color picker
                colorPicker.focus(); // Focus on the color picker to open it automatically
                isColorPickerOpen = true;
            }
        } else {
            // First click: Show the arrow icon
            // Deselect other circles and hide their color pickers
            circles.forEach(c => {
                c.classList.remove('selected');
                c.querySelector('.color-picker').style.display = 'none';
                c.isColorPickerOpen = false;
                c.isArrowVisible = false; // Reset arrow visibility for other circles
            });

            // Select this circle and show the arrow
            circle.classList.add('selected');
            isArrowVisible = true;
            isColorPickerOpen = false; // Ensure color picker stays hidden on first click
        }
    });

    // When a color is picked, update the circle's background color
    colorPicker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        circle.style.backgroundColor = newColor;
        circle.setAttribute('data-color', newColor); // Update the data-color attribute
    });
});


// Hide the color picker when clicking outside
document.addEventListener('click', () => {
    circles.forEach(circle => {
        circle.querySelector('.color-picker').style.display = 'none';
        circle.isColorPickerOpen = false;
        circle.isArrowVisible = false;
        circle.classList.remove('selected');
    });
});
