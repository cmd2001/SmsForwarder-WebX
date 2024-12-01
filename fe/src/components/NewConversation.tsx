import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { fetchLines, createConversation } from '../services/api';


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
        <Box p={3} position="relative" display="flex" flexDirection="column" height="100vh">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    label="Peer Number"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    fullWidth
                    sx={{ marginRight: '10px' }}
                />
                <FormControl fullWidth>
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

            <Box display="flex" alignItems="center" mt="auto" mb={2}>
                <TextField
                    label="Content"
                    fullWidth
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    margin="normal"
                    multiline
                    maxRows={4}
                    sx={{ flexGrow: 1, marginRight: '10px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ minWidth: '56px', height: '56px' }}
                >
                    <SendIcon />
                </Button>
            </Box>


        </Box>
    );
};


export default NewConversation;
