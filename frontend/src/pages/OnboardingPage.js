import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { VisibilityOff, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [consents, setConsents] = useState({
    analytics: false,
    research: false,
    terms: false,
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const steps = ['Privacy & Consent', 'Choose Access Method'];

  const handleConsentChange = (field) => (event) => {
    setConsents({ ...consents, [field]: event.target.checked });
  };

  const handleNext = () => {
    if (activeStep === 0 && !consents.terms) {
      toast.error('Please accept the terms and conditions to continue');
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleAnonymousAccess = async () => {
    try {
      const result = await login(null, true);
      if (result.success) {
        navigate('/app/dashboard');
      }
    } catch (error) {
      toast.error('Failed to create anonymous session');
    }
  };

  const handleEmailSignup = () => {
    navigate('/login?mode=register');
  };

  const renderConsentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Privacy & Consent
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Your privacy and safety are our top priorities. Please review and accept our privacy terms.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Important:</strong> This system provides mental health first-aid and support, 
        but is not a replacement for professional clinical therapy. If you're in crisis, 
        please contact emergency services or our crisis hotline immediately.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={consents.terms}
              onChange={handleConsentChange('terms')}
              required
            />
          }
          label="I accept the Terms of Service and Privacy Policy (Required)"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={consents.analytics}
              onChange={handleConsentChange('analytics')}
            />
          }
          label="I consent to anonymized analytics for improving services (Optional)"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={consents.research}
              onChange={handleConsentChange('research')}
            />
          }
          label="I consent to anonymized research participation (Optional)"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <strong>What we collect:</strong> Anonymous usage data, screening scores (with consent), 
        and conversation metadata for safety monitoring. We never store identifying information 
        in anonymous mode.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <strong>Your rights:</strong> You can withdraw consent anytime, request data deletion, 
        and access your data. All communications are encrypted.
      </Typography>
    </Box>
  );

  const renderAccessStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Choose Your Access Method
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Select how you'd like to access the support system:
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Anonymous Access */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            flex: 1, 
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { elevation: 6 }
          }}
          onClick={handleAnonymousAccess}
        >
          <VisibilityOff sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Anonymous Access
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Quick access without personal information. Perfect for immediate support and privacy.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="green">✓ Complete privacy</Typography>
            <Typography variant="body2" color="green">✓ No email required</Typography>
            <Typography variant="body2" color="green">✓ Instant access</Typography>
          </Box>
          <Button variant="contained" fullWidth>
            Continue Anonymously
          </Button>
        </Paper>

        {/* Email Registration */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            flex: 1, 
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { elevation: 6 }
          }}
          onClick={handleEmailSignup}
        >
          <Email sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Email Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create an account to save your progress and access additional features.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="green">✓ Save your progress</Typography>
            <Typography variant="body2" color="green">✓ Personalized experience</Typography>
            <Typography variant="body2" color="green">✓ Access history</Typography>
          </Box>
          <Button variant="outlined" fullWidth>
            Register with Email
          </Button>
        </Paper>
      </Box>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <strong>Crisis Support:</strong> If you're experiencing a mental health emergency, 
        please call +91-9152987821 or contact emergency services immediately.
      </Alert>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? renderConsentStep() : renderAccessStep()}

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button variant="text" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default OnboardingPage;
