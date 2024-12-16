
// mainPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../authorization/firebase.js';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Login from '../authorization/LoginPage.jsx';

import { useParams } from 'react-router-dom';

import Document from '../documentPage/document/document.jsx';




function DocumentCard ({ title, preview, count }) {

      const [navigateToDocument, setNavigateToDocument] = useState(false);
      const [documentId, setDocumentId] = useState(null);

      async function addDocument() {
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

        if (data.document_id){

          return data.document_id;

        }

        return null;
      }


      return (
        <div
          onClick={ async () => {
            
            const documentId = await addDocument();
            // const documentId = '675f837c84d3c59b5cf6071e'

            if (documentId){
              setDocumentId(documentId);
              setNavigateToDocument(true);
            }

          
          }}
        >

          {
            navigateToDocument && 
            <Navigate to={`/documents/${documentId}`} />
          }
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {title === "new" ? (
              <div className="flex flex-col items-center justify-center h-32">
                <span className="text-gray-600">Create New Document</span>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{preview}</p>
                <div className="text-red-500 font-medium">{count}</div>
              </>
            )}
          </div>
        </div>
      );
      
      

    
}

export default function MainPage() {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    // const [documents, setDocuments] = useState([]);

    const documents = [
        {
          title: "new",
          preview: "",
        },
    ];


    useEffect(() => {
      async function fetchDocuments(user) {
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

        if (response.status == 200){
          const data = await response.json();
          // setDocuments(data);
          console.log(data)
        }
        
        
      }

      fetchDocuments();
    }, []);


    
    

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
            {/* Welcome Message */}
            
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Document Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc, index) => (
            <DocumentCard
              key={index}
              title={doc.title}
              preview={doc.preview}
              count={doc.count}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


   




  
 