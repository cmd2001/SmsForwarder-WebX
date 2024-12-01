import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, TextField, Button, CssBaseline, AppBar, Toolbar, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { handleLogout, fetchMessages, sendMessage, deleteConversation } from '../services/api';
import { parseTime } from '../services/utils';
import { pink, grey } from '@mui/material/colors';


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
    const [lineNumber, setLineNumber] = useState<string | null>(null);
    const [peerNumber, setPeerNumber] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [start, setStart] = useState(0);
    const [open, setOpen] = useState(false);
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
                setLineNumber(response.via_line_number);
                setPeerNumber(response.peer_number);
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
        setLineNumber(null);
        setPeerNumber(null);
        setOpen(false);
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
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {peerNumber} <Typography variant="caption" display="inline">via {lineNumber}</Typography>
                    </Typography>
                    <IconButton size="large" aria-label="logout" color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                    <IconButton size="large" aria-label="logout" color="inherit" onClick={() => { setOpen(true); }}>
                        <DeleteIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ p: 3 }} className='box-main'>
                <Toolbar />
                {error && (
                    <Typography color="error" variant="body2" align="center">
                        {error}
                    </Typography>
                )}
                {hasMoreMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <Button variant="contained" onClick={handleLoadMoreMessages}>
                            Load More Messages
                        </Button>
                    </Box>
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
                                    backgroundColor: message.type === 'OUT' ? pink[50] : grey[300],
                                    color: message.type === 'OUT' ? pink[800] : grey[900],
                                }}
                            >
                                <Typography variant="body2" style={{ wordBreak: 'break-word' }}>{message.content}</Typography>
                                <Typography variant="caption" display="block" mt={1} align={message.type === 'IN' ? 'left' : 'right'}>
                                    {parseTime(message.display_time)}
                                </Typography>
                            </Box>
                        </ListItem>

                    ))}
                </List>
                <Paper
                    component="form"
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%' }}
                >
                    <TextField
                        sx={{ ml: 1, flex: 1 }}
                        label="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        multiline
                        maxRows={4}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} onClick={handleSendMessage}>
                        <SendIcon />
                    </IconButton>
                </Paper>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Delete {peerNumber} via {lineNumber}?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure to delete this conversation?
                            <Typography color="error">THIS CANNOT BE UNDONE</Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setOpen(false)}>NO</Button>
                        <Button variant="contained" onClick={
                            () => {
                                deleteConversation(conversationId as string).then(() => {
                                    window.location.href = '/';
                                }).catch(() => {
                                    setOpen(false);
                                    setError('Failed to delete conversation.');
                                });
                            }
                        } autoFocus>
                            YES
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default MessageList;
