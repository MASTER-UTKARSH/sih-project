// Default counselor data for development and demo
const createDefaultCounselors = async (models) => {
  try {
    const { Counselor } = models;
    
    const existingCounselors = await Counselor.findAll();
    if (existingCounselors.length > 0) {
      console.log('Counselors already exist, skipping seeding');
      return;
    }

    const counselors = [
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@college.edu',
        specializations: ['Depression', 'Anxiety', 'Academic Stress'],
        languages: ['en', 'hi'],
        bio: 'Licensed clinical psychologist with 8+ years experience in student counseling',
        credentials: ['PhD Psychology', 'Licensed Clinical Psychologist'],
        availableHours: {
          monday: ['09:00-12:00', '14:00-17:00'],
          tuesday: ['09:00-12:00', '14:00-17:00'],
          wednesday: ['09:00-12:00'],
          thursday: ['09:00-12:00', '14:00-17:00'],
          friday: ['09:00-12:00', '14:00-17:00']
        },
        maxDailyBookings: 6,
        rating: 4.8,
        totalSessions: 245
      },
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@college.edu',
        specializations: ['Anxiety', 'Social Anxiety', 'Panic Disorders'],
        languages: ['en', 'hi', 'te'],
        bio: 'Specialist in anxiety disorders with focus on cognitive behavioral therapy',
        credentials: ['MD Psychiatry', 'CBT Certification'],
        availableHours: {
          monday: ['10:00-13:00', '15:00-18:00'],
          tuesday: ['10:00-13:00', '15:00-18:00'],
          thursday: ['10:00-13:00', '15:00-18:00'],
          friday: ['10:00-13:00', '15:00-18:00']
        },
        maxDailyBookings: 8,
        rating: 4.9,
        totalSessions: 312
      },
      {
        name: 'Ms. Anjali Patel',
        email: 'anjali.patel@college.edu',
        specializations: ['Student Counseling', 'Career Guidance', 'Stress Management'],
        languages: ['en', 'gu'],
        bio: 'Student counselor specializing in academic stress and career guidance',
        credentials: ['MSc Psychology', 'Career Counseling Certificate'],
        availableHours: {
          monday: ['09:00-12:00', '13:00-16:00'],
          tuesday: ['09:00-12:00', '13:00-16:00'],
          wednesday: ['09:00-12:00', '13:00-16:00'],
          thursday: ['09:00-12:00', '13:00-16:00'],
          friday: ['09:00-12:00']
        },
        maxDailyBookings: 10,
        rating: 4.7,
        totalSessions: 156
      }
    ];

    await Counselor.bulkCreate(counselors);
    console.log('Default counselors created successfully');
  } catch (error) {
    console.error('Error creating default counselors:', error);
  }
};

module.exports = { createDefaultCounselors };
