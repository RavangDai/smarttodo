import React from 'react';
import NeuralChatInterface from './NeuralChatInterface';

const ChatPanel = ({ tasks, user }) => {
    return (
        <NeuralChatInterface tasks={tasks} user={user} />
    );
};

export default ChatPanel;
