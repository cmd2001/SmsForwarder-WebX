import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton, CssBaseline, AppBar, Toolbar, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import { fetchLines, createConversation, handleLogout } from '../services/api';


interface Line {
    id: number;
    number: string;
    sim_slot: number;
    device_mark: string;
    endpoint: string;
}

const NewConversation: React.FC = () => {
    const [lines, setLines] = useState<Line[]>([]);  // To store available lines
    const [selectedLine, setSelectedLine] = useState<string>('');  // To store the selected line
    const [number, setNumber] = useState<number | string>('');  // To store the number input
    const [content, setContent] = useState<string>('');  // To store the content input
    const [error, setError] = useState<string | null>(null);  // To store any error messages
    const [loading, setLoading] = useState<boolean>(false);  // To indicate loading state

    useEffect(() => {
        const loadLines = async () => {
            try {
                const response = await fetchLines();
                setLines(response);
            } catch (err) {
                setError('Failed to load available lines.');
            }
        };

        loadLines();
    }, []);

    const handleSubmit = async () => {
        if (!selectedLine || !number || !content) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await createConversation(selectedLine, number, content);
            if (response.conversation_id) {
                window.location.href = `/conversation/${response.conversation_id}`;
            }
        } catch (err) {
            setError('Failed to create conversation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        New Conversation
                    </Typography>
                    <IconButton size="large" aria-label="logout" color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
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
                <Box sx={{ display: 'flex' }} style={{ width: "100%" }}>
                    <TextField
                        label="Peer Number"
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        sx={{ marginRight: '10px' }}
                        fullWidth
                    />
                    <FormControl sx={{ minWidth: '150px' }}>
                        <InputLabel id="line-label">Line</InputLabel>
                        <Select
                            labelId="line-label"
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                            label="Line"
                        >
                            {lines.map((line, index) => (
                                <MenuItem key={index} value={line.id}>
                                    {line.number}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%' }}
            >
                <TextField
                    sx={{ ml: 1, flex: 1 }}
                    label="Type a message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    maxRows={4}
                />
                <IconButton type="button" sx={{ p: '10px' }} onClick={handleSubmit}>
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};


export default NewConversation;
