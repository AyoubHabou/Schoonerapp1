import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Grid
} from '@mui/material';
import { authService } from '../../services/api';
import api from '../../services/api';

const InvitedRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitedUserData, setInvitedUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Verify token and get invited user data
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        setLoading(true);
        
        // Add this endpoint to your authController
        const response = await api.get(`/auth/verify-invitation/${token}`);
        
        // Set the email if it exists
        if (response.data.user && response.data.user.email) {
          setFormData(prev => ({
            ...prev,
            email: response.data.user.email
          }));
        }
        
        setInvitedUserData(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('This invitation link is invalid or has expired.');
        setLoading(false);
      }
    };
    
    if (token) {
      verifyInvitation();
    } else {
      setError('Invalid invitation link.');
      setLoading(false);
    }
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      // Add this endpoint to your authController
      const response = await api.post('/auth/complete-invitation', {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      // Show success message
      setSuccess(true);
      
      // Auto-login the user
      if (response.data.token) {
        localStorage.setItem('timetracker_token', response.data.token);
        
        // Navigate to the appropriate dashboard after a brief delay
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === 'manager') {
            navigate('/dashboard');
          } else {
            navigate('/time-clock');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      setError(error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Verifying your invitation...</Typography>
      </Container>
    );
  }
  
  if (error && !invitedUserData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Complete Your Registration
        </Typography>
        
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Registration completed successfully! Redirecting to dashboard...
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={Boolean(invitedUserData?.email)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default InvitedRegistration;