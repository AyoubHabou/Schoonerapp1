import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Alert,
  Avatar,
  ThemeProvider,
  createTheme
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';

// Use same theme as login/register
const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },
    background: { default: '#f5f5f5' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }
    }
  }
});

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the API to request password reset
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      setStatus({
        type: 'success',
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockResetIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 600 }}>
              Forgot Password
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email to reset your password
            </Typography>
          </Box>
          
          {status.message && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {status.message}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Back to login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ForgotPassword;