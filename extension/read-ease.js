// this is the main script for the extension
// it will have access to the DOM (the main page, not the popup) and the browser API


function getWikipediaText() {
    const text = document.getElementById("bodyContent").innerText;
    return text;
}

window.onload = () => {

    // get current URL
    var currentUrl = window.location.href;
    var mainText = null;

    // check if URL is wikipedia
    // TODO: Regex would be better for URL matching
    if (currentUrl.includes("wikipedia.org")) {
        // run the wikipedia script
        mainText = getWikipediaText();
    }

    console.log(mainText);
    // TODO: send the text to the background script OR Backend
}