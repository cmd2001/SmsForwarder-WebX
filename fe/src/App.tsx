import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ConversationList from './components/ConversationList';
import MessageList from './components/MessageList';
import NewConversation from './components/NewConversation';
import LineList from './components/LineList';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConversationList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/line" element={<LineList />} />
        <Route path="/conversation/new" element={<NewConversation />} />
        <Route path="/conversation/:conversationId" element={<MessageList />} />
      </Routes>
    </Router>
  );
};

export default App;