// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Document from './pages/documentPage/document/document.jsx';

function App() {
  return (
    <Router>
      <Routes>        
        <Route path="/" element={<Document />} />
      </Routes>
    </Router>
  );
}

export default App;
