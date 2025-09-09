import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Psychology, Security, Group, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'AI-Guided Support',
      description: 'Get immediate mental health first-aid with our compassionate AI chatbot'
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Privacy First',
      description: 'Anonymous access, encrypted data, and strict privacy protection'
    },
    {
      icon: <Group sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Professional Help',
      description: 'Book confidential sessions with qualified counselors'
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Screening Tools',
      description: 'PHQ-9 and GAD-7 assessments for depression and anxiety'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Digital Psychological Intervention System
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={4}>
          Immediate, confidential mental health support for college students
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/onboarding')}
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ px: 4, py: 1.5 }}
          >
            Login
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Box mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={8} p={4} bgcolor="primary.main" borderRadius={2} color="white">
        <Typography variant="h4" gutterBottom>
          Need Help Right Now?
        </Typography>
        <Typography variant="body1" mb={3}>
          If you're in crisis or need immediate support, please reach out:
        </Typography>
        <Typography variant="h6" mb={1}>
          🚨 Crisis Hotline: +91-9152987821
        </Typography>
        <Typography variant="body2">
          Available 24/7 • Confidential • Free
        </Typography>
      </Box>
    </Container>
  );
}

export default HomePage;
