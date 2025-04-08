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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  useMediaQuery,
  Badge,
  Menu,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Snackbar,
  CircularProgress,
  Tab,
  Tabs,
  Autocomplete,
  Stack
} from '@mui/material';

// Icons
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import SendIcon from '@mui/icons-material/Send';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import BarChartIcon from '@mui/icons-material/BarChart';
import TodayIcon from '@mui/icons-material/Today';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import API from '../../services/api';

import { timeEntryService, invitationService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isWithinInterval, getDay } from 'date-fns';
import ExportEmployeeHours from './ExportEmployeeHours';


const drawerWidth = 240;

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
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
        }
      }
    }
  }
});

// Create a proper axios instance with base URL and auth

const dashboardAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
dashboardAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('timetracker_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const Dashboard = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Notification menu state
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  // Active section state
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Data state
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Week selection state
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(today, { weekStartsOn: 0 }));
  const [currentWeekEnd, setCurrentWeekEnd] = useState(endOfWeek(today, { weekStartsOn: 0 }));

  // Filter state (now using date range from week selection)
  const [filter, setFilter] = useState({
    employee: '',
    status: '',
    dateFrom: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    dateTo: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  });
  
  // Employee Hours Table state
  const [employeeHoursData, setEmployeeHoursData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [hoursFiltersVisible, setHoursFiltersVisible] = useState(false);
  
  // Time entries display state
  const [timeEntriesData, setTimeEntriesData] = useState([]);
  const [timeEntriesFiltersVisible, setTimeEntriesFiltersVisible] = useState(false);
  
  // Settings state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Invite state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const { currentUser, logout } = useContext(AuthContext);

  // Set drawer state based on screen size
  useEffect(() => {
    setDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const handleDrawerToggle = () => {
    if (isSmallScreen) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    
    // Mark all as read when opening
    if (notifications.length > 0) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
      setNotificationCount(0);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  // Week navigation functions
  const goToNextWeek = () => {
    const nextWeekStart = addWeeks(currentWeekStart, 1);
    const nextWeekEnd = addWeeks(currentWeekEnd, 1);
    
    setCurrentWeekStart(nextWeekStart);
    setCurrentWeekEnd(nextWeekEnd);
    
    setFilter(prev => ({
      ...prev,
      dateFrom: format(nextWeekStart, 'yyyy-MM-dd'),
      dateTo: format(nextWeekEnd, 'yyyy-MM-dd')
    }));
  };

  const goToPreviousWeek = () => {
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const prevWeekEnd = subWeeks(currentWeekEnd, 1);
    
    setCurrentWeekStart(prevWeekStart);
    setCurrentWeekEnd(prevWeekEnd);
    
    setFilter(prev => ({
      ...prev,
      dateFrom: format(prevWeekStart, 'yyyy-MM-dd'),
      dateTo: format(prevWeekEnd, 'yyyy-MM-dd')
    }));
  };
    
  const goToCurrentWeek = () => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
    
    setCurrentWeekStart(thisWeekStart);
    setCurrentWeekEnd(thisWeekEnd);
    
    setFilter(prev => ({
      ...prev,
      dateFrom: format(thisWeekStart, 'yyyy-MM-dd'),
      dateTo: format(thisWeekEnd, 'yyyy-MM-dd')
    }));
  };

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [activeRes, entriesRes] = await Promise.all([
        timeEntryService.getActiveEmployees(),
        timeEntryService.getAllEntries()
      ]);
      
      console.log('Active employees:', activeRes.data);
      console.log('All time entries:', entriesRes.data);
      
      setActiveEmployees(activeRes.data.activeEmployees || []);
      setAllTimeEntries(entriesRes.data.timeEntries || []);
      
      // Extract unique employees from time entries
      const uniqueEmployees = new Map();
      if (entriesRes.data.timeEntries) {
        entriesRes.data.timeEntries.forEach(entry => {
          if (entry.User) {
            uniqueEmployees.set(entry.User.id, entry.User);
          }
        });
      }
      setEmployees(Array.from(uniqueEmployees.values()));
      
      // Generate sample notifications
      fetchNotifications();
      
      // Process employee hours data
      processEmployeeHoursData(entriesRes.data.timeEntries || [], Array.from(uniqueEmployees.values()));
      
      // Process time entries data for the structured view
      processTimeEntriesData(entriesRes.data.timeEntries || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Process the time entries data for the time entries table
  const processTimeEntriesData = (timeEntries) => {
    // Group entries by date
    const entriesByDate = {};
    
    // Filter entries based on current filter
    const filteredEntries = timeEntries.filter(entry => {
      if (!entry.clockInTime) return false;
      
      const entryDate = new Date(entry.clockInTime);
      const entryDateStr = format(entryDate, 'yyyy-MM-dd');
      
      // Employee filter
      if (filter.employee && entry.User?.id !== filter.employee && entry.UserId !== filter.employee) {
        return false;
      }
      
      // Status filter
      if (filter.status && entry.status !== filter.status) {
        return false;
      }
      
      // Date range filter
      if (filter.dateFrom && entryDateStr < filter.dateFrom) {
        return false;
      }
      
      if (filter.dateTo && entryDateStr > filter.dateTo) {
        return false;
      }
      
      return true;
    });
    
    // Group by date
    filteredEntries.forEach(entry => {
      const entryDate = new Date(entry.clockInTime);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = {
          date: entryDate,
          entries: []
        };
      }
      
      entriesByDate[dateKey].entries.push(entry);
    });
    
    // Convert to array and sort by date (newest first)
    const entriesArray = Object.values(entriesByDate).sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    
    setTimeEntriesData(entriesArray);
  };
  
  // Process the time entries data for the horizontal hours table
  const processEmployeeHoursData = (timeEntries, employees) => {
    // Group entries by employee
    const employeeMap = new Map();
    
    // First, process all employees to ensure we include even those without entries
    employees.forEach(employee => {
      employeeMap.set(employee.id, {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName, 
        fullName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        role: employee.role,
        days: {
          sunday: 0,
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0
        },
        totalHours: 0
      });
    });
    // Process all time entries that fall within the selected week
    timeEntries.forEach(entry => {
      if (!entry.clockInTime || !entry.totalHoursWorked) return;
      
      // Get the employee ID (either from User or from UserId)
      const employeeId = entry.User?.id || entry.UserId;
      if (!employeeId) return;
      
      // Get or create employee data
      let employeeData = employeeMap.get(employeeId);
      
      // If we don't have this employee in our map yet (shouldn't happen if employees list is complete)
      if (!employeeData) {
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) return; // Skip if we can't find employee info
        
        employeeData = {
          id: employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          fullName: `${emp.firstName} ${emp.lastName}`,
          email: emp.email || '',
          role: emp.role || '',
          days: {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0
          },
          totalHours: 0
        };
        employeeMap.set(employeeId, employeeData)
      };
      
      // Check if the entry falls within the selected week
      const entryDate = new Date(entry.clockInTime);
      const currentWeekStartDate = new Date(filter.dateFrom);
      const currentWeekEndDate = new Date(filter.dateTo);
      
      // Set time to midnight to avoid time-of-day issues
      currentWeekStartDate.setHours(0, 0, 0, 0);
      currentWeekEndDate.setHours(23, 59, 59, 999);
      
      // Only process entries that fall within the selected week
      if (entryDate >= currentWeekStartDate && entryDate <= currentWeekEndDate) {
        // Create a new Date object using local time to get the correct day of week
        const localDate = new Date(entryDate.getTime());
        const dayOfWeek = localDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Convert day number to day name
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];
        
        // Add hours to the appropriate day
        const hoursWorked = parseFloat(entry.totalHoursWorked) || 0;
        
        employeeData.days[dayName] += hoursWorked;
        employeeData.totalHours += hoursWorked;
      }
    });
    
    // Convert map to array and sort alphabetically by full name
    const employeeDataArray = Array.from(employeeMap.values())
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    
    setEmployeeHoursData(employeeDataArray);
    setFilteredEmployees(employeeDataArray);
  };
  
  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employeeHoursData);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = employeeHoursData.filter(employee => 
      employee.fullName.toLowerCase().includes(query) ||
      (employee.email && employee.email.toLowerCase().includes(query))
    );
    
    setFilteredEmployees(filtered);
  }, [searchQuery, employeeHoursData]);
  
  // Update employee hours data and time entries data when filter changes
  useEffect(() => {
    if (allTimeEntries.length > 0 && employees.length > 0) {
      processEmployeeHoursData(allTimeEntries, employees);
      processTimeEntriesData(allTimeEntries);
    }
  }, [filter, allTimeEntries, employees]);
  
  // Fetch or generate notifications
  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      
      // Format the notifications for display
      const formattedNotifications = response.data.notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.read,
        metadata: notification.metadata
      }));
      
      setNotifications(formattedNotifications);
      setNotificationCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If API fails, show empty notifications
      setNotifications([]);
      setNotificationCount(0);
      
      // In a real app, you would fetch these from your backend
      // For now, let's generate some sample notifications
      const sampleNotifications = [
        {
          id: 1,
          type: 'overtime',
          message: '3 employees are approaching overtime',
          timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 2,
          type: 'new_employee',
          user: { id: '456', firstName: 'Emma', lastName: 'Wilson' },
          message: 'has joined the team',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      
      setNotifications(sampleNotifications);
      setNotificationCount(sampleNotifications.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh active employees every minute
    const interval = setInterval(() => {
      timeEntryService.getActiveEmployees()
        .then(res => setActiveEmployees(res.data.activeEmployees || []))
        .catch(err => console.error('Failed to refresh active employees:', err));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    // When clearing filters, keep the date range but clear other filters
    setFilter(prev => ({
      ...prev,
      employee: '',
      status: '',
    }));
    setSearchQuery('');
  };
  
  // Handle change password
  const handleChangePassword = async () => {
    // Reset previous errors/success
    setPasswordError('');
    setPasswordSuccess(false);
    
    // Validate passwords
    if (!oldPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      console.log('Attempting to change password...');
      
      // Use the imported API instance 
      const response = await API.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      
      console.log('Password change response:', response.data);
      
      // Reset form and show success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };
  
  // Handle invite employee
  const handleInviteEmployee = async () => {
    // Reset previous states
    setInviteError('');
    setInviteSuccess(false);
    setInviteLoading(true);

    // Validate inputs
    if (!inviteEmail && !invitePhone) {
      setInviteError('Please provide either an email or phone number');
      setInviteLoading(false);
      return;
    }

    if (inviteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Please enter a valid email address');
      setInviteLoading(false);
      return;
    }

    if (invitePhone && !/^\+?\d{10,15}$/.test(invitePhone.replace(/[()-\s]/g, ''))) {
      setInviteError('Please enter a valid phone number');
      setInviteLoading(false);
      return;
    }

    try {
      // Prepare the invitation data
      const invitationData = {
        email: inviteEmail || null,
        phone: invitePhone || null,
        role: inviteRole
      };

      // Call the API to send the invitation
      const response = await invitationService.inviteEmployee(invitationData);
      console.log('Invitation response:', response.data);

      // Create a new notification
      const newNotification = {
        id: Date.now(),
        type: 'invitation',
        message: `Invitation sent to ${inviteEmail || invitePhone}`,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Update notifications
      setNotifications(prev => [newNotification, ...prev]);
      setNotificationCount(prev => prev + 1);

      // Reset form and show success
      setInviteEmail('');
      setInvitePhone('');
      setInviteRole('employee');
      setInviteSuccess(true);

      // Display the invitation link for testing (in development only)
      if (process.env.NODE_ENV === 'development' && response.data.invitationUrl) {
        console.log('Invitation URL for testing:', response.data.invitationUrl);
      }

      // Close dialog after a delay
      setTimeout(() => {
        setInviteDialogOpen(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Full error object:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        setInviteError(
          error.response.data.message || 
          `Failed to send invitation. Server responded with status ${error.response.status}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setInviteError('No response received from the server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setInviteError(`Failed to send invitation: ${error.message}`);
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredEntries = allTimeEntries.filter(entry => {
    if (!entry.clockInTime) return false;
    
    // Fix for date handling - use string comparison for dates
    const entryDate = new Date(entry.clockInTime);
    const entryDateString = format(entryDate, 'yyyy-MM-dd');
    
    return (
      // Employee filter
      (!filter.employee || (entry.User && entry.User.id === filter.employee) || entry.UserId === filter.employee) &&
      // Status filter
      (!filter.status || entry.status === filter.status) &&
      // Date from filter (using string comparison)
      (!filter.dateFrom || entryDateString >= filter.dateFrom) &&
      // Date to filter (using string comparison)
      (!filter.dateTo || entryDateString <= filter.dateTo)
    );
  });
  
  // Calculate total hours
  const totalHours = filteredEntries.reduce((sum, entry) => sum + Number(entry.totalHoursWorked || 0), 0);
  
  // Count total employees
  const totalEmployeeCount = employees.length;
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    }
    
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    
    return 'Just now';
  };
  
  // Format hour cell content
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '-';
    return hours.toFixed(1);
  };
  
  // Get cell background color based on hours
  const getCellColor = (hours) => {
    if (!hours || hours === 0) return 'inherit';
    
    // Color scale based on hours worked
    if (hours < 2) return '#e3f2fd'; // Very light blue
    if (hours < 4) return '#bbdefb'; // Light blue
    if (hours < 6) return '#90caf9'; // Medium blue
    if (hours < 8) return '#64b5f6'; // Moderate blue
    return '#42a5f5'; // Darker blue for 8+ hours
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'h:mm a');
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'clocked_in': return 'success';
      case 'on_break': return 'warning';
      case 'clocked_out': return 'error';
      default: return 'default';
    }
  };
  
  // Format status text
  const formatStatus = (status) => {
    switch(status) {
      case 'clocked_in': return 'Clocked In';
      case 'on_break': return 'On Break';
      case 'clocked_out': return 'Clocked Out';
      default: return status?.replace('_', ' ');
    }
  };
  
  // Get employee name by ID
  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  // Loading state check
  if (loading) return (
      <ThemeProvider theme={theme}>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>Loading dashboard data...</Typography>
        </Container>
      </ThemeProvider>
    );

 
  const drawer = (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        pb: 1
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center' 
          }}
        >
          <AccessTimeIcon sx={{ mr: 1 }} />
          Time Tracker
        </Typography>
        {isSmallScreen && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ px: 2, py: 1 }}>
        <ListItem 
          button 
          selected={activeSection === 'dashboard'} 
          onClick={() => setActiveSection('dashboard')}
          sx={{ mb: 1 }}
        >
          <ListItemIcon>
            <DashboardIcon color={activeSection === 'dashboard' ? 'primary' : 'action'} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeSection === 'employees'} 
          onClick={() => setActiveSection('employees')}
          sx={{ mb: 1 }}
        >
          <ListItemIcon>
            <GroupIcon color={activeSection === 'employees' ? 'primary' : 'action'} />
          </ListItemIcon>
          <ListItemText primary="Employees" />
        </ListItem>
      </List>
      <Divider />
      <List sx={{ px: 2, py: 1 }}>
        <ListItem 
          button 
          selected={activeSection === 'settings'} 
          onClick={() => setActiveSection('settings')}
          sx={{ mb: 1 }}
        >
          <ListItemIcon>
            <SettingsIcon color={activeSection === 'settings' ? 'primary' : 'action'} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {activeSection === 'dashboard' && 'Manager Dashboard'}
             
              {activeSection === 'employees' && 'Employee Management'}
              {activeSection === 'settings' && 'Settings'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                sx={{ 
                  mr: 2,
                  display: { xs: 'none', md: 'block' },
                  background: '#f5f5f5',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit" 
                  sx={{ mr: 1 }}
                  onClick={handleNotificationOpen}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title={`${currentUser?.firstName} ${currentUser?.lastName}`}>
                <IconButton 
                  color="inherit" 
                  onClick={handleUserMenuOpen}
                  sx={{ 
                    p: 0.5,
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{ 
            sx: { 
              width: 320, 
              maxHeight: 400,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 2
            } 
          }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              notifications.map(notification => (
                <React.Fragment key={notification.id}>
                  <ListItem sx={{ px: 2, py: 1.5, bgcolor: notification.read ? 'transparent' : 'rgba(63, 81, 181, 0.08)' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: notification.type === 'missed_shift' ? 'error.main' : 
                                 notification.type === 'overtime' ? 'warning.main' : 
                                 notification.type === 'invitation' ? 'success.main' : 'primary.main' 
                      }}>
                        {notification.type === 'missed_shift' && <PersonIcon fontSize="small" />}
                        {notification.type === 'overtime' && <AccessTimeIcon fontSize="small" />}
                        {notification.type === 'new_employee' && <PersonIcon fontSize="small" />}
                        {notification.type === 'invitation' && <EmailIcon fontSize="small" />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                          {notification.user ? (
                            <Box component="span">
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                {notification.user.firstName} {notification.user.lastName}
                              </Box>
                              {" " + notification.message}
                            </Box>
                          ) : (
                            notification.message
                          )}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </Box>
          <Box sx={{ p: 1 }}>
            <Button 
              fullWidth 
              size="small" 
              sx={{ textTransform: 'none' }}
            >
              View all notifications
            </Button>
          </Box>
        </Menu>
        
        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{ 
            sx: { 
              width: 220,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 2
            }
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={() => {
            setActiveSection('settings');
            handleUserMenuClose();
          }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </MenuItem>
        </Menu>
        
        {/* Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          {isSmallScreen && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
          )}
          
          {/* Desktop drawer */}
          {!isSmallScreen && (
            <Drawer
              variant="persistent"
              open={drawerOpen}
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: drawerWidth,
                  borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: 'none'
                },
              }}
            >
              {drawer}
            </Drawer>
          )}
        </Box>
        
        {/* Main content */}
      <Box
  component="main"
  sx={{ 
    flexGrow: 1, 
    p: 3, 
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    width: '100%', // Changed from conditional width
    overflow: 'hidden', // Add this line to prevent horizontal scrolling
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }}
>
          <Toolbar /> {/* Spacer for app bar */}
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          
          {/* Dashboard Content */}
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                          <GroupIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {totalEmployeeCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Employees
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 1.5 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {activeEmployees.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Employees
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', mr: 1.5 }}>
                          <AccessTimeIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {totalHours.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Hours (Selected Week)
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Week Selection Bar */}
<Paper elevation={0} sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <CalendarTodayIcon color="primary" sx={{ mr: 2 }} />
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Week of {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
    </Typography>
  </Box>
  
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, px: 1 }}>
      <IconButton onClick={goToPreviousWeek} size="small" aria-label="Previous week">
        <NavigateBeforeIcon />
      </IconButton>
      
      <Button 
        variant="text" 
        size="small"
        onClick={goToCurrentWeek}
        startIcon={<TodayIcon />}
        sx={{ mx: 1 }}
      >
        Current Week
      </Button>
      
      <IconButton onClick={goToNextWeek} size="small" aria-label="Next week">
        <NavigateNextIcon />
      </IconButton>
    </Box>
    
    <ExportEmployeeHours 
      timeEntries={allTimeEntries} 
      employees={employees}
    />
  </Box>
</Paper>
              
              {/* Employee Hours Table */}
              <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} color="primary" />
                    Employee Work Hours
                  </Typography>
                  
                  <Stack direction="row" spacing={1}>
                    <TextField
                      placeholder="Search employees..."
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<FilterListIcon />}
                      onClick={() => setHoursFiltersVisible(!hoursFiltersVisible)}
                    >
                      Filters
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Box>
                
                {hoursFiltersVisible && (
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                      select
                      label="Employee Status"
                      size="small"
                      name="status"
                      value={filter.status}
                      onChange={handleFilterChange}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="clocked_in">Clocked In</MenuItem>
                      <MenuItem value="on_break">On Break</MenuItem>
                      <MenuItem value="clocked_out">Clocked Out</MenuItem>
                    </TextField>
                    
                    <TextField
                      select
                      label="Filter Employee"
                      size="small"
                      name="employee"
                      value={filter.employee}
                      onChange={handleFilterChange}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    <Chip 
                      label={filteredEmployees.length > 0 
                        ? `${filteredEmployees.length} employees` 
                        : 'No employees found'
                      }
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
                
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 800 }}>
                   <TableHead>
  <TableRow>
    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Employee</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sunday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Monday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tuesday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Wednesday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thursday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Friday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Saturday</TableCell>
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
  </TableRow>
</TableHead>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <Typography color="text.secondary" sx={{ py: 2 }}>
                              No employee hours data found for the selected period
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees.map((employee) => (
                          <TableRow key={employee.id} hover>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {employee.fullName}
                            </TableCell>
                            <TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.sunday),
    fontWeight: employee.days.sunday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.sunday > 0 ? `${employee.days.sunday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.sunday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.monday),
    fontWeight: employee.days.monday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.monday > 0 ? `${employee.days.monday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.monday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.tuesday),
    fontWeight: employee.days.tuesday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.tuesday > 0 ? `${employee.days.tuesday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.tuesday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.wednesday),
    fontWeight: employee.days.wednesday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.wednesday > 0 ? `${employee.days.wednesday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.wednesday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.thursday),
    fontWeight: employee.days.thursday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.thursday > 0 ? `${employee.days.thursday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.thursday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.friday),
    fontWeight: employee.days.friday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.friday > 0 ? `${employee.days.friday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.friday)}</Box>
  </Tooltip>
</TableCell>
<TableCell 
  align="center"
  sx={{ 
    bgcolor: getCellColor(employee.days.saturday),
    fontWeight: employee.days.saturday > 0 ? 500 : 400 
  }}
>
  <Tooltip title={employee.days.saturday > 0 ? `${employee.days.saturday.toFixed(2)} hours` : 'No hours logged'}>
    <Box>{formatHours(employee.days.saturday)}</Box>
  </Tooltip>
</TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                bgcolor: getCellColor(employee.days.sunday),
                                fontWeight: employee.days.sunday > 0 ? 500 : 400 
                              }}
                            >
                              <Tooltip title={employee.days.sunday > 0 ? `${employee.days.sunday.toFixed(2)} hours` : 'No hours logged'}>
                                <Box>{formatHours(employee.days.sunday)}</Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                fontWeight: 700, 
                                bgcolor: employee.totalHours > 0 ? '#e8f5e9' : 'inherit'
                              }}
                            >
                              {employee.totalHours > 0 ? employee.totalHours.toFixed(1) : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              
              {/* Active Employees */}
              <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Currently Active Employees ({activeEmployees.length})
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<InsertInvitationIcon />}
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    Invite Employee
                  </Button>
                </Box>
                
                {activeEmployees.length === 0 ? (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No employees currently active
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Since</TableCell>
                          <TableCell>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeEmployees.map(entry => {
                          return (
                            <TableRow key={entry.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: entry.status === 'clocked_in' ? 'success.main' : 'warning.main',
                                      width: 32, 
                                      height: 32,
                                      mr: 1,
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {entry.User?.firstName?.[0]}{entry.User?.lastName?.[0]}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {entry.User?.firstName} {entry.User?.lastName}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={formatStatus(entry.status)}
                                  color={getStatusColor(entry.status)}
                                />
                              </TableCell>
                              <TableCell>
                                {formatTime(
                                  entry.status === 'on_break' ? entry.breakStartTime : entry.clockInTime
                                )}
                              </TableCell>
                              <TableCell>{entry.User?.email}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
              
              {/* Time Entries in Structured Format */}
              <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3 
                }}>
                  
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<FilterListIcon />}
                      onClick={() => setTimeEntriesFiltersVisible(!timeEntriesFiltersVisible)}
                    >
                      Filters
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<TodayIcon />}
                      onClick={goToCurrentWeek}
                    >
                      This Week
                    </Button>
                  </Box>
                </Box>
                
                {timeEntriesFiltersVisible && (
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                      select
                      label="Status"
                      size="small"
                      name="status"
                      value={filter.status}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="clocked_in">Clocked In</MenuItem>
                      <MenuItem value="on_break">On Break</MenuItem>
                      <MenuItem value="clocked_out">Clocked Out</MenuItem>
                    </TextField>
                    
                    <TextField
                      select
                      label="Employee"
                      size="small"
                      name="employee"
                      value={filter.employee}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    <Chip 
                      label={filteredEntries.length > 0 
                        ? `${filteredEntries.length} entries` 
                        : 'No entries found'
}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
                
                {timeEntriesData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No time entries found for the selected period
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {timeEntriesData.map((dateGroup, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          pb: 1,
                          borderBottom: '1px solid #eee'
                        }}>
                          <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {format(dateGroup.date, 'EEEE, MMMM d, yyyy')}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={`${dateGroup.entries.length} entries`}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                        
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Clock In</TableCell>
                                <TableCell>Clock Out</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Hours</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {dateGroup.entries.map((entry, entryIndex) => (
                                <TableRow key={entryIndex} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Avatar 
                                        sx={{ 
                                          width: 28, 
                                          height: 28,
                                          mr: 1,
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        {entry.User ? 
                                          `${entry.User.firstName[0]}${entry.User.lastName[0]}` : 
                                          getEmployeeName(entry.UserId).split(' ').map(n => n[0]).join('')
                                        }
                                      </Avatar>
                                      <Typography variant="body2">
                                        {entry.User ? 
                                          `${entry.User.firstName} ${entry.User.lastName}` : 
                                          getEmployeeName(entry.UserId)
                                        }
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                                  <TableCell>
                                    {entry.clockOutTime ? formatTime(entry.clockOutTime) : '-'}
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
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </>
          )}
          
         
         
          {/* Employees Content */}
          {activeSection === 'employees' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Employee Management
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PeopleIcon />}
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Invite Employee
                </Button>
              </Box>
              
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map(employee => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                mr: 1,
                                fontSize: '0.8rem'
                              }}
                            >
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {employee.firstName} {employee.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={employee.role === 'manager' ? 'Manager' : 'Employee'}
                            color={employee.role === 'manager' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {activeEmployees.some(entry => entry.User?.id === employee.id) ? (
                            <Chip 
                              size="small" 
                              label="Active" 
                              color="success"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="Inactive" 
                              color="default"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSearchQuery(employee.firstName + ' ' + employee.lastName);
                              setActiveSection('dashboard');
                            }}
                          >
                            View Hours
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Settings Content */}
          {activeSection === 'settings' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        <LockIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Security
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Last login: {new Date().toLocaleString()}
                        </Typography>
                        
                        <Button 
                          variant="outlined"
                          color="primary"
                          onClick={() => setPasswordDialogOpen(true)}
                          startIcon={<KeyIcon />}
                        >
                          Change Password
                        </Button>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        <AlternateEmailIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Contact Information
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography>{currentUser?.email}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Role</Typography>
                        <Typography sx={{ textTransform: 'capitalize' }}>{currentUser?.role}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        <WorkIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Team Management
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Invite new employees to join your team
                        </Typography>
                        
                        <Button 
                          variant="contained"
                          color="primary"
                          onClick={() => setInviteDialogOpen(true)}
                          startIcon={<EmailIcon />}
                        >
                          Invite Employee
                        </Button>
                      </Box>
                      
                      <Box>
                        <Typography color="text.secondary">
                          Team size: {employees.length} employee{employees.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => !passwordSuccess && setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Password
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password changed successfully!
            </Alert>
          )}
          
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="current-password">Current Password</InputLabel>
              <OutlinedInput
                id="current-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                label="Current Password"
                disabled={passwordSuccess}
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="new-password">New Password</InputLabel>
              <OutlinedInput
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="New Password"
                disabled={passwordSuccess}
              />
              <FormHelperText>
                Password must be at least 8 characters long
              </FormHelperText>
            </FormControl>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
              <OutlinedInput
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="Confirm New Password"
                disabled={passwordSuccess}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialogOpen(false)} 
            color="inherit"
            disabled={passwordSuccess}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={passwordSuccess}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Invite Employee Dialog */}
      <Dialog 
        open={inviteDialogOpen} 
        onClose={() => !inviteSuccess && !inviteLoading && setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Invite Employee
        </DialogTitle>
        <DialogContent>
          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          
          {inviteSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Invitation sent successfully!
            </Alert>
          )}
          
          <Typography color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Send an invitation link to a new employee via email or SMS.
          </Typography>
          
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="invite-email">Email Address</InputLabel>
              <OutlinedInput
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                label="Email Address"
                disabled={inviteSuccess || inviteLoading}
                startAdornment={
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                }
              />
            </FormControl>
            
            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>
              OR
            </Typography>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="invite-phone">Phone Number</InputLabel>
              <OutlinedInput
                id="invite-phone"
                type="tel"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                label="Phone Number"
                disabled={inviteSuccess || inviteLoading}
                startAdornment={
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                }
              />
              <FormHelperText>
                Include country code (e.g., +1 for US)
              </FormHelperText>
            </FormControl>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="invite-role">Role</InputLabel>
              <OutlinedInput
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                label="Role"
                select
                disabled={inviteSuccess || inviteLoading}
                input={<OutlinedInput label="Role" />}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </OutlinedInput>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setInviteDialogOpen(false)} 
            color="inherit"
            disabled={inviteSuccess || inviteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInviteEmployee}
            variant="contained"
            color="primary"
            disabled={inviteSuccess || inviteLoading}
            startIcon={inviteLoading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {inviteLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};


export default Dashboard;
