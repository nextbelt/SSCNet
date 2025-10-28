import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, 
  Target, Award, Clock, DollarSign, Users, Eye, CheckCircle,
  AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight,
  Filter, Download, RefreshCw, Zap, Star, Trophy
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'insights'>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Mock analytics data - would come from API
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalRFQsViewed: 247,
      totalResponsesSubmitted: 89,
      responseRate: 36.0,
      successRate: 23.6,
      averageResponseTime: 4.2,
      totalRevenue: 1250000,
      activeContracts: 12,
      customerSatisfactionScore: 4.7
    },
    trends: [
      { period: 'Week 1', rfqsViewed: 58, responsesSubmitted: 19, successfulBids: 4, revenue: 185000 },
      { period: 'Week 2', rfqsViewed: 62, responsesSubmitted: 23, successfulBids: 6, revenue: 245000 },
      { period: 'Week 3', rfqsViewed: 71, responsesSubmitted: 25, successfulBids: 5, revenue: 312000 },
      { period: 'Week 4', rfqsViewed: 56, responsesSubmitted: 22, successfulBids: 6, revenue: 508000 }
    ],
    performanceMetrics: [
      { category: 'Electronics Materials', responseRate: 42.3, successRate: 28.1, averageQuoteValue: 125000, competitionLevel: 'high' },
      { category: 'Metals & Alloys', responseRate: 38.7, successRate: 31.2, averageQuoteValue: 89000, competitionLevel: 'medium' },
      { category: 'Plastics & Polymers', responseRate: 29.4, successRate: 15.8, averageQuoteValue: 67000, competitionLevel: 'high' },
      { category: 'Composites', responseRate: 51.2, successRate: 39.7, averageQuoteValue: 178000, competitionLevel: 'low' }
    ],
    recentActivity: [
      { id: '1', type: 'bid_won', title: 'Aluminum Component Manufacturing', company: 'AeroSpace Corp', amount: 285000, timestamp: '2 hours ago', status: 'success' },
      { id: '2', type: 'response_submitted', title: 'Copper Wire Harnesses', company: 'ElectroTech Solutions', amount: 67000, timestamp: '5 hours ago', status: 'warning' },
      { id: '3', type: 'bid_lost', title: 'Steel Fasteners Bulk Order', company: 'Construction Plus', amount: 45000, timestamp: '1 day ago', status: 'error' },
      { id: '4', type: 'rfq_viewed', title: 'Custom PCB Assembly', company: 'Tech Innovators', timestamp: '1 day ago', status: 'success' },
      { id: '5', type: 'bid_won', title: 'Titanium Precision Parts', company: 'Medical Devices Inc', amount: 156000, timestamp: '2 days ago', status: 'success' }
    ],
    competitorInsights: {
      avgResponseTime: 6.8,
      avgSuccessRate: 19.3,
      topCategories: ['Electronics Materials', 'Automotive Parts', 'Industrial Components'],
      marketPosition: 'challenger'
    }
  });

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
      case 'response_submitted': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'bid_lost': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'rfq_viewed': return <Eye className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RFQs Viewed</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalRFQsViewed}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.responseRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+3.2% vs industry avg</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.successRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+4.3% vs industry avg</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${(analyticsData.overview.totalRevenue / 1000000).toFixed(1)}M</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18% vs last quarter</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.overview.averageResponseTime} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Active Contracts</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.overview.activeContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Customer Rating</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.overview.customerSatisfactionScore}/5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Market Position</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{analyticsData.competitorInsights.marketPosition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        
        <div className="space-y-4">
          {analyticsData.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  {activity.amount && (
                    <span className="text-green-600 font-semibold">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{activity.company}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-8">
      {/* Performance by Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Material Category</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Response Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Success Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Quote Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Competition</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.performanceMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{metric.category}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.responseRate}%</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${metric.responseRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.successRate}%</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${metric.successRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    ${metric.averageQuoteValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metric.competitionLevel === 'low' ? 'bg-green-100 text-green-700' :
                      metric.competitionLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {metric.competitionLevel}
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900">Fast Response Time</p>
                <p className="text-sm text-green-700">38% faster than industry average</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900">High Success in Composites</p>
                <p className="text-sm text-green-700">39.7% success rate in low-competition category</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900">Customer Satisfaction</p>
                <p className="text-sm text-green-700">4.7/5.0 rating from buyers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Improvement Areas</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-900">Plastics & Polymers</p>
                <p className="text-sm text-yellow-700">Low success rate (15.8%) in high-competition market</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-900">Response Volume</p>
                <p className="text-sm text-yellow-700">Could increase response rate from 36% to 45%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-900">Competitive Pricing</p>
                <p className="text-sm text-yellow-700">Consider pricing strategy in electronics materials</p>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-600">{trend.period}</div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500">RFQs Viewed</p>
                    <p className="text-lg font-semibold text-blue-600">{trend.rfqsViewed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Responses</p>
                    <p className="text-lg font-semibold text-green-600">{trend.responsesSubmitted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Wins</p>
                    <p className="text-lg font-semibold text-yellow-600">{trend.successfulBids}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-purple-600">${(trend.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {((trend.responsesSubmitted / trend.rfqsViewed) * 100).toFixed(1)}% response rate
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Up 📈</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Volume</span>
              <span className="font-semibold text-green-600">+15.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-semibold text-green-600">+8.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quote Value</span>
              <span className="font-semibold text-green-600">+22.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas to Watch 👀</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Time</span>
              <span className="font-semibold text-yellow-600">-5.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Ratings</span>
              <span className="font-semibold text-yellow-600">-2.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Share</span>
              <span className="font-semibold text-red-600">-1.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-8">
      {/* Competitive Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Competitive Position</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Your Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium text-blue-600">{analyticsData.overview.averageResponseTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-blue-600">{analyticsData.overview.successRate}%</span>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Industry Average</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium text-gray-600">{analyticsData.competitorInsights.avgResponseTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-gray-600">{analyticsData.competitorInsights.avgSuccessRate}%</span>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Your Advantage</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Faster by</span>
                <span className="font-medium text-green-600">
                  {(analyticsData.competitorInsights.avgResponseTime - analyticsData.overview.averageResponseTime).toFixed(1)} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Higher success</span>
                <span className="font-medium text-green-600">
                  +{(analyticsData.overview.successRate - analyticsData.competitorInsights.avgSuccessRate).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Opportunities</h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-medium text-green-900">Emerging Categories</h4>
              <p className="text-sm text-green-700 mt-1">
                IoT Components and Smart Materials showing 45% growth in RFQ volume
              </p>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-900">Geographic Expansion</h4>
              <p className="text-sm text-blue-700 mt-1">
                Southeast markets showing high demand for your specialties
              </p>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h4 className="font-medium text-purple-900">Premium Segments</h4>
              <p className="text-sm text-purple-700 mt-1">
                Aerospace and medical sectors paying 30% premium for quality
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Optimize Response Time</h4>
                <p className="text-sm text-gray-600">Reduce to 3 days to gain competitive edge</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Expand Composite Focus</h4>
                <p className="text-sm text-gray-600">Leverage 39.7% success rate in low competition</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-yellow-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Improve Pricing Strategy</h4>
                <p className="text-sm text-gray-600">Analyze lost bids to optimize quote values</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <a 
                href="/dashboard/supplier"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Dashboard
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="/dashboard/supplier-profile"
                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                Company Profile
              </a>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Performance Analytics</h1>
            <p className="text-gray-600">Track your RFQ performance and business growth</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button 
              onClick={() => setLoading(!loading)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: Target },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'insights', label: 'Market Insights', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default SupplierAnalytics;