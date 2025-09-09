import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

function ResourcesPage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Mental Health Resources</Typography>
      <Alert severity="info">Resource library placeholder - MVP demo</Alert>
    </Container>
  );
}

export default ResourcesPage;
