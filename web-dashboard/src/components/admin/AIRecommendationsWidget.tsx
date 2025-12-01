import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  LinearProgress,
  Button,
  Chip,
  Box,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Psychology as AIIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface WorkerRecommendation {
  worker: {
    _id: string;
    name: string;
    avatar?: string;
  };
  confidence: number;
  reasons: string[];
  estimatedCompletionTime: number;
  optimalStartTime: string;
}

interface AIRecommendationsWidgetProps {
  taskData: {
    type: string;
    location?: string;
    dueDate: string;
    priority: string;
  };
  onSelectWorker: (workerId: string) => void;
}

const AIRecommendationsWidget: React.FC<AIRecommendationsWidgetProps> = ({
  taskData,
  onSelectWorker
}) => {
  const [recommendations, setRecommendations] = useState<WorkerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks/ai-recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandClick = (workerId: string) => {
    setExpanded(expanded === workerId ? null : workerId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'primary';
    if (confidence >= 40) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Excellent Match';
    if (confidence >= 60) return 'Good Match';
    if (confidence >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        avatar={<AIIcon color="primary" />}
        title="AI Worker Recommendations"
        subheader="Get intelligent worker suggestions based on skills, performance, and availability"
        action={
          <Button
            variant="contained"
            onClick={fetchRecommendations}
            disabled={loading || !taskData.type}
            startIcon={<AIIcon />}
          >
            Get Recommendations
          </Button>
        }
      />

      <CardContent>
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analyzing historical data and worker profiles...
            </Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && recommendations.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <AIIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Click "Get Recommendations" to see AI-powered worker suggestions
            </Typography>
          </Box>
        )}

        {recommendations.length > 0 && (
          <List>
            {recommendations.map((rec, index) => (
              <ListItem
                key={rec.worker._id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  bgcolor: index === 0 ? 'action.hover' : 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <ListItemAvatar>
                    <Avatar src={rec.worker.avatar}>
                      {rec.worker.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {rec.worker.name}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="Best Match"
                            color="success"
                            size="small"
                            icon={<CheckIcon />}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Confidence:
                          </Typography>
                          <Chip
                            label={`${rec.confidence}%`}
                            color={getConfidenceColor(rec.confidence)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getConfidenceLabel(rec.confidence)}
                          </Typography>
                        </Box>

                        <Box sx={{ width: '100%', mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={rec.confidence}
                            color={getConfidenceColor(rec.confidence)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`~${rec.estimatedCompletionTime} min`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Start: ${new Date(rec.optimalStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View reasons">
                      <IconButton
                        onClick={() => handleExpandClick(rec.worker._id)}
                        sx={{
                          transform: expanded === rec.worker._id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: '0.3s'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Tooltip>

                    <Button
                      variant={index === 0 ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => onSelectWorker(rec.worker._id)}
                    >
                      Assign
                    </Button>
                  </Box>
                </Box>

                <Collapse in={expanded === rec.worker._id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2, pl: 7 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      Why this worker?
                    </Typography>
                    <List dense>
                      {rec.reasons.map((reason, idx) => (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={`• ${reason}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </ListItem>
            ))}
          </List>
        )}

        {recommendations.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Tip: Recommendations are based on historical task completion data, worker skills,
              performance ratings, availability, and efficiency. The confidence score indicates
              how well the worker matches this specific task.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsWidget;
