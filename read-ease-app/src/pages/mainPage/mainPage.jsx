
// mainPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../authorization/firebase.js';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Login from '../authorization/LoginPage.jsx';

import { useParams } from 'react-router-dom';

import Document from '../documentPage/document/document.jsx';


function DocumentCard({ title, preview, count, isNew, documentId, onDelete }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (isNew) {
      const response = await fetch('http://127.0.0.1:3000/user/add_document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
        },
        body: JSON.stringify({
          uid: localStorage.getItem('read-ease-uid'),
        }),
      });

      const data = await response.json();

      if (data.document_id) {
        navigate(`/documents/${data.document_id}`);
      }
    } else {
      navigate(`/documents/${documentId}`);
    }
  };

  const handleDelete = async (event) => {
    // Prevent click propagation to the parent div
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      await onDelete(documentId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {isNew ? (
        <div className="flex flex-col items-center justify-center h-32">
          <span className="text-gray-600">Create New Document</span>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{preview}</p>
          <div className="flex justify-between items-center">
            <div className="text-red-500 font-medium">{count}</div>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [documents, setDocuments] = useState([]);

  const navigate = useNavigate();

  // Fetch user documents
  useEffect(() => {
    async function fetchDocuments() {
      const response = await fetch('http://127.0.0.1:3000/user/get_documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
        },
        body: JSON.stringify({
          uid: localStorage.getItem('read-ease-uid'),
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        // Add the "new document" option at the start of the documents list
        setDocuments([
          { title: 'new', isNew: true },
          ...data.map(doc => ({
            title: doc.title,
            preview: doc.preview,
            count: doc.count,
            documentId: doc.document_id,
          })),
        ]);
      }
    }

    fetchDocuments();
  }, []);

  const deleteDocument = async (documentId) => {
    const response = await fetch('http://127.0.0.1:3000/user/delete_document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
      },
      body: JSON.stringify({
        uid: localStorage.getItem('read-ease-uid'),
        document_id: documentId,
      }),
    });

    if (response.status === 200) {
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.documentId !== documentId));
    }
  };


    
    

    // Auth effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

        const uid = currentUser ? currentUser.uid : null;

        if (uid) {
            auth.currentUser.getIdToken().then((token) => {
            setToken(token);
            localStorage.setItem('read-ease-token', token);
            localStorage.setItem('read-ease-uid', uid);
            });
        }

        setUser(currentUser);


        });
        
        return () => unsubscribe();
    }, []);



    const handleSignOut = async () => {
        try {
          await signOut(auth); // Sign the user out
          localStorage.removeItem('read-ease-token');
          localStorage.removeItem('read-ease-uid');
          navigate('/login'); // Redirect to the login page after sign-out
        } catch (error) {
          console.error("Error signing out:", error.message);
        }
      };


    if (!user) {
        return <Login />;
    }


    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold mb-4">Read-Ease</h2>
          <ul>
            <li className="mb-4"><Link to="/" className="hover:text-blue-300">My Read-Ease</Link></li>
            <li className="mb-4"><Link to="/account" className="hover:text-blue-300">Account</Link></li>
            <li><button onClick={handleSignOut} className="hover:text-blue-300">Sign out</button></li>
          </ul>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          {/* Document Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc, index) => (
              <DocumentCard
                key={index}
                title={doc.title}
                preview={doc.preview}
                count={doc.count}
                isNew={doc.isNew}
                documentId={doc.documentId}
                onDelete={deleteDocument} // Pass the delete function as a prop
              />
            ))}
          </div>
        </div>
     </div>
  );
}