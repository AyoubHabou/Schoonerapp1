import React from 'react';
import { Box, Typography, Button, Paper, Link } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

const AppDownloadInfo = () => {
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #eee' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Download Our Mobile App
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        For the best experience, download our dedicated mobile app for your device:
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AppleIcon />}
          component={Link}
          href="#" // Replace with actual App Store link when available
          target="_blank"
          sx={{ flex: { xs: '1 0 100%', sm: 'auto' }, mb: { xs: 1, sm: 0 } }}
        >
          Download on App Store
        </Button>
        
        <Button
          variant="contained"
          color="success"
          startIcon={<AndroidIcon />}
          component={Link}
          href="#" // Replace with actual Play Store link when available
          target="_blank"
          sx={{ flex: { xs: '1 0 100%', sm: 'auto' } }}
        >
          Get it on Google Play
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        You can continue using the web version, but the mobile app provides additional features and better performance.
      </Typography>
    </Paper>
  );
};

export default AppDownloadInfo;