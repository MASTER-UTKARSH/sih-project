const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PHQ-9 Questions (Depression Screening)
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless", 
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// GAD-7 Questions (Anxiety Screening)
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things", 
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

// Scoring functions
function calculatePHQ9Score(responses) {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  
  let severity, recommendation;
  if (totalScore >= 0 && totalScore <= 4) {
    severity = "Minimal";
    recommendation = "No treatment necessary. Monitor symptoms.";
  } else if (totalScore >= 5 && totalScore <= 9) {
    severity = "Mild";
    recommendation = "Watchful waiting; repeat screening in 2-4 weeks. Consider counseling if symptoms persist.";
  } else if (totalScore >= 10 && totalScore <= 14) {
    severity = "Moderate";
    recommendation = "Treatment plan should be considered. Counseling and/or medication may be beneficial.";
  } else if (totalScore >= 15 && totalScore <= 19) {
    severity = "Moderately Severe";
    recommendation = "Active treatment with psychotherapy and/or medication strongly recommended.";
  } else if (totalScore >= 20) {
    severity = "Severe";
    recommendation = "Immediate active treatment with psychotherapy and/or medication is recommended.";
  }

  const isCrisis = responses[8] > 0; // Question 9 about self-harm thoughts
  
  return {
    totalScore,
    severity,
    recommendation,
    isCrisis,
    riskLevel: isCrisis ? 'HIGH' : (totalScore >= 15 ? 'MODERATE' : 'LOW')
  };
}

function calculateGAD7Score(responses) {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  
  let severity, recommendation;
  if (totalScore >= 0 && totalScore <= 4) {
    severity = "Minimal";
    recommendation = "No treatment necessary. Continue monitoring.";
  } else if (totalScore >= 5 && totalScore <= 9) {
    severity = "Mild";
    recommendation = "Monitor symptoms. Consider self-help resources or brief counseling.";
  } else if (totalScore >= 10 && totalScore <= 14) {
    severity = "Moderate";
    recommendation = "Professional evaluation and treatment recommended. Consider therapy or medication.";
  } else if (totalScore >= 15) {
    severity = "Severe";
    recommendation = "Active treatment strongly recommended. Immediate professional consultation advised.";
  }

  return {
    totalScore,
    severity,
    recommendation,
    riskLevel: totalScore >= 15 ? 'HIGH' : (totalScore >= 10 ? 'MODERATE' : 'LOW')
  };
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DPIS Screening Service is running!',
    timestamp: new Date().toISOString()
  });
});

// Get screening questions
app.get('/api/screening/questions/:type', (req, res) => {
  const { type } = req.params;
  
  if (type === 'phq9') {
    res.json({
      type: 'PHQ-9',
      title: 'Patient Health Questionnaire-9 (PHQ-9)',
      description: 'This questionnaire screens for depression symptoms over the past 2 weeks.',
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      questions: PHQ9_QUESTIONS.map((question, index) => ({
        id: index + 1,
        text: question,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }))
    });
  } else if (type === 'gad7') {
    res.json({
      type: 'GAD-7',
      title: 'Generalized Anxiety Disorder 7-item Scale (GAD-7)',
      description: 'This questionnaire screens for anxiety symptoms over the past 2 weeks.',
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      questions: GAD7_QUESTIONS.map((question, index) => ({
        id: index + 1,
        text: question,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }))
    });
  } else {
    res.status(400).json({ error: 'Invalid screening type. Use "phq9" or "gad7".' });
  }
});

// Submit screening responses
app.post('/api/screening/submit', (req, res) => {
  const { type, responses, userId } = req.body;
  
  if (!type || !responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'Invalid request. Type and responses array required.' });
  }

  let result;
  try {
    if (type === 'phq9') {
      if (responses.length !== 9) {
        return res.status(400).json({ error: 'PHQ-9 requires exactly 9 responses.' });
      }
      result = calculatePHQ9Score(responses);
    } else if (type === 'gad7') {
      if (responses.length !== 7) {
        return res.status(400).json({ error: 'GAD-7 requires exactly 7 responses.' });
      }
      result = calculateGAD7Score(responses);
    } else {
      return res.status(400).json({ error: 'Invalid screening type.' });
    }

    // Create screening record
    const screeningRecord = {
      id: Date.now().toString(),
      userId: userId || 'anonymous',
      type,
      responses,
      result,
      timestamp: new Date().toISOString(),
      completed: true
    };

    // In a real app, save to database here
    console.log('Screening completed:', screeningRecord);

    // Crisis detection
    if (result.isCrisis || result.riskLevel === 'HIGH') {
      console.log('⚠️  HIGH RISK DETECTED - Crisis intervention may be needed');
    }

    res.json({
      success: true,
      screening: screeningRecord,
      crisis: result.isCrisis || result.riskLevel === 'HIGH',
      resources: generateResources(result)
    });

  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({ error: 'Internal server error during screening processing.' });
  }
});

// Get screening history
app.get('/api/screening/history/:userId', (req, res) => {
  // In a real app, fetch from database
  res.json({
    screenings: [],
    message: 'Screening history feature will be implemented with database integration.'
  });
});

function generateResources(result) {
  const resources = [];
  
  if (result.riskLevel === 'HIGH' || result.isCrisis) {
    resources.push({
      type: 'crisis',
      title: 'Crisis Support',
      description: 'Immediate help available 24/7',
      contact: '+91-9152987821',
      action: 'Call Now'
    });
  }
  
  if (result.riskLevel === 'MODERATE' || result.riskLevel === 'HIGH') {
    resources.push({
      type: 'professional',
      title: 'Professional Counseling',
      description: 'Book a session with a qualified counselor',
      action: 'Schedule Session'
    });
  }
  
  resources.push({
    type: 'selfcare',
    title: 'Self-Care Resources',
    description: 'Coping strategies and wellness activities',
    action: 'Explore Resources'
  });

  resources.push({
    type: 'support',
    title: 'Chat Support',
    description: 'Talk to our AI assistant for immediate support',
    action: 'Start Chat'
  });

  return resources;
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🏥 DPIS Screening Service running on port ${PORT}`);
});

module.exports = app;
