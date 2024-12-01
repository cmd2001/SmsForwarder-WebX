import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
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
    const limit = 10;
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
            setStart((prevStart) => prevStart + limit);
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

    return (
        <Box p={3}>
            <Typography variant="h5">Conversations</Typography>
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