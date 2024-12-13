// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/mainPage/mainPage.jsx';
import DocumentsPage from './pages/documentPage/documentsPage.jsx';
import Document from './pages/documentPage/document/document.jsx';
import SignupPage from './pages/authorization/SignupPage.jsx';
import LoginPage from './pages/authorization/LoginPage.jsx';
import AccountPage from './pages/accountPage/AccountPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} /> 
        <Route path="/documents/:id" element={<Document />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;