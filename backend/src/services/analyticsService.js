const Holdings = require('../models/Holdings');
const { Op } = require('sequelize');

class AnalyticsService {
  /**
   * Get portfolio summary
   */
  async getPortfolioSummary() {
    try {
      const latestDate = await Holdings.max('fetch_date');
      
      const holdings = await Holdings.findAll({
        where: { fetch_date: latestDate }
      });

      const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.invested_value), 0);
      const totalCurrent = holdings.reduce((sum, h) => sum + parseFloat(h.current_value), 0);
      const totalPnl = totalCurrent - totalInvested;
      const totalReturnPercentage = ((totalCurrent - totalInvested) / totalInvested) * 100;

      return {
        total_invested: totalInvested.toFixed(2),
        total_current_value: totalCurrent.toFixed(2),
        total_pnl: totalPnl.toFixed(2),
        total_return_percentage: totalReturnPercentage.toFixed(2),
        total_funds: holdings.length,
        last_updated: latestDate
      };
    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      throw error;
    }
  }

  /**
   * Get current holdings
   */
  async getCurrentHoldings() {
    try {
      const latestDate = await Holdings.max('fetch_date');
      
      const holdings = await Holdings.findAll({
        where: { fetch_date: latestDate },
        order: [['current_value', 'DESC']]
      });

      return holdings;
    } catch (error) {
      console.error('Error fetching current holdings:', error);
      throw error;
    }
  }

  /**
   * Get portfolio allocation by fund
   */
  async getPortfolioAllocation() {
    try {
      const latestDate = await Holdings.max('fetch_date');
      
      const holdings = await Holdings.findAll({
        where: { fetch_date: latestDate }
      });

      const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.current_value), 0);

      const allocation = holdings.map(holding => ({
        fund: holding.fund,
        value: parseFloat(holding.current_value),
        percentage: ((parseFloat(holding.current_value) / totalValue) * 100).toFixed(2)
      }));

      return allocation.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error calculating portfolio allocation:', error);
      throw error;
    }
  }

  /**
   * Get historical performance (last 30 days)
   */
  async getHistoricalPerformance(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const holdings = await Holdings.findAll({
        where: {
          fetch_date: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['fetch_date', 'current_value', 'invested_value'],
        order: [['fetch_date', 'ASC']]
      });

      // Group by date and sum values
      const performanceMap = new Map();
      
      holdings.forEach(holding => {
        const dateKey = holding.fetch_date;
        if (!performanceMap.has(dateKey)) {
          performanceMap.set(dateKey, {
            date: dateKey,
            total_value: 0,
            total_invested: 0
          });
        }
        
        const entry = performanceMap.get(dateKey);
        entry.total_value += parseFloat(holding.current_value);
        entry.total_invested += parseFloat(holding.invested_value);
      });

      const performance = Array.from(performanceMap.values()).map(entry => ({
        date: entry.date,
        total_value: entry.total_value.toFixed(2),
        total_invested: entry.total_invested.toFixed(2),
        pnl: (entry.total_value - entry.total_invested).toFixed(2)
      }));

      return performance;
    } catch (error) {
      console.error('Error fetching historical performance:', error);
      throw error;
    }
  }

  /**
   * Get top performers
   */
  async getTopPerformers(limit = 5) {
    try {
      const latestDate = await Holdings.max('fetch_date');
      
      const holdings = await Holdings.findAll({
        where: { fetch_date: latestDate },
        order: [['return_percentage', 'DESC']],
        limit: limit
      });

      return holdings.map(h => ({
        fund: h.fund,
        return_percentage: parseFloat(h.return_percentage),
        pnl: parseFloat(h.pnl),
        current_value: parseFloat(h.current_value)
      }));
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }

  /**
   * Get bottom performers
   */
  async getBottomPerformers(limit = 5) {
    try {
      const latestDate = await Holdings.max('fetch_date');
      
      const holdings = await Holdings.findAll({
        where: { fetch_date: latestDate },
        order: [['return_percentage', 'ASC']],
        limit: limit
      });

      return holdings.map(h => ({
        fund: h.fund,
        return_percentage: parseFloat(h.return_percentage),
        pnl: parseFloat(h.pnl),
        current_value: parseFloat(h.current_value)
      }));
    } catch (error) {
      console.error('Error fetching bottom performers:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;