import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

function AdminDashboard() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Alert severity="info">Analytics and moderation dashboard placeholder - MVP demo</Alert>
    </Container>
  );
}

export default AdminDashboard;
