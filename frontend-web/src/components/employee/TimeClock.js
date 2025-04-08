import React, { useState, useEffect, useContext } from 'react';

import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  ThemeProvider,
  createTheme
} from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import LogoutIcon from '@mui/icons-material/Logout';
import { timeEntryService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AppDownloadInfo from '../common/AppDownloadInfo';

// Create a consistent theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // A pleasant blue
    },
    secondary: {
      main: '#4caf50', // A refreshing green
    },
    success: {
      main: '#43a047', // Green for clocked in
    },
    warning: {
      main: '#ff9800', // Orange for break
    },
    error: {
      main: '#e53935', // Red for clocked out
    },
    background: {
      default: '#f5f5f5'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
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

const TimeClock = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('clocked_out');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { currentUser, logout } = useContext(AuthContext);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const { data } = await timeEntryService.getUserEntries();
      setTimeEntries(data.timeEntries);
      
      // Check current status
      const activeEntry = data.timeEntries.find(entry => 
        entry.status === 'clocked_in' || entry.status === 'on_break'
      );
      
      if (activeEntry) {
        setCurrentStatus(activeEntry.status);
      } else {
        setCurrentStatus('clocked_out');
      }
    } catch (err) {
      setError('Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const handleClockIn = async () => {
    try {
      await timeEntryService.clockIn();
      fetchTimeEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleStartBreak = async () => {
    try {
      await timeEntryService.startBreak();
      fetchTimeEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      await timeEntryService.endBreak();
      fetchTimeEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end break');
    }
  };

  const handleClockOut = async () => {
    try {
      await timeEntryService.clockOut();
      fetchTimeEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clock out');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Helper function to get status chip color
  const getStatusColor = (status) => {
    switch(status) {
      case 'clocked_in': return 'success';
      case 'on_break': return 'warning';
      case 'clocked_out': return 'error';
      default: return 'default';
    }
  };

  // Format the status text for display
  const formatStatus = (status) => {
    switch(status) {
      case 'clocked_in': return 'Clocked In';
      case 'on_break': return 'On Break';
      case 'clocked_out': return 'Clocked Out';
      default: return status?.replace('_', ' ');
    }
  };

  if (loading) return (
    <ThemeProvider theme={theme}>
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading your time data...</Typography>
      </Container>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default', 
        pt: { xs: 2, md: 4 }, // Reduced padding on mobile
    pb: { xs: 4, md: 6 },
    px: { xs: 2, md: 3 } // Add horizontal padding that's smaller on mobile
      }}>
         <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  mb: { xs: 2, md: 4 },
  flexDirection: { xs: 'column', sm: 'row' }
}}>
  <Typography variant="h4" component="h1" sx={{ 
    fontWeight: 600,
    fontSize: { xs: '1.75rem', md: '2.125rem' },
    mb: { xs: 1, sm: 0 }
  }}>
    Time Clock
  </Typography>
  <Button 
    variant="outlined" 
    color="inherit" 
    startIcon={<LogoutIcon />}
    onClick={handleLogout}
    size="small"
    sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
  >
    Sign Out
  </Button>
</Box>
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          
          {/* Status Card */}
          <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    Welcome back,
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Typography>
                  <Typography variant="body1">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 3 }}>
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  justifyContent: 'center',
                  alignItems: { xs: 'flex-start', md: 'flex-end' } 
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Current Status
                    </Typography>
                   <Chip 
                      label={formatStatus(currentStatus)} 
                      color={getStatusColor(currentStatus)}
                      sx={{ fontWeight: 600, fontSize: '1rem', py: 2, px: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ 
  display: 'flex', 
  gap: 2, 
  flexWrap: 'wrap',
  justifyContent: { xs: 'center', md: 'flex-end' },
  width: '100%'
}}>
  {currentStatus === 'clocked_out' && (
    <Button 
      variant="contained" 
      color="primary" 
      startIcon={<AccessTimeFilledIcon />}
      onClick={handleClockIn}
      sx={{ 
        flex: { xs: '1 0 100%', sm: '0 1 auto' },
        py: { xs: 1.5, sm: 1 }
      }}
    >
      Clock In
    </Button>
  )}
  
  {currentStatus === 'clocked_in' && (
    <>
      <Button 
        variant="contained" 
        color="warning" 
        startIcon={<PauseCircleIcon />}
        onClick={handleStartBreak}
        sx={{ 
          flex: { xs: '1 0 100%', sm: 'auto' },
          py: { xs: 1.5, sm: 1 },
          mb: { xs: 1, sm: 0 }
        }}
      >
        Start Break
      </Button>
      <Button 
        variant="contained" 
        color="error" 
        startIcon={<LogoutIcon />}
        onClick={handleClockOut}
        sx={{ 
          flex: { xs: '1 0 100%', sm: 'auto' },
          py: { xs: 1.5, sm: 1 }
        }}
      >
        Clock Out
      </Button>
    </>
  )}
  
  {currentStatus === 'on_break' && (
    <>
      <Button 
        variant="contained" 
        color="success" 
        startIcon={<PlayCircleFilledIcon />}
        onClick={handleEndBreak}
        sx={{ 
          flex: { xs: '1 0 100%', sm: 'auto' },
          py: { xs: 1.5, sm: 1 },
          mb: { xs: 1, sm: 0 }
        }}
      >
        End Break
      </Button>
      <Button 
        variant="contained" 
        color="error" 
        startIcon={<LogoutIcon />}
        onClick={handleClockOut}
        sx={{ 
          flex: { xs: '1 0 100%', sm: 'auto' },
          py: { xs: 1.5, sm: 1 }
        }}
      >
        Clock Out
      </Button>
    </>
  )}
</Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Recent Time Entries */}
          <Paper elevation={0} sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Time Entries
            </Typography>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Clock In</TableCell>
                    <TableCell>Clock Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          No time entries yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeEntries.slice(0, 7).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.clockInTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(entry.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {entry.clockOutTime 
                            ? new Date(entry.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={formatStatus(entry.status)}
                            color={getStatusColor(entry.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {entry.totalHoursWorked ? Number(entry.totalHoursWorked).toFixed(2) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
	
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TimeClock;