// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/mainPage/mainPage.jsx';
import DocumentsPage from './pages/documentPage/documentsPage.jsx';
import Document from './pages/documentPage/document/document.jsx';
import LoginPage from './pages/authorization/LoginPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/documents/:id" element={<Document />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
