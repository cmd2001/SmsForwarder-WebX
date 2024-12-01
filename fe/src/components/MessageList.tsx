import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, TextField, Button } from '@mui/material';
import { fetchMessages, sendMessage } from '../services/api';

interface Message {
    display_time: string;
    content: string;
    type: 'IN' | 'OUT';
    status: 'SENT' | 'READ';
}

const MessageList: React.FC = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [start, setStart] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const limit = 10;

    const loadMessages = async (reset: boolean = false) => {
        if (!conversationId) return;
        try {
            const response = await fetchMessages(conversationId, start, limit);
            if (response.messages.length < limit) {
                setHasMoreMessages(false);
            }
            setMessages((prevMessages) =>
                reset ? [...response.messages].reverse() : [...[...response.messages].reverse(), ...prevMessages]
            );
            if (!reset) {
                setStart((prevStart) => prevStart + limit);
            } else {
                setStart(limit);
                setHasMoreMessages(response.has_next);
            }
        } catch (err) {
            setError('Failed to load messages.');
        }
    };

    useEffect(() => {
        setStart(0);
        setMessages([]);
        setHasMoreMessages(true);
        loadMessages(true);
    }, [conversationId]);

    const handleLoadMoreMessages = () => {
        loadMessages();
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        // Add logic for sending message here (API call)
        sendMessage(conversationId as string, newMessage).then(response => {
            // read from response and update messages
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    display_time: response.display_time,
                    content: newMessage,
                    type: 'OUT',
                    status: 'SENT',
                },
            ]);
        }).catch(() => {
            setError('Failed to send message.');
        });
        setNewMessage('');
    };

    return (
        <Box p={3} display="flex" flexDirection="column" justifyContent="space-between" height="100vh">
            <Typography variant="h5" mb={2}>Messages</Typography>
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            {hasMoreMessages ? (
                <Button variant="contained" onClick={handleLoadMoreMessages} sx={{ marginBottom: '10px', alignSelf: 'center' }}>
                    Load More Messages
                </Button>
            ) : (
                <Typography variant="body2" color="textSecondary" align="center" mt={2}>
                    No more messages
                </Typography>
            )}
            <List ref={listRef} sx={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
                {messages.map((message, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            justifyContent: message.type === 'IN' ? 'flex-start' : 'flex-end',
                            display: 'flex',
                            marginBottom: '10px',
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: '70%',
                                padding: '10px',
                                borderRadius: '10px',
                                backgroundColor: message.type === 'OUT' ? 'primary.main' : 'grey.300',
                                color: message.type === 'OUT' ? 'white' : 'black',
                            }}
                        >
                            <Typography variant="body2" style={{ wordBreak: 'break-word' }}>{message.content}</Typography>
                            <Typography variant="caption" display="block" mt={1} align={message.type === 'IN' ? 'left' : 'right'}>
                                {message.display_time}
                            </Typography>
                        </Box>
                    </ListItem>
                ))}
            </List>
            <Box mt={2} display="flex" alignItems="center">
                <TextField
                    variant="outlined"
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ marginLeft: '10px' }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default MessageList;
