import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from "react-infinite-scroller";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  ListItemButton,
  Fab,
  Toolbar,
  AppBar,
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';
import PhoneIcon from '@mui/icons-material/Phone';
import { handleLogout, fetchConversations } from '../services/api';
import { parseTime } from '../services/utils';
import { Conversation } from '../interfaces/Conversation';

const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [navi, setNavi] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [start, setStart] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const loadConversations = async (page: number, reset: boolean = false) => {
    if (start === 0 && !reset) return;
    try {
      const response = await fetchConversations(start, limit);
      if (response.conversations.length < limit) {
        setHasMoreConversations(false);
      }
      console.log(start, reset);
      if (reset) {
        setConversations(response.conversations);
        setStart(limit);
        return;
      }
      setConversations((prevConversations) => [...prevConversations, ...response.conversations]);
      setStart(start + limit);
    } catch (err) {
      setError('Failed to load conversations.');
    }
  };

  useEffect(() => {
    setConversations([]);
    setHasMoreConversations(true);
    loadConversations(0, true);
  }, []);

  const handleConversationClick = (conversationId: number) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleNewConversation = () => {
    navigate('/conversation/new');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Conversations
          </Typography>
          <IconButton
            size="large"
            aria-label="new"
            color="inherit"
            onClick={handleNewConversation}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="logout"
            color="inherit"
            onClick={handleLogout}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }} className="box-main">
        <Toolbar />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <InfiniteScroll
          pageStart={limit}
          loadMore={loadConversations}
          hasMore={hasMoreConversations}
          initialLoad={false}
        >
          <List sx={{
            pl: 0,
            pr: 0,
            pb: 7,
          }}>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation.conversation_id}>
                <ListItemButton
                  onClick={() =>
                    handleConversationClick(conversation.conversation_id)
                  }>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: conversation.last_message_is_unread
                              ? 'bold'
                              : 'normal',
                          }}
                        >
                          {conversation.peer_number} via{' '}
                          {conversation.via_line_number}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            fontWeight: conversation.last_message_is_unread
                              ? 'bold'
                              : 'normal',
                          }}
                        >
                          {parseTime(conversation.last_message_time)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <span
                        style={{
                          fontWeight: conversation.last_message_is_unread
                            ? 'bold'
                            : 'normal',
                        }}
                      >
                        {conversation.last_message_content}
                      </span>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </InfiniteScroll>
      </Box>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={navi}
          onChange={(event, newValue) => {
            setNavi(newValue);
            if (newValue === 0) {
              navigate('/line');
            }
            if (newValue === 1) {
              navigate('/');
            }
          }}
        >
          <BottomNavigationAction label="Lines" icon={<PhoneIcon />} />
          <BottomNavigationAction
            label="Conversations"
            icon={<MessageIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default ConversationList;
