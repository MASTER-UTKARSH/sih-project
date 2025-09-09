import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { Psychology, Assessment, Warning, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';

function ScreeningPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const screeningTypes = [
    {
      id: 'phq9',
      title: 'PHQ-9 Depression Screening',
      description: 'Screens for depression symptoms over the past 2 weeks',
      icon: <Psychology />,
      color: 'primary',
      duration: '5-7 minutes'
    },
    {
      id: 'gad7',
      title: 'GAD-7 Anxiety Screening',
      description: 'Screens for generalized anxiety disorder symptoms',
      icon: <Assessment />,
      color: 'secondary',
      duration: '3-5 minutes'
    }
  ];

  const fetchQuestions = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/screening/questions/${type}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuestions(data);
        setResponses(new Array(data.questions.length).fill(null));
      } else {
        toast.error(data.error || 'Failed to load questions');
      }
    } catch (error) {
      toast.error('Failed to connect to screening service');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScreening = (type) => {
    setSelectedType(type);
    fetchQuestions(type);
  };

  const handleResponseChange = (questionIndex, value) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = parseInt(value);
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitScreening = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/screening/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          responses,
          userId: 'anonymous'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        setShowResults(true);
        toast.success('Screening completed successfully');
      } else {
        toast.error(data.error || 'Failed to submit screening');
      }
    } catch (error) {
      toast.error('Failed to submit screening');
      console.error('Error submitting screening:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetScreening = () => {
    setSelectedType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setResponses([]);
    setResult(null);
    setShowResults(false);
  };

  const isCurrentQuestionAnswered = responses[currentQuestion] !== null;
  const allQuestionsAnswered = responses.every(r => r !== null);
  const progress = ((currentQuestion + (isCurrentQuestionAnswered ? 1 : 0)) / questions.questions?.length) * 100;

  if (showResults) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Screening Results
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {questions.title} - Completed
            </Typography>
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box textAlign="center" mb={3}>
                <Typography variant="h2" color="primary.main">
                  {result.screening.result.totalScore}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Total Score
                </Typography>
              </Box>
              
              <Box textAlign="center" mb={3}>
                <Chip 
                  label={`${result.screening.result.severity} Level`}
                  color={result.screening.result.riskLevel === 'HIGH' ? 'error' : 
                         result.screening.result.riskLevel === 'MODERATE' ? 'warning' : 'success'}
                  size="large"
                  sx={{ fontSize: '1rem', py: 2, px: 3 }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                {result.screening.result.recommendation}
              </Typography>

              {result.crisis && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Warning sx={{ mr: 1 }} />
                    Immediate Support Needed
                  </Typography>
                  <Typography>
                    Based on your responses, we strongly recommend that you seek immediate support.
                    Please call our crisis hotline at +91-9152987821 or emergency services if you're in immediate danger.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            Recommended Resources
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {result.resources.map((resource, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {resource.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {resource.description}
                  </Typography>
                  {resource.contact && (
                    <Typography variant="body2" color="primary.main" mb={2}>
                      {resource.contact}
                    </Typography>
                  )}
                  <Button variant="outlined" size="small">
                    {resource.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={resetScreening}>
              Take Another Screening
            </Button>
            <Button variant="contained" onClick={() => window.location.href = '/app/chat'}>
              Start Chat Support
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!selectedType) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Mental Health Screening
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            Choose a screening tool to assess your mental health status
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Important Notes:
          </Typography>
          <Typography variant="body2">
            • These screenings are for informational purposes only and do not replace professional diagnosis
            • Your responses are confidential and used only to provide personalized recommendations
            • If you're experiencing thoughts of self-harm, please seek immediate help
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {screeningTypes.map((type) => (
            <Card 
              key={type.id}
              sx={{ 
                flex: 1, 
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
              }}
              onClick={() => handleStartScreening(type.id)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ color: `${type.color}.main`, mb: 2 }}>
                  {React.cloneElement(type.icon, { sx: { fontSize: 64 } })}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {type.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {type.description}
                </Typography>
                <Chip 
                  label={type.duration}
                  size="small"
                  sx={{ mb: 3 }}
                />
                <Button variant="contained" color={type.color} fullWidth>
                  Start Screening
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading screening questions...
        </Typography>
      </Container>
    );
  }

  if (questions.questions) {
    const question = questions.questions[currentQuestion];
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box mb={3}>
            <Typography variant="h5" gutterBottom>
              {questions.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Question {currentQuestion + 1} of {questions.questions.length}
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>

          <Typography variant="body1" color="text.secondary" mb={3}>
            {questions.instructions}
          </Typography>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {question.text}
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={responses[currentQuestion] || ''}
                  onChange={(e) => handleResponseChange(currentQuestion, e.target.value)}
                >
                  {question.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              onClick={handlePrevious} 
              disabled={currentQuestion === 0}
              variant="outlined"
            >
              Previous
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              {responses.filter(r => r !== null).length} / {questions.questions.length} completed
            </Typography>
            
            {currentQuestion < questions.questions.length - 1 ? (
              <Button 
                onClick={handleNext} 
                disabled={!isCurrentQuestionAnswered}
                variant="contained"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={submitScreening}
                disabled={!allQuestionsAnswered || loading}
                variant="contained"
                color="success"
              >
                {loading ? 'Submitting...' : 'Complete Screening'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }

  return null;
}

export default ScreeningPage;
