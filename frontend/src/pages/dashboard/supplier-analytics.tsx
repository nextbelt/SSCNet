import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  Target, Award, Clock, DollarSign, Users, Eye, CheckCircle,
  AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight,
  Filter, Download, RefreshCw, Zap, Star, Trophy, Bell, User,
  ChevronDown, Settings, Building2, LogOut
} from 'lucide-react';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

// Types
interface AnalyticsData {
  overview: {
    totalRFQsViewed: number;
    totalResponsesSubmitted: number;
    responseRate: number;
    successRate: number;
    averageResponseTime: number;
    totalRevenue: number;
    activeContracts: number;
    customerSatisfactionScore: number;
  };
  trends: {
    period: string;
    rfqsViewed: number;
    responsesSubmitted: number;
    successfulBids: number;
    revenue: number;
  }[];
  performanceMetrics: {
    category: string;
    responseRate: number;
    successRate: number;
    averageQuoteValue: number;
    competitionLevel: 'low' | 'medium' | 'high';
  }[];
  recentActivity: {
    id: string;
    type: 'rfq_viewed' | 'response_submitted' | 'bid_won' | 'bid_lost';
    title: string;
    company: string;
    amount?: number;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }[];
  competitorInsights: {
    avgResponseTime: number;
    avgSuccessRate: number;
    topCategories: string[];
    marketPosition: 'leader' | 'challenger' | 'follower';
  };
}

