import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link, Divider } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsRegister(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login({ 
        ...formData, 
        isRegistration: isRegister 
      });
      
      if (result.success) {
        navigate('/app/dashboard');
      }
    } catch (error) {
      // Error already handled by auth context
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const result = await login(null, true);
      if (result.success) {
        navigate('/app/dashboard');
      }
    } catch (error) {
      // Error already handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {isRegister ? 'Create Account' : 'Login'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Login')}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleAnonymousLogin}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Continue Anonymously
        </Button>

        <Box textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister 
              ? 'Already have an account? Login' 
              : "Don't have an account? Register"}
          </Link>
        </Box>

        <Box textAlign="center" mt={2}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
