import React, { useState, useEffect } from 'react';
import { portfolioAPI, syncAPI } from './services/api';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

function App() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [error, setError] = useState(null);
  const [performanceDays, setPerformanceDays] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, [performanceDays]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, holdingsRes, allocationRes, performanceRes, topRes, bottomRes] = await Promise.all([
        portfolioAPI.getSummary(),
        portfolioAPI.getHoldings(),
        portfolioAPI.getAllocation(),
        portfolioAPI.getPerformance(performanceDays),
        portfolioAPI.getTopPerformers(5),
        portfolioAPI.getBottomPerformers(5)
      ]);

      setSummary(summaryRes.data.data);
      setHoldings(holdingsRes.data.data);
      setAllocation(allocationRes.data.data);
      setPerformance(performanceRes.data.data);
      setTopPerformers(topRes.data.data);
      setBottomPerformers(bottomRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      await syncAPI.fetchNow();
      alert('Data synced successfully!');
      await loadDashboardData();
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>📊 Mutual Fund Dashboard</h1>
          <div className="header-actions">
            <span className="last-updated">
              Last updated: {summary?.last_updated ? new Date(summary.last_updated).toLocaleDateString() : 'N/A'}
            </span>
            <button 
              onClick={handleSyncNow} 
              disabled={syncing}
              className="sync-button"
            >
              {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Summary Cards */}
        <section className="summary-section">
          <div className="card summary-card">
            <h3>Total Invested</h3>
            <p className="amount">{formatCurrency(summary?.total_invested || 0)}</p>
          </div>
          <div className="card summary-card">
            <h3>Current Value</h3>
            <p className="amount">{formatCurrency(summary?.total_current_value || 0)}</p>
          </div>
          <div className="card summary-card">
            <h3>Total P&L</h3>
            <p className={`amount ${parseFloat(summary?.total_pnl || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(summary?.total_pnl || 0)}
            </p>
          </div>
          <div className="card summary-card">
            <h3>Returns</h3>
            <p className={`amount ${parseFloat(summary?.total_return_percentage || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(summary?.total_return_percentage || 0)}
            </p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          {/* Portfolio Allocation */}
          <div className="card chart-card">
            <h2>Portfolio Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="fund"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.percentage}%`}
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Chart */}
          <div className="card chart-card">
            <div className="chart-header">
              <h2>Portfolio Performance</h2>
              <select 
                value={performanceDays} 
                onChange={(e) => setPerformanceDays(Number(e.target.value))}
                className="days-select"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="total_value" stroke="#0088FE" name="Current Value" strokeWidth={2} />
                <Line type="monotone" dataKey="total_invested" stroke="#82ca9d" name="Invested" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top & Bottom Performers */}
        <section className="performers-section">
          <div className="card">
            <h2>🎯 Top Performers</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis 
                  type="category" 
                  dataKey="fund" 
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'return_percentage') return `${value.toFixed(2)}%`;
                    return formatCurrency(value);
                  }}
                />
                <Bar dataKey="return_percentage" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2>📉 Bottom Performers</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bottomPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis 
                  type="category" 
                  dataKey="fund" 
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'return_percentage') return `${value.toFixed(2)}%`;
                    return formatCurrency(value);
                  }}
                />
                <Bar dataKey="return_percentage" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Holdings Table */}
        <section className="holdings-section">
          <div className="card">
            <h2>All Holdings ({holdings.length})</h2>
            <div className="table-container">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Fund Name</th>
                    <th>Quantity</th>
                    <th>Avg. Price</th>
                    <th>Current Price</th>
                    <th>Invested</th>
                    <th>Current Value</th>
                    <th>P&L</th>
                    <th>Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding, index) => (
                    <tr key={index}>
                      <td className="fund-name">{holding.fund}</td>
                      <td>{parseFloat(holding.quantity).toFixed(3)}</td>
                      <td>{formatCurrency(holding.average_price)}</td>
                      <td>{formatCurrency(holding.last_price)}</td>
                      <td>{formatCurrency(holding.invested_value)}</td>
                      <td>{formatCurrency(holding.current_value)}</td>
                      <td className={parseFloat(holding.pnl) >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(holding.pnl)}
                      </td>
                      <td className={parseFloat(holding.return_percentage) >= 0 ? 'positive' : 'negative'}>
                        {formatPercent(holding.return_percentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Data fetched from Zerodha via Kite Connect API</p>
      </footer>
    </div>
  );
}

export default App;
