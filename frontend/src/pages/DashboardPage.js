import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Alert } from '@mui/material';
import { Psychology, Chat, Event, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
function DashboardPage() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Mental Health Screening',
      description: 'Take PHQ-9 or GAD-7 assessment',
      icon: <Psychology />,
      path: '/app/screening',
      color: 'primary'
    },
    {
      title: 'Chat Support',
      description: 'Talk to our AI support assistant',
      icon: <Chat />,
      path: '/app/chat',
      color: 'secondary'
    },
    {
      title: 'Book Counseling',
      description: 'Schedule session with counselor',
      icon: <Event />,
      path: '/app/booking',
      color: 'success'
    },
    {
      title: 'Resources',
      description: 'Browse mental health resources',
      icon: <Assessment />,
      path: '/app/resources',
      color: 'info'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome to DPIS
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your mental health support dashboard
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <strong>Crisis Support Available 24/7:</strong> If you need immediate help, 
        call +91-9152987821 or use our chat support.
      </Alert>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                  {React.cloneElement(action.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {action.description}
                </Typography>
                <Button variant="outlined" size="small">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          How to Get Started
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              1. Take a Quick Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Start with our PHQ-9 or GAD-7 screening to understand your current mental health status.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              2. Get Immediate Support
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Use our AI chat assistant for immediate coping strategies and emotional support.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              3. Connect with Professionals
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Book confidential sessions with qualified mental health counselors.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              4. Explore Resources
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Access curated mental health resources, exercises, and peer support forums.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default DashboardPage;
