import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AuthContext } from '../../context/AuthContext';

// Create a custom theme with a friendly color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // A pleasant blue
    },
    secondary: {
      main: '#4caf50', // A refreshing green for success states
    },
    background: {
      default: '#f5f5f5'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    }
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
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        }
      }
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Attempting login with:', { email, password: password.length + ' characters' });
    
    try {
      const response = await login(email, password);
      console.log('Login successful:', response);
      
      if (response.user.role === 'manager') {
        navigate('/dashboard');
      } else {
        navigate('/time-clock');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error details:', err.response.data);
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('Network error. Please try again.');
      }
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
              <AccessTimeIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 600 }}>
              Time Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to access your account
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          
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
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Link to="/forgot-password" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
