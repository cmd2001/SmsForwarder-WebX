import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchConversations } from '../services/api';

interface Conversation {
    conversation_id: number;
    peer_number: string;
    via_line_number: string;
    last_message_content: string;
    last_message_time: string;
    last_message_is_unread: boolean;
}

const ConversationList: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [start, setStart] = useState(0);
    const [hasMoreConversations, setHasMoreConversations] = useState(true);
    const limit = 2;
    const navigate = useNavigate();

    const loadConversations = async (reset: boolean = false) => {
        try {
            const response = await fetchConversations(start, limit);
            if (response.conversations.length < limit) {
                setHasMoreConversations(false);
            }
            setConversations((prevConversations) =>
                reset ? response.conversations : [...prevConversations, ...response.conversations]
            );
            if (!reset) {
                setStart((prevStart) => prevStart + limit);
            } else {
                setStart(limit);
            }
        } catch (err) {
            setError('Failed to load conversations.');
        }
    };

    useEffect(() => {
        setStart(0);
        setConversations([]);
        setHasMoreConversations(true);
        loadConversations(true);
    }, []);

    const handleLoadMoreConversations = () => {
        loadConversations();
    };

    const handleConversationClick = (conversationId: number) => {
        navigate(`/conversation/${conversationId}`);
    };

    const handleNewConversation = () => {
        navigate('/new');
    };

    return (
        <Box p={3} position="relative">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Conversations</Typography>
                <IconButton color="primary" onClick={handleNewConversation}>
                    <AddIcon />
                </IconButton>
            </Box>
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <List>
                {conversations.map((conversation) => (
                    <ListItem key={conversation.conversation_id} onClick={() => handleConversationClick(conversation.conversation_id)}>
                        <ListItemText
                            primary={`${conversation.peer_number} via ${conversation.via_line_number}, ${conversation.last_message_time}`}
                            secondary={
                                <span style={{ fontWeight: conversation.last_message_is_unread ? 'bold' : 'normal' }}>
                                    {conversation.last_message_content}
                                </span>
                            }
                        />
                    </ListItem>
                ))}
            </List>
            {hasMoreConversations ? (
                <Button variant="contained" onClick={handleLoadMoreConversations} sx={{ marginTop: '10px', alignSelf: 'center' }}>
                    Load More Conversations
                </Button>
            ) : (
                <Typography variant="body2" color="textSecondary" align="center" mt={2}>
                    No more conversations
                </Typography>
            )}
        </Box>
    );
};

export default ConversationList;