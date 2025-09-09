# Digital Psychological Intervention System (DPIS)

A comprehensive mental health support platform for college students, built for Smart India Hackathon 2025.

## 🎯 Overview

DPIS provides immediate, stigma-free mental health support through:
- **AI-guided chatbot** with crisis detection
- **Anonymous access** with privacy protection
- **PHQ-9 & GAD-7 screenings** for assessment
- **Confidential counselor booking** system
- **Peer support forum** with moderation
- **Admin analytics dashboard** for institutions

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API with JWT authentication
- PostgreSQL database with encrypted data
- Redis for caching and sessions
- Google Generative AI integration
- Real-time notifications via Socket.IO

### Frontend (React)
- Modern Material-UI interface
- Progressive Web App (PWA) ready
- Responsive design for mobile/desktop
- Real-time chat interface

### Security Features
- End-to-end encryption for sensitive data
- Anonymous user support
- Audit logging for all actions
- Crisis escalation workflows
- OWASP security best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose (optional)

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd digital-psych-intervention-system

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your database and API configurations

# Start PostgreSQL and Redis
# Create database 'dpis_db'

# Run the application
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# Start the application
npm start
```

## 📝 Environment Configuration

### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dpis_db
DB_USER=postgres
DB_PASS=your_password

# Google AI API
GOOGLE_AI_API_KEY=AIzaSyAwqpc46sKzvTaKAd49t03G6vrTkwX_uFw

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Crisis Support
CRISIS_HOTLINE=+91-9152987821
COUNSELOR_EMAIL=counselor@college.edu
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/anonymous` - Create anonymous session
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Mental Health Features
- `POST /api/screening` - Submit PHQ-9/GAD-7 assessment
- `POST /api/chatbot/chat` - Chat with AI assistant
- `POST /api/booking` - Book counselor session
- `GET /api/resources` - Get mental health resources
- `GET /api/forum` - Get forum posts

### Admin
- `GET /api/admin/dashboard` - Analytics dashboard
- `GET /api/admin/alerts` - Crisis alerts
- `GET /api/admin/moderation` - Moderation queue

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Features Implementation Status

### ✅ Completed (MVP)
- [x] Project structure & configuration
- [x] Authentication system (anonymous + email)
- [x] Database models with encryption
- [x] AI chatbot service with Google Generative AI
- [x] Crisis detection and escalation
- [x] React frontend with Material-UI
- [x] Privacy-first design
- [x] Docker deployment setup
- [x] Security middleware
- [x] Audit logging system

### 🚧 In Progress (Post-MVP)
- [ ] PHQ-9/GAD-7 screening forms
- [ ] Real-time chat interface
- [ ] Booking system UI
- [ ] Resource library
- [ ] Forum with moderation
- [ ] Admin dashboard charts
- [ ] Email notifications
- [ ] SMS crisis alerts

### 📋 Planned Features
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Integration with national helplines
- [ ] Advanced analytics
- [ ] Research export tools

## 🔐 Security & Privacy

### Privacy Protection
- Anonymous access without PII collection
- Data encryption at rest and in transit
- Consent management for analytics
- Audit trails for all actions
- GDPR-compliant data handling

### Crisis Management
- Automatic keyword detection for self-harm
- Immediate escalation to counselors
- 24/7 crisis hotline integration
- Emergency contact workflows

## 🎨 User Interface

### Student Features
- Dashboard with quick actions
- Anonymous mental health screening
- AI chat support with crisis detection
- Confidential counselor booking
- Mental health resource library
- Peer support forum

### Admin Features
- Anonymized analytics dashboard
- Crisis alert monitoring
- Forum moderation queue
- System health monitoring

## 🏥 Mental Health Resources

### Screening Tools
- **PHQ-9**: Depression screening questionnaire
- **GAD-7**: Generalized anxiety disorder assessment
- Automatic scoring and severity classification
- Personalized recommendations based on results

### AI Chatbot Features
- Empathetic, non-judgmental responses
- Crisis keyword detection
- Coping strategies and grounding techniques
- Breathing exercises and mindfulness
- Immediate professional referral when needed

### Crisis Support
- **24/7 Hotline**: +91-9152987821
- Automatic escalation for high-risk conversations
- One-tap emergency contact
- Integration with college counseling services

## 🚀 Deployment

### Production Deployment
1. Set up PostgreSQL and Redis databases
2. Configure environment variables
3. Build and deploy using Docker Compose
4. Set up SSL certificates
5. Configure monitoring and logging

### Scaling Considerations
- Horizontal scaling with multiple backend instances
- Database read replicas for performance
- CDN for static assets
- Load balancing for high availability

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Email: support@dpis.edu

## 🏆 Smart India Hackathon 2025

This project was developed for Smart India Hackathon 2025, addressing the critical need for accessible mental health support in educational institutions.

### Team Information
- **Team Name**: [Your Team Name]
- **Problem Statement**: Digital Psychological Intervention System
- **Category**: Software
- **Technology Stack**: Node.js, React, PostgreSQL, Redis, Docker

---

**⚠️ Important Disclaimer**: This system provides mental health first-aid and support but is not a replacement for professional clinical therapy. If you're experiencing a mental health emergency, please contact emergency services immediately.
