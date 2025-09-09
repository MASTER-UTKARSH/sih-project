import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

function ForumPage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Peer Support Forum</Typography>
      <Alert severity="info">Moderated forum placeholder - MVP demo</Alert>
    </Container>
  );
}

export default ForumPage;
