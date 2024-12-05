import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './pages/mainPage/mainPage.jsx';
import DocumentsPage from './pages/documentPage/documentsPage.jsx';
import Document from './pages/documentPage/document/document.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/documents/:id" element={<Document />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    
    </Router>
  );
}

export default App;
