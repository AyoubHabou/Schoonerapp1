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
  Grid,
  ThemeProvider,
  createTheme
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'employee' // Default to employee
      });
      navigate('/time-clock');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 5 }}>
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
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 600 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Sign up for Time Tracker
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Register;