const SupplierAnalytics: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'insights'>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  // Analytics data - loaded from API
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalRFQsViewed: 0,
      totalResponsesSubmitted: 0,
      responseRate: 0,
      successRate: 0,
      averageResponseTime: 0,
      totalRevenue: 0,
      activeContracts: 0,
      customerSatisfactionScore: 0
    },
    trends: [],
    performanceMetrics: [],
    recentActivity: [],
    competitorInsights: {
      avgResponseTime: 0,
      avgSuccessRate: 0,
      topCategories: [],
      marketPosition: 'follower'
    }
  });

  // Load analytics data from API
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/supplier/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const getMetricColor = (value: number, benchmark: number, inverse = false) => {
    const isGood = inverse ? value < benchmark : value > benchmark;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getMetricIcon = (value: number, benchmark: number, inverse = false) => {
    const isGood = inverse ? value < benchmark : value > benchmark;
    return isGood ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid_won': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'response_submitted': return <CheckCircle className="w-5 h-5 text-primary-600" />;
      case 'bid_lost': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'rfq_viewed': return <Eye className="w-5 h-5 text-secondary-400" />;
      default: return <Clock className="w-5 h-5 text-secondary-400" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">RFQs Viewed</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{analyticsData.overview.totalRFQsViewed}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <Eye className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Response Rate</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{analyticsData.overview.responseRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+3.2% vs industry avg</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Success Rate</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{analyticsData.overview.successRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+4.3% vs industry avg</span>
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <Award className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Total Revenue</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">${(analyticsData.overview.totalRevenue / 1000000).toFixed(1)}M</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+18% vs last quarter</span>
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Clock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-secondary-500 font-medium">Avg Response Time</p>
            <p className="text-xl font-bold text-secondary-900">{analyticsData.overview.averageResponseTime} days</p>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-secondary-500 font-medium">Active Contracts</p>
            <p className="text-xl font-bold text-secondary-900">{analyticsData.overview.activeContracts}</p>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Star className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-secondary-500 font-medium">Customer Rating</p>
            <p className="text-xl font-bold text-secondary-900">{analyticsData.overview.customerSatisfactionScore}/5.0</p>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Zap className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-secondary-500 font-medium">Market Position</p>
            <p className="text-xl font-bold text-secondary-900 capitalize">{analyticsData.competitorInsights.marketPosition}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-secondary-900">Recent Activity</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">View All</button>
        </div>

        <div className="space-y-4">
          {analyticsData.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-secondary-50 rounded-xl transition-colors border border-transparent hover:border-secondary-100">
              <div className={`p-2 rounded-lg ${activity.type === 'bid_won' ? 'bg-green-50' :
                  activity.type === 'bid_lost' ? 'bg-red-50' :
                    activity.type === 'response_submitted' ? 'bg-primary-50' : 'bg-secondary-100'
                }`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-secondary-900">{activity.title}</h4>
                  {activity.amount && (
                    <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded text-xs">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-secondary-500">{activity.company}</p>
              </div>
              <span className="text-sm text-secondary-400 font-medium">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-8">
      {/* Performance by Category */}
      <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-6">Performance by Material Category</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 font-medium text-secondary-500 text-sm uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500 text-sm uppercase tracking-wider">Response Rate</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500 text-sm uppercase tracking-wider">Success Rate</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500 text-sm uppercase tracking-wider">Avg Quote Value</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-500 text-sm uppercase tracking-wider">Competition</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.performanceMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-secondary-900">{metric.category}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-secondary-900 w-12">{metric.responseRate}%</span>
                      <div className="w-24 h-2 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${metric.responseRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-secondary-900 w-12">{metric.successRate}%</span>
                      <div className="w-24 h-2 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${metric.successRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-secondary-900">
                    ${metric.averageQuoteValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${metric.competitionLevel === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                        metric.competitionLevel === 'medium' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                          'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {metric.competitionLevel.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Strengths</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Fast Response Time</p>
                <p className="text-sm text-green-700">38% faster than industry average</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">High Success in Composites</p>
                <p className="text-sm text-green-700">39.7% success rate in low-competition category</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Customer Satisfaction</p>
                <p className="text-sm text-green-700">4.7/5.0 rating from buyers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Improvement Areas</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-primary-900">Plastics & Polymers</p>
                <p className="text-sm text-primary-700">Low success rate (15.8%) in high-competition market</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-primary-900">Response Volume</p>
                <p className="text-sm text-primary-700">Could increase response rate from 36% to 45%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-xl">
              <TrendingUp className="w-5 h-5 text-secondary-600" />
              <div>
                <p className="font-semibold text-secondary-900">Competitive Pricing</p>
                <p className="text-sm text-secondary-600">Consider pricing strategy in electronics materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-8">
      {/* Trends Chart Placeholder */}
      <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={dashboardTheme.typography.heading4}>Performance Trends</h3>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={dashboardTheme.forms.select}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Simple trends visualization */}
        <div className="space-y-4">
          {analyticsData.trends.map((trend, index) => (
            <div key={index} className={`${dashboardTheme.cards.secondary} ${dashboardTheme.cards.padding.small} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 text-sm font-medium text-secondary-500`}>{trend.period}</div>
                <div className="flex gap-8">
                  <div>
                    <p className={dashboardTheme.typography.caption}>RFQs Viewed</p>
                    <p className="text-lg font-semibold text-primary-600">{trend.rfqsViewed}</p>
                  </div>
                  <div>
                    <p className={dashboardTheme.typography.caption}>Responses</p>
                    <p className="text-lg font-semibold text-green-600">{trend.responsesSubmitted}</p>
                  </div>
                  <div>
                    <p className={dashboardTheme.typography.caption}>Wins</p>
                    <p className="text-lg font-semibold text-primary-600">{trend.successfulBids}</p>
                  </div>
                  <div>
                    <p className={dashboardTheme.typography.caption}>Revenue</p>
                    <p className="text-lg font-semibold text-secondary-900">${(trend.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary-400" />
                <span className={dashboardTheme.typography.bodySmall}>
                  {((trend.responsesSubmitted / trend.rfqsViewed) * 100).toFixed(1)}% response rate
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
          <h3 className={`${dashboardTheme.typography.heading4} mb-4`}>Trending Up</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-secondary-700">Response Volume</span>
              <span className="font-bold text-green-600">+15.3%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-secondary-700">Win Rate</span>
              <span className="font-bold text-green-600">+8.7%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-secondary-700">Quote Value</span>
              <span className="font-bold text-green-600">+22.1%</span>
            </div>
          </div>
        </div>

        <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
          <h3 className={`${dashboardTheme.typography.heading4} mb-4`}>Areas to Watch</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-100">
              <span className="font-medium text-secondary-700">Response Time</span>
              <span className="font-bold text-primary-600">-5.2%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-100">
              <span className="font-medium text-secondary-700">Customer Ratings</span>
              <span className="font-bold text-primary-600">-2.1%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="font-medium text-secondary-700">Market Share</span>
              <span className="font-bold text-red-600">-1.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-8">
      {/* Competitive Analysis */}
      <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
        <h3 className={`${dashboardTheme.typography.heading4} mb-6`}>Competitive Position</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`text-center ${dashboardTheme.cards.padding.medium} bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200`}>
            <h4 className="font-bold text-primary-900 mb-3">Your Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-700 font-medium">Response Time</span>
                <span className="font-bold text-primary-900">{analyticsData.overview.averageResponseTime} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-700 font-medium">Success Rate</span>
                <span className="font-bold text-primary-900">{analyticsData.overview.successRate}%</span>
              </div>
            </div>
          </div>

          <div className={`text-center ${dashboardTheme.cards.padding.medium} bg-secondary-50 rounded-xl border border-secondary-200`}>
            <h4 className="font-bold text-secondary-900 mb-3">Industry Average</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 font-medium">Response Time</span>
                <span className="font-bold text-secondary-800">{analyticsData.competitorInsights.avgResponseTime} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 font-medium">Success Rate</span>
                <span className="font-bold text-secondary-800">{analyticsData.competitorInsights.avgSuccessRate}%</span>
              </div>
            </div>
          </div>

          <div className={`text-center ${dashboardTheme.cards.padding.medium} bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200`}>
            <h4 className="font-bold text-green-900 mb-3">Your Advantage</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">Faster by</span>
                <span className="font-bold text-green-900">
                  {(analyticsData.competitorInsights.avgResponseTime - analyticsData.overview.averageResponseTime).toFixed(1)} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">Higher success</span>
                <span className="font-bold text-green-900">
                  +{(analyticsData.overview.successRate - analyticsData.competitorInsights.avgSuccessRate).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
          <h3 className={`${dashboardTheme.typography.heading4} mb-4`}>Market Opportunities</h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
              <h4 className="font-bold text-green-800">Emerging Categories</h4>
              <p className="text-sm text-green-700 mt-1">
                IoT Components and Smart Materials showing 45% growth in RFQ volume
              </p>
            </div>
            <div className="p-4 border-l-4 border-primary-500 bg-primary-50 rounded-r-lg">
              <h4 className="font-bold text-primary-800">Geographic Expansion</h4>
              <p className="text-sm text-primary-700 mt-1">
                Southeast markets showing high demand for your specialties
              </p>
            </div>
            <div className="p-4 border-l-4 border-secondary-500 bg-secondary-50 rounded-r-lg">
              <h4 className="font-bold text-secondary-800">Premium Segments</h4>
              <p className="text-sm text-secondary-700 mt-1">
                Aerospace and medical sectors paying 30% premium for quality
              </p>
            </div>
          </div>
        </div>

        <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
          <h3 className={`${dashboardTheme.typography.heading4} mb-4`}>Strategic Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-secondary-900">Optimize Response Time</h4>
                <p className="text-sm text-secondary-600 mt-0.5">Reduce to 3 days to gain competitive edge</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-secondary-900">Expand Composite Focus</h4>
                <p className="text-sm text-secondary-600 mt-0.5">Leverage 39.7% success rate in low competition</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-secondary-900">Improve Pricing Strategy</h4>
                <p className="text-sm text-secondary-600 mt-0.5">Analyze lost bids to optimize quote values</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className={dashboardTheme.decorativeBackground.container}>
        <div
          className={dashboardTheme.decorativeBackground.dotPattern.className}
          style={dashboardTheme.decorativeBackground.dotPattern.style}
        />
        <div className={dashboardTheme.decorativeBackground.orb1} />
        <div className={dashboardTheme.decorativeBackground.orb2} />
      </div>

      {/* Top Navigation */}
      <nav className={dashboardTheme.navigation.container}>
        <div className={dashboardTheme.navigation.innerContainer}>
          <div className={dashboardTheme.navigation.flexContainer}>
            {/* Logo */}
            <div className={dashboardTheme.navigation.logoSection}>
              <a href="/dashboard/supplier" className={dashboardTheme.navigation.logoButton}>
                <div className={dashboardTheme.navigation.logoBox}>
                  <span className={dashboardTheme.navigation.logoText}>LP</span>
                </div>
                <span className={dashboardTheme.navigation.brandText}>
                  LinkedProcurement
                </span>
              </a>
            </div>

            {/* Center Navigation Menu */}
            <div className={dashboardTheme.navigation.navButtonsContainer}>
              <div className="hidden md:flex gap-2">
                <a
                  href="/dashboard/supplier"
                  className={dashboardTheme.navigation.navButton}
                >
                  AI-Match RFQs
                </a>
                <a
                  href="/dashboard/supplier#responses"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Responses
                </a>
                <a
                  href="/dashboard/supplier-profile"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/supplier-analytics"
                  className={dashboardTheme.navigation.navButtonActive}
                >
                  Analytics
                </a>
                <a
                  href="/dashboard/messages"
                  className={dashboardTheme.navigation.navButton}
                >
                  Messages
                </a>
              </div>
            </div>

            {/* Right Side */}
            <div className={dashboardTheme.navigation.rightSection}>
              <button className={dashboardTheme.navigation.bellButton}>
                <Bell size={20} />
                <span className={dashboardTheme.navigation.bellDot}></span>
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={dashboardTheme.navigation.accountButton}
                >
                  <User size={20} />
                  <span className="hidden md:inline font-medium">Account</span>
                  <ChevronDown size={16} />
                </button>

                {showAccountMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAccountMenu(false)}
                    />
                    <div className={dashboardTheme.navigation.accountMenu}>
                      <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/company-settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Building2 size={18} />
                        <span>Company Settings</span>
                      </button>
                      <div className={dashboardTheme.navigation.accountMenuSeparator}></div>
                      <button
                        onClick={handleLogout}
                        className={dashboardTheme.navigation.accountMenuItemLogout}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={dashboardTheme.mainContent.container}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <a
                href="/dashboard/supplier-profile"
                className="text-sm text-secondary-500 hover:text-primary-600 font-medium transition-colors flex items-center gap-1"
              >
                <Building2 size={14} />
                Company Profile
              </a>
            </div>
            <h1 className={dashboardTheme.typography.heading1}>AI Performance Analytics</h1>
            <p className={dashboardTheme.typography.bodyLarge}>Track your RFQ performance and business growth</p>
          </div>
          <div className="flex gap-3">
            <button className={dashboardTheme.buttons.secondary}>
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={() => setLoading(!loading)}
              className={dashboardTheme.buttons.primary}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={dashboardTheme.tabs.container}>
          <nav className={dashboardTheme.tabs.nav}>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: Target },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'insights', label: 'Market Insights', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={activeTab === tab.id
                  ? dashboardTheme.tabs.tabActive
                  : dashboardTheme.tabs.tab}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'insights' && renderInsightsTab()}
        </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
