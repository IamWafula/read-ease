// mainPage.jsx
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../login/firebase.js';

import Login from '../login/login.jsx';

import { useState, useEffect } from 'react';

export default function MainPage() {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);


    // Auth effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

        const uid = currentUser ? currentUser.uid : null;

        if (uid) {
            auth.currentUser.getIdToken().then((token) => {
            setToken(token);
            });
        }

        setUser(currentUser);


        });
        
        console.log(user)

        return () => unsubscribe();
    }, []);


    if (!user) {
        return <Login />;
    }
    

    return (
        <div>
        <h1>Welcome to ReadEase!</h1>
        <p>ReadEase is a web application that makes reading easier for everyone. It uses a machine learning model to summarize long documents into shorter, more concise versions. It also provides a distraction-free reading experience by removing ads, pop-ups, and other clutter from web pages.</p>
        </div>
    );
}