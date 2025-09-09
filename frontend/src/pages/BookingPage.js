import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

function BookingPage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Book Counseling Session</Typography>
      <Alert severity="info">Booking system placeholder - MVP demo</Alert>
    </Container>
  );
}

export default BookingPage;
