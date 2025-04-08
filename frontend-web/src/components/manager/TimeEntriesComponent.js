import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Avatar,
  TablePagination,
  Tooltip,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Autocomplete,
  Button
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SortIcon from '@mui/icons-material/Sort';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';

const TimeEntriesComponent = ({ timeEntries = [], employees = [] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [groupBy, setGroupBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  
  // Local filtering (in addition to any parent component filtering)
  const [localFilter, setLocalFilter] = useState({
    status: '',
    date: ''
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle local filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status chip color
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

  // Format date for clean display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Format time for clean display
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get employee name by ID (for manager dashboard)
  const getEmployeeName = (userId) => {
    if (!userId) return 'Unknown';
    
    const employee = employees.find(emp => emp.id === userId);
    return employee 
      ? `${employee.firstName} ${employee.lastName}`
      : 'Unknown';
  };
  
  // Get employee initials for avatar
  const getEmployeeInitials = (userId) => {
    if (!userId) return 'UN';
    
    const employee = employees.find(emp => emp.id === userId);
    return employee 
      ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
      : 'UN';
  };
  
  // Get avatar color based on employee ID
  const getAvatarColor = (id) => {
    if (!id) return '#757575';
    
    const colors = ['#3f51b5', '#f44336', '#009688', '#ff9800', '#9c27b0', '#2196f3'];
    const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };
  
  // Apply local filtering
  const filteredEntries = timeEntries.filter(entry => {
    if (!entry.clockInTime) return false;
    
    const employeeName = entry.User 
      ? `${entry.User.firstName} ${entry.User.lastName}`.toLowerCase() 
      : getEmployeeName(entry.UserId).toLowerCase();
    
    // Fix for date handling - use UTC methods to avoid timezone issues
    const entryDate = new Date(entry.clockInTime);
    const entryDateString = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
    
    // If localFilter.date is specified, use string comparison rather than Date objects
    const filterDateString = localFilter.date || '';
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      // Search query
      (searchQuery === '' || employeeName.includes(searchLower)) &&
      // Status filter
      (localFilter.status === '' || entry.status === localFilter.status) &&
      // Date filter (using string comparison to avoid timezone issues)
      (filterDateString === '' || entryDateString === filterDateString)
    );
  });
  
  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateA = new Date(a.clockInTime);
    const dateB = new Date(b.clockInTime);
    
    return sortOrder === 'asc' 
      ? dateA - dateB 
      : dateB - dateA;
  });
  
  // Group entries by date
  const groupEntriesByDate = () => {
    const grouped = {};
    
    sortedEntries.forEach(entry => {
      const date = new Date(entry.clockInTime).toDateString();
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(entry);
    });
    
    // Sort dates according to current sort order
    return Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      })
      .map(date => ({
        date,
        entries: grouped[date]
      }));
  };
  
  // Group entries by employee
  const groupEntriesByEmployee = () => {
    const grouped = {};
    
    sortedEntries.forEach(entry => {
      const employeeId = entry.User?.id || entry.UserId;
      
      if (!grouped[employeeId]) {
        grouped[employeeId] = [];
      }
      
      grouped[employeeId].push(entry);
    });
    
    // Sort by employee name
    return Object.keys(grouped)
      .map(id => ({
        id,
        name: getEmployeeName(id),
        entries: grouped[id].sort((a, b) => {
          const dateA = new Date(a.clockInTime);
          const dateB = new Date(b.clockInTime);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        })
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  
  // Set today's date for quick filtering
  const setTodayFilter = () => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setLocalFilter(prev => ({ ...prev, date: todayFormatted }));
  };
  
  // Clear filters
  const clearFilters = () => {
    setLocalFilter({ status: '', date: '' });
    setSearchQuery('');
  };
  
  // Table view tab
  const tableViewTab = () => (
    <Box>
      {/* Filter and search controls */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        gap: 1
      }}>
        <TextField
          placeholder="Search employees..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <TextField
            select
            size="small"
            name="status"
            label="Status"
            value={localFilter.status}
            onChange={handleFilterChange}
            variant="outlined"
            sx={{ width: { xs: '100%', sm: 120 } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="clocked_in">Clocked In</MenuItem>
            <MenuItem value="on_break">On Break</MenuItem>
            <MenuItem value="clocked_out">Clocked Out</MenuItem>
          </TextField>
          
          <TextField
            size="small"
            type="date"
            name="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={localFilter.date}
            onChange={handleFilterChange}
            variant="outlined"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
          
          <Button
            size="small"
            startIcon={<TodayIcon />}
            variant="outlined"
            onClick={setTodayFilter}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Today
          </Button>
          
          <Button
            size="small"
            startIcon={<SortIcon />}
            variant="outlined"
            onClick={toggleSortOrder}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>
          
          <Button
            size="small"
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={clearFilters}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>
      
      {/* Time entries table */}
      <TableContainer sx={{ height: 'calc(100vh - 350px)', minHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Clock In/Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No time entries found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedEntries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((entry, index) => (
                  <TableRow key={entry.id || index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getAvatarColor(entry.User?.id || entry.UserId),
                            width: 28, 
                            height: 28,
                            fontSize: '0.8rem',
                            mr: 1
                          }}
                        >
                          {getEmployeeInitials(entry.User?.id || entry.UserId)}
                        </Avatar>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                          {entry.User ? `${entry.User.firstName} ${entry.User.lastName}` : getEmployeeName(entry.UserId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(entry.clockInTime)}</TableCell>
                    <TableCell>
                      <Tooltip title="Clock In Time">
                        <Typography variant="body2" component="span">
                          {formatTime(entry.clockInTime)}
                        </Typography>
                      </Tooltip>
                      {entry.clockOutTime && (
                        <>
                          <Typography variant="body2" component="span" color="text.secondary"> - </Typography>
                          <Tooltip title="Clock Out Time">
                            <Typography variant="body2" component="span">
                              {formatTime(entry.clockOutTime)}
                            </Typography>
                          </Tooltip>
                        </>
                      )}
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
      
      <TablePagination
        component="div"
        count={sortedEntries.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
  
  // Grouped view tab
  const groupedViewTab = () => {
    // Group entries by date or employee
    const groupedData = tabValue === 1 && groupBy === 'date' 
      ? groupEntriesByDate() 
      : groupEntriesByEmployee();
    
    return (
      <Box>
        {/* View options */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          gap: 1
        }}>
          <TextField
            select
            size="small"
            label="Group By"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            sx={{ width: { xs: '100%', sm: 150 } }}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
          </TextField>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              size="small"
              type="date"
              name="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={localFilter.date}
              onChange={handleFilterChange}
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
            
            <TextField
              select
              size="small"
              name="status"
              label="Status"
              value={localFilter.status}
              onChange={handleFilterChange}
              sx={{ width: { xs: '100%', sm: 120 } }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="clocked_in">Clocked In</MenuItem>
              <MenuItem value="on_break">On Break</MenuItem>
              <MenuItem value="clocked_out">Clocked Out</MenuItem>
            </TextField>
            
            <Button
              size="small"
              startIcon={<TodayIcon />}
              variant="outlined"
              onClick={setTodayFilter}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Today
            </Button>
            
            <Button
              size="small"
              startIcon={<SortIcon />}
              variant="outlined"
              onClick={toggleSortOrder}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
            
            <Button
              size="small"
              startIcon={<FilterListIcon />}
              variant="outlined"
              onClick={clearFilters}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Clear
            </Button>
          </Box>
        </Box>
        
        {/* Grouped content */}
        <Box sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
          {groupBy === 'date' ? (
            // Group by date
            groupedData.map((group, groupIndex) => (
              <Paper 
                key={groupIndex} 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  border: '1px solid #eee',
                  borderLeft: '4px solid #3f51b5'
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                  {formatDate(group.date)}
                  <Chip 
                    size="small" 
                    label={`${group.entries.length} entries`}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.entries.map((entry, entryIndex) => (
                        <TableRow key={entryIndex} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getAvatarColor(entry.User?.id || entry.UserId),
                                  width: 24, 
                                  height: 24,
                                  fontSize: '0.7rem',
                                  mr: 1
                                }}
                              >
                                {getEmployeeInitials(entry.User?.id || entry.UserId)}
                              </Avatar>
                              <Typography variant="body2" noWrap>
                                {entry.User ? `${entry.User.firstName} ${entry.User.lastName}` : getEmployeeName(entry.UserId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {formatTime(entry.clockInTime)}
                            {entry.clockOutTime && (
                              <> - {formatTime(entry.clockOutTime)}</>
                            )}
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
              </Paper>
            ))
          ) : (
            // Group by employee
            groupedData.map((group, groupIndex) => (
              <Paper 
                key={groupIndex} 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  border: '1px solid #eee',
                  borderLeft: '4px solid #3f51b5'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(group.id),
                      mr: 1
                    }}
                  >
                    {getEmployeeInitials(group.id)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {group.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        size="small" 
                        label={`${group.entries.length} entries`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Total: {group.entries.reduce((sum, entry) => sum + Number(entry.totalHoursWorked || 0), 0).toFixed(2)} hours
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.entries.map((entry, entryIndex) => (
                        <TableRow key={entryIndex} hover>
                          <TableCell>{formatDate(entry.clockInTime)}</TableCell>
                          <TableCell>
                            {formatTime(entry.clockInTime)}
                            {entry.clockOutTime && (
                              <> - {formatTime(entry.clockOutTime)}</>
                            )}
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
              </Paper>
            ))
          )}
          
          {groupedData.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No time entries found matching your filters
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1 }} color="primary" />
          Time Entries
        </Typography>
        
        <Box>
          {sortedEntries.length > 0 && (
            <Tooltip title="Total entries">
              <Chip 
                label={`${sortedEntries.length} entries`} 
                size="small"
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Tabs for different views */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Table View" icon={<EventNoteIcon />} iconPosition="start" />
          <Tab label="Grouped View" icon={<DateRangeIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      {tabValue === 0 && tableViewTab()}
      {tabValue === 1 && groupedViewTab()}
    </Paper>
  );
};

export default TimeEntriesComponent;