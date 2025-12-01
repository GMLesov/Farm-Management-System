import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  TrendingDown,
  AttachMoney,
  Agriculture,
  Pets,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsService, FarmAnalyticsOverview } from '../../services/analytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<FarmAnalyticsOverview | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getOverview();
        if (mounted) {
          setOverview(data);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const financialSeries = useMemo(() => {
    if (!overview || !overview.trends) return [] as Array<{ date: string; revenue: number; costs: number; profit: number }>;
    const byDate: Record<string, { date: string; revenue?: number; costs?: number; profit?: number }> = {};
    const add = (key: 'revenue'|'costs'|'profit', arr: { date: string; value: number }[]) => {
      if (!arr) return;
      arr.forEach(({ date, value }) => {
        if (!byDate[date]) byDate[date] = { date };
        (byDate[date] as any)[key] = value;
      });
    };
    add('revenue', overview.trends.revenue || []);
    add('costs', overview.trends.costs || []);
    add('profit', overview.trends.profit || []);
    return Object.values(byDate)
      .map(v => ({
        date: v.date,
        revenue: v.revenue ?? 0,
        costs: v.costs ?? 0,
        profit: v.profit ?? (v.revenue ?? 0) - (v.costs ?? 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [overview]);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Main content-area heading only */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Analytics Dashboard</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Farm performance, financials, and trends
      </Typography>
      {loading && (
        <Box sx={{ my: 4 }}>
          <LinearProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {(overview?.kpis || []).map((kpi, index) => (
          <Card key={index} sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">{kpi.label}</Typography>
                {kpi.trend ? getTrendIcon(kpi.trend) : null}
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                {kpi.unit === '%' ? `${kpi.value}%` : kpi.unit ? `${kpi.value.toLocaleString()} ${kpi.unit}` : kpi.value.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {typeof kpi.delta === 'number' && (
                  <Chip size="small" color={kpi.delta >= 0 ? 'success' : 'error'} label={`${kpi.delta > 0 ? '+' : ''}${kpi.delta}%`} />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<TrendingUp />} label="Financial Trends" />
            <Tab icon={<Pets />} label="Livestock & Animals" />
            <Tab icon={<Agriculture />} label="Production & Crops" />
            <Tab icon={<Assessment />} label="Operations & Risks" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Recent Financial Performance
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={financialSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#4CAF50"
                fill="#4CAF50"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="costs"
                stackId="2"
                stroke="#F44336"
                fill="#F44336"
                name="Costs"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="3"
                stroke="#2196F3"
                fill="#2196F3"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Livestock & Animal Analytics
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Animal population distribution and health status overview.
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Animals by Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={(overview?.breakdowns.animalsByStatus || []).map(a => ({ name: a.name, count: a.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF9800" name="Animals" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Card sx={{ flex: 1, minWidth: 200 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Pets sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Animals</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {overview?.summary.animals || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active livestock count
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 200 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Health Status</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {overview?.breakdowns.animalsByStatus.find(a => a.name.toLowerCase() === 'healthy')?.value || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Healthy animals
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 200 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Categories</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {overview?.breakdowns.animalsByStatus.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status categories
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Production & Crop Stages
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Combined production index and crop stage distribution (latest month).
          </Alert>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview?.trends.production || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#9C27B0" name="Production Index" />
            </LineChart>
          </ResponsiveContainer>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Crop Stages</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <RechartsBarChart data={(overview?.breakdowns.cropsByStage || []).map(c => ({ name: c.name, count: c.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4CAF50" name="Fields" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Operations, Benchmarks & Risks
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 3, flex: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Agriculture sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Farm Score</Typography>
              </Box>
              <Typography variant="h4" color="primary">{overview?.benchmarks.farmScore ?? 0}%</Typography>
              <Typography variant="body2" color="text.secondary">
                vs industry avg {overview?.benchmarks.industryAverage ?? 0}%
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, flex: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Pets sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Net Profit (MTD)</Typography>
              </Box>
              <Typography variant="h4" color="success.main">${(overview?.summary.netProfit || 0).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                margin {overview?.summary.profitMargin ?? 0}%
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, flex: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Next 30d Forecast</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">${(overview?.predictions?.next30dRevenue?.value || 0).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                costs ~ ${(overview?.predictions?.next30dCosts?.value || 0).toLocaleString()}
              </Typography>
            </Paper>
          </Box>

          {overview?.benchmarks && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Performance Summary:</strong> Strengths: {overview.benchmarks?.strengths?.join(', ') || 'N/A'}. Improvements: {overview.benchmarks?.improvements?.join(', ') || 'N/A'}.
            </Alert>
          )}

          {overview?.predictions?.riskAlerts?.length ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Alerts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {overview.predictions.riskAlerts.map((r, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" color={r.severity === 'high' ? 'error' : r.severity === 'medium' ? 'warning' : 'info'} label={r.type} />
                      <Typography variant="body2">{r.message}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Efficiency Recommendations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label="High Priority" color="error" size="small" />
                  <Typography>
                    Optimize irrigation scheduling to reduce water costs by an estimated 10-15%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label="Medium Priority" color="warning" size="small" />
                  <Typography>
                    Consider precision agriculture tools for fertilizer application efficiency
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label="Low Priority" color="info" size="small" />
                  <Typography>
                    Evaluate crop rotation patterns for soil health improvement
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;