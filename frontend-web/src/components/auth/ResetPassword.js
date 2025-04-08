import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import KeyIcon from '@mui/icons-material/Key';
import API from '../../services/api'; // Import the API service

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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setTokenValid(false);
      setStatus({
        type: 'error',
        message: 'Invalid reset token'
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the API service instead of direct axios call
      const response = await API.post('/auth/reset-password', { 
        token, 
        password 
      });
      
      setStatus({
        type: 'success',
        message: 'Password reset successful'
      });
      
      // Redirect to login after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error details:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Paper elevation={0} sx={{ p: 5, width: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>Invalid or expired reset token</Alert>
              <Button 
                component={Link} 
                to="/forgot-password" 
                variant="contained"
                sx={{ mt: 2 }}
              >
                Request a new reset link
              </Button>
            </Box>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

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
              <KeyIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 600 }}>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Enter your new password
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
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
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

export default ResetPassword;
