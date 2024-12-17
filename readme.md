# ReadEase

ReadEase is a versatile tool designed to enhance reading comprehension by providing advanced text highlighting features on two platforms: a browser extension and a web application.

## Platforms and Features

### 1. Browser Extension
- Key Sentence Highlighting: Automatically highlights key sentences on any website to make essential information stand out.
- Seamless Integration: Works on most popular browsers like Wikipedia to enhance your reading experience.

### 2. Web Application
- Extends text from other source: Highlights text from inputed text, enabling highlighting on text from PDFs and Google docs.
- Customizable Features:
  - Adjust opacity of highlights for better readability.
  - Use bold styles for emphasis.
  - Enable highlighting to mark key sections visually.

## Installation and Setup

### React Extension

working directory is `extension-react`
To run the extension, follow these steps:

`cd extension-react`
1. Run `npm install` to install the dependencies.
2. Run `npm run dev` to start the development server.
3. Open Google Chrome and navigate to the extensions page by typing `chrome://extensions/` in the address bar.
4. Enable developer mode and click "Load unpacked".
5. Select the `extension-react/dist` folder to load the extension.

Alternatively, if you don't want to run the server locally, you can load the extension from the pre-uploaded `dist` folder.

### Backend and Web App

The backend and Web App are hosted on AWS.
Web App: `https://main.domwg75nq6jft.amplifyapp.com`
The Backend is also hosted as a container on AWS Lightsail.

#### Local Web App
`cd read-ease-app`
`npm install`
`npm run dev`


#### Local Backend

`cd backend`
`docker compose up`

If you're running the backend locally, you need to replace the calls in the front-end





