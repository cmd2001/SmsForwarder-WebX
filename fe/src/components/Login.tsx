import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CssBaseline,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { handleLogin } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Welcome to SMS Web Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }} className="box-main">
        <Toolbar />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <Card
          variant="outlined"
          sx={{ minWidth: 275, maxWidth: '80%', margin: 'auto', mt: 6 }}
        >
          <CardHeader title="Login" sx={{ margin: 'auto' }}></CardHeader>
          <CardContent>
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                try {
                  await handleLogin(username, password);
                } catch (err) {
                  setError('Failed to login, please check your credentials.');
                }
              }}
              fullWidth
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
