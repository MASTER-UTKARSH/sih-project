import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Warning,
  Phone,
  Chat
} from '@mui/icons-material';
import toast from 'react-hot-toast';

function ChatbotPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisResources, setCrisisResources] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = async () => {
    setIsStarting(true);
    try {
      const response = await fetch('http://localhost:3003/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'anonymous'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConversationId(data.conversationId);
        setMessages([data.message]);
        toast.success('Chat started successfully');
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      toast.error('Failed to connect to chat service');
      console.error('Error starting conversation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;
    
    setLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');
    
    try {
      const response = await fetch('http://localhost:3003/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage,
          userId: 'anonymous'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
        
        // Handle crisis detection
        if (data.conversation.crisisDetected || data.conversation.riskLevel === 'HIGH') {
          setCrisisResources(data.resources);
          setShowCrisisModal(true);
        }
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 2,
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'secondary.main',
            ml: isUser ? 1 : 0,
            mr: isUser ? 0 : 1,
            width: 32,
            height: 32
          }}
        >
          {isUser ? <Person /> : <SmartToy />}
        </Avatar>
        
        <Paper
          sx={{
            p: 2,
            maxWidth: '70%',
            backgroundColor: isUser ? 'primary.light' : 'grey.100',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          <Typography variant="body1">{message.text}</Typography>
          
          {message.category && (
            <Chip
              label={message.category}
              size="small"
              sx={{ mt: 1, opacity: 0.8 }}
              color={message.isCrisis ? 'error' : message.isUrgent ? 'warning' : 'default'}
            />
          )}
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Paper>
      </Box>
    );
  };

  if (!conversationId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Chat sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h4" gutterBottom>
            AI Chat Support
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            Get immediate emotional support and coping strategies from our AI assistant
          </Typography>
          
          <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              How this chat works:
            </Typography>
            <Typography variant="body2">
              • Our AI assistant provides immediate emotional support and coping strategies<br/>
              • All conversations are confidential and secure<br/>
              • Crisis detection alerts you to additional resources when needed<br/>
              • This is not a replacement for professional therapy<br/>
            </Typography>
          </Alert>
          
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              <Warning sx={{ mr: 1 }} />
              Crisis Support:
            </Typography>
            <Typography variant="body2">
              If you're having thoughts of self-harm or are in crisis, please call +91-9152987821 immediately
              or contact emergency services.
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            size="large"
            onClick={startConversation}
            disabled={isStarting}
            startIcon={isStarting ? <CircularProgress size={20} /> : <Chat />}
            sx={{ px: 4, py: 2 }}
          >
            {isStarting ? 'Starting Chat...' : 'Start Chat'}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1 }} />
            DPIS Support Assistant
          </Typography>
          <Typography variant="caption">
            Confidential AI Support • Crisis Detection Enabled
          </Typography>
        </Box>
        
        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                <SmartToy />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2" component="span">
                  AI is typing...
                </Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Send />
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send • Shift+Enter for new line
          </Typography>
        </Box>
      </Paper>
      
      {/* Crisis Support Modal */}
      <Dialog
        open={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 1 }} />
          Crisis Support Resources
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Our system has detected that you may need immediate support. 
              Please consider reaching out to these crisis resources:
            </Typography>
          </Alert>
          
          <List>
            {crisisResources.map((resource, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ mr: 1, fontSize: 16 }} />
                        {resource.title}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {resource.description}
                        </Typography>
                        {resource.contact && (
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {resource.contact}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < crisisResources.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCrisisModal(false)}>
            Continue Chat
          </Button>
          <Button variant="contained" color="error" href="tel:+91-9152987821">
            Call Crisis Line
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ChatbotPage;
