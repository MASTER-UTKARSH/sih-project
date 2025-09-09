// Default mental health resources for development and demo
const createDefaultResources = async (models) => {
  try {
    const { Resource } = models;
    
    const existingResources = await Resource.findAll();
    if (existingResources.length > 0) {
      console.log('Resources already exist, skipping seeding');
      return;
    }

    const resources = [
      {
        title: '5-4-3-2-1 Grounding Technique',
        description: 'A simple grounding exercise to help manage anxiety and panic attacks',
        type: 'guide',
        category: 'coping-strategies',
        language: 'en',
        content: `When you're feeling anxious or overwhelmed, try this grounding technique:

5 - Name 5 things you can see around you
4 - Name 4 things you can touch
3 - Name 3 things you can hear
2 - Name 2 things you can smell
1 - Name 1 thing you can taste

Take deep breaths between each step. This exercise helps bring your attention back to the present moment.`,
        tags: ['anxiety', 'grounding', 'panic'],
        downloadable: true,
        rating: 4.8,
        ratingCount: 156
      },
      {
        title: 'Box Breathing Exercise',
        description: 'A breathing technique to reduce stress and promote relaxation',
        type: 'exercise',
        category: 'relaxation',
        language: 'en',
        content: `Box breathing is a powerful stress-relief technique:

1. Breathe in for 4 counts
2. Hold your breath for 4 counts
3. Breathe out for 4 counts
4. Hold empty lungs for 4 counts
5. Repeat this cycle 4-8 times

Practice this daily for best results. It's especially helpful before exams or stressful situations.`,
        tags: ['breathing', 'stress', 'relaxation'],
        downloadable: true,
        rating: 4.9,
        ratingCount: 203
      },
      {
        title: 'Understanding Depression: Student Guide',
        description: 'Comprehensive guide about depression symptoms and coping strategies for students',
        type: 'guide',
        category: 'mindfulness',
        language: 'en',
        content: `Depression is more than feeling sad. Common symptoms include:

- Persistent feelings of sadness or emptiness
- Loss of interest in activities you used to enjoy
- Changes in appetite or sleep patterns
- Difficulty concentrating on studies
- Feeling worthless or guilty
- Low energy or fatigue

Remember:
- Depression is treatable
- It's not your fault
- Seeking help is a sign of strength
- You're not alone

If you're experiencing these symptoms, please reach out to a counselor or mental health professional.`,
        tags: ['depression', 'education', 'symptoms'],
        downloadable: true,
        rating: 4.7,
        ratingCount: 89
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Step-by-step muscle relaxation technique for stress relief',
        type: 'audio',
        category: 'relaxation',
        language: 'en',
        content: 'Audio guide for progressive muscle relaxation technique. Tense and relax different muscle groups systematically.',
        duration: 900, // 15 minutes in seconds
        tags: ['relaxation', 'muscle', 'stress'],
        downloadable: true,
        rating: 4.6,
        ratingCount: 134
      },
      {
        title: 'Study Stress Management Tips',
        description: 'Practical strategies for managing academic stress and exam anxiety',
        type: 'guide',
        category: 'stress-management',
        language: 'en',
        content: `Managing study stress effectively:

Time Management:
- Break large tasks into smaller ones
- Use the Pomodoro Technique (25 min study, 5 min break)
- Create a realistic study schedule

Healthy Habits:
- Get 7-8 hours of sleep
- Exercise regularly, even just 10 minutes daily
- Eat nutritious meals and stay hydrated

Stress Relief:
- Practice deep breathing
- Take regular breaks
- Connect with friends and family
- Seek help when needed

Remember: It's okay to not be perfect. Focus on progress, not perfection.`,
        tags: ['study', 'stress', 'academic', 'time-management'],
        downloadable: true,
        rating: 4.8,
        ratingCount: 267
      },
      {
        title: 'When and How to Seek Professional Help',
        description: 'Guide on recognizing when to seek professional mental health support',
        type: 'guide',
        category: 'crisis-resources',
        language: 'en',
        content: `Seek professional help if you experience:

Immediate Help Needed (Crisis):
- Thoughts of suicide or self-harm
- Severe depression lasting more than 2 weeks
- Panic attacks that interfere with daily life
- Substance abuse
- Inability to function in daily activities

Consider Professional Support:
- Persistent anxiety or worry
- Difficulty sleeping or eating
- Relationship problems affecting your life
- Academic performance declining significantly
- Feeling overwhelmed most of the time

Resources:
- Campus counseling center
- Mental health helplines
- Online therapy platforms
- Support groups

Remember: Seeking help is brave, not weak.`,
        tags: ['help', 'professional', 'crisis', 'support'],
        downloadable: true,
        rating: 4.9,
        ratingCount: 178
      }
    ];

    await Resource.bulkCreate(resources);
    console.log('Default resources created successfully');
  } catch (error) {
    console.error('Error creating default resources:', error);
  }
};

module.exports = { createDefaultResources };
