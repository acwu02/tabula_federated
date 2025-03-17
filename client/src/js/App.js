import React, { useRef, useEffect, useState } from 'react';
import Form from './Form';
import Content from './Content';
import '../css/App.css';

function App() {
  const [user, setUser] = useState(null);

  const onSetUser = (user) => {
    setUser(user);
  };

  return (
    <div id="app">
      {user && <Content user={user} onSetUser={onSetUser}/>}
      {!user && <Form onLogin={onSetUser}/>}
    </div>
  );
}

export default App;