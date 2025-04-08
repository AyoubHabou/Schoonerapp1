import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Box,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoIcon from '@mui/icons-material/Info';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';

const ExportEmployeeHours = ({ timeEntries, employees }) => {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [weekOffset, setWeekOffset] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [templateMode, setTemplateMode] = useState(true);
  
  // Calculate the current week dates based on the offset
  const calculateWeekDates = (offset) => {
    const now = new Date();
    const baseDate = offset === 0 ? now : subWeeks(now, Math.abs(offset));
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(baseDate, { weekStartsOn: 0 });
    
    return {
      start: weekStart,
      end: weekEnd,
      formatted: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    };
  };
  
  // Get week options for the dropdown
  const getWeekOptions = () => {
    const options = [];
    
    // Current week and previous 12 weeks
    for (let i = 0; i <= 12; i++) {
      const week = calculateWeekDates(i);
      options.push({
        value: i,
        label: i === 0 ? `Current Week (${week.formatted})` : `${i} Week${i > 1 ? 's' : ''} Ago (${week.formatted})`
      });
    }
    
    return options;
  };
  
  // Handle dialog open/close
  const handleOpen = () => {
    setOpen(true);
    setExportSuccess(false);
  };
  
  const handleClose = () => {
    setOpen(false);
    // Reset success state after closing
    setTimeout(() => setExportSuccess(false), 300);
  };
  
  // Handle the export action
  const handleExport = () => {
    try {
      // Get the week date range
      const weekDates = calculateWeekDates(weekOffset);
      const weekStart = weekDates.start;
      const weekEnd = weekDates.end;
      
      // Get all days of the week
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Create a map to store hours by employee and day
      const employeeHoursMap = new Map();
      
      // Initialize the map with all employees
      employees.forEach(employee => {
        employeeHoursMap.set(employee.id, {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          role: employee.role,
          days: {},
          totalHours: 0
        });
        
        // Initialize days with 0 hours
        daysOfWeek.forEach(day => {
          const dayKey = format(day, 'EEEE').toLowerCase(); // e.g., "sunday", "monday"
          employeeHoursMap.get(employee.id).days[dayKey] = 0;
        });
      });
      
      // Process time entries
      timeEntries.forEach(entry => {
        if (!entry.clockInTime || !entry.totalHoursWorked) return;
        
        const entryDate = new Date(entry.clockInTime);
        
        // Check if entry is within the selected week
        if (!isWithinInterval(entryDate, { start: weekStart, end: weekEnd })) {
          return;
        }
        
        // Get the employee ID
        const employeeId = entry.User?.id || entry.UserId;
        if (!employeeId || !employeeHoursMap.has(employeeId)) {
          return;
        }
        
        // Get the day of the week
        const dayKey = format(entryDate, 'EEEE').toLowerCase();
        
        // Add hours to that day
        const hours = parseFloat(entry.totalHoursWorked) || 0;
        const employeeData = employeeHoursMap.get(employeeId);
        
        employeeData.days[dayKey] += hours;
        employeeData.totalHours += hours;
      });
      
      // Convert map to array and sort by employee name
      const employeeHoursArray = Array.from(employeeHoursMap.values())
        .filter(employee => employee.totalHours > 0) // Only include employees with hours
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      
      // Create a clean header row
      const headerRow = [
        'Employee',
        'Email',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Total Hours'
      ];
      
      // Create data rows
      const dataRows = employeeHoursArray.map(employee => [
        employee.name,
        employee.email,
        employee.days.sunday.toFixed(2),
        employee.days.monday.toFixed(2),
        employee.days.tuesday.toFixed(2),
        employee.days.wednesday.toFixed(2),
        employee.days.thursday.toFixed(2),
        employee.days.friday.toFixed(2),
        employee.days.saturday.toFixed(2),
        employee.totalHours.toFixed(2)
      ]);
      
      // If no data, add a placeholder row
      if (dataRows.length === 0) {
        dataRows.push([
          'No data',
          '',
          '0.00',
          '0.00',
          '0.00',
          '0.00',
          '0.00',
          '0.00',
          '0.00',
          '0.00'
        ]);
      }
      
      // Week identifier for template mode
      const weekLabel = `Week: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      
      let allRows;
      
      if (templateMode) {
        // Template mode format - optimized for copying into a master sheet
        allRows = [
          [weekLabel], // Week identifier as first row
          headerRow,
          ...dataRows,
          [], // Empty row for spacing between weeks
        ];
      } else {
        // Standard format with title
        const titleRow = [`Time Tracker - Employee Hours Summary: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`];
        allRows = [
          titleRow,
          [], // Empty row for spacing
          headerRow,
          ...dataRows
        ];
      }
      
      // Create worksheet from all rows
      const worksheet = XLSX.utils.aoa_to_sheet(allRows);
      
      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Employee
        { wch: 30 }, // Email
        { wch: 10 }, // Sunday
        { wch: 10 }, // Monday
        { wch: 10 }, // Tuesday
        { wch: 10 }, // Wednesday
        { wch: 10 }, // Thursday
        { wch: 10 }, // Friday
        { wch: 10 }, // Saturday
        { wch: 12 }, // Total Hours
      ];
      worksheet['!cols'] = columnWidths;
      
      // Style the title row if not in template mode
      if (!templateMode) {
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]; // Merge title row cells
      }
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Hours');
      
      // Generate a filename
      const templateIndicator = templateMode ? '_Template' : '';
      const fileName = `TimeTracker_Hours${templateIndicator}_${format(weekStart, 'MM-dd-yyyy')}_to_${format(weekEnd, 'MM-dd-yyyy')}`;
      
      // Generate file based on format
      if (exportFormat === 'xlsx') {
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}.xlsx`);
      } else if (exportFormat === 'csv') {
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileName}.csv`);
      }
      
      // Show success message
      setExportSuccess(true);
      
      // Close dialog after a delay
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('An error occurred while exporting data. Please try again.');
    }
  };
  
  return (
    <>
        <Button
  variant="contained"
  color="primary"
  startIcon={<DownloadIcon />}
  onClick={handleOpen}
  size="small"
  sx={{ 
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(63, 81, 181, 0.2)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
    }
  }}
>
  Export Hours
</Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
          Export Employee Hours
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {exportSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DownloadIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                Export Successful!
              </Typography>
              <Typography color="text.secondary">
                Your file has been downloaded successfully.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Week</InputLabel>
                    <Select
                      value={weekOffset}
                      onChange={(e) => setWeekOffset(e.target.value)}
                      label="Select Week"
                    >
                      {getWeekOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Export Format"
                    >
                      <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                      <MenuItem value="csv">CSV (.csv)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={templateMode}
                        onChange={(e) => setTemplateMode(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Create template for master spreadsheet"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" icon={<InfoIcon />}>
                  {templateMode ? 
                    "The template format is designed to be easily copied into your master spreadsheet. Each export will be clearly labeled with the week dates." :
                    "This will create a standalone report showing hours worked by each employee during the selected week."
                  }
                </Alert>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: exportSuccess ? 'none' : '1px solid #eee' }}>
          <Button onClick={handleClose} color="inherit">
            {exportSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!exportSuccess && (
            <Button 
              onClick={handleExport} 
              variant="contained" 
              color="primary"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportEmployeeHours;