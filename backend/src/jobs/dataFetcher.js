const cron = require('node-cron');
const KiteService = require('../services/kiteService');
const Holdings = require('../models/Holdings');
const { sequelize } = require('../config/database');
require('dotenv').config();

class DataFetcherJob {
  constructor() {
    this.kiteService = new KiteService();
    this.schedule = process.env.FETCH_SCHEDULE || '30 12 * * *'; // Default: 6 PM IST (12:30 UTC)
  }

  /**
   * Fetch and store holdings data
   */
  async fetchAndStoreHoldings() {
    console.log(`\n[${new Date().toISOString()}] Starting data fetch...`);
    
    try {
      // Validate session
      const isValid = await this.kiteService.validateSession();
      if (!isValid) {
        console.error('✗ Invalid or expired access token. Please re-authenticate.');
        return false;
      }

      // Fetch holdings from Kite
      console.log('→ Fetching holdings from Zerodha...');
      const holdings = await this.kiteService.getMFHoldings();
      
      if (!holdings || holdings.length === 0) {
        console.log('⚠️  No holdings found');
        return true;
      }

      console.log(`✓ Found ${holdings.length} mutual fund holdings`);

      // Store in database
      console.log('→ Storing data in database...');
      const today = new Date().toISOString().split('T')[0];
      
      // Delete existing records for today (if re-running)
      await Holdings.destroy({
        where: { fetch_date: today }
      });

      // Insert new records
      const records = holdings.map(holding => ({
        tradingsymbol: holding.tradingsymbol,
        folio: holding.folio,
        fund: holding.fund,
        quantity: holding.quantity,
        average_price: holding.average_price,
        last_price: holding.last_price,
        last_price_date: holding.last_price_date,
        pnl: holding.pnl,
        invested_value: holding.invested_value,
        current_value: holding.current_value,
        return_percentage: holding.return_percentage,
        fetch_date: today
      }));

      await Holdings.bulkCreate(records);
      
      console.log(`✓ Successfully stored ${records.length} records`);
      console.log(`[${new Date().toISOString()}] Data fetch completed\n`);
      
      return true;
    } catch (error) {
      console.error('✗ Error during data fetch:', error.message);
      return false;
    }
  }

  /**
   * Start scheduled job
   */
  start() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Zerodha MF Dashboard - Data Fetcher Service');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Schedule: ${this.schedule} (cron format)`);
    console.log(`Next run: ${this.getNextRunTime()}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Validate cron expression
    if (!cron.validate(this.schedule)) {
      console.error('✗ Invalid cron expression in FETCH_SCHEDULE');
      process.exit(1);
    }

    // Schedule the job
    cron.schedule(this.schedule, async () => {
      await this.fetchAndStoreHoldings();
    });

    console.log('✓ Scheduler started. Press Ctrl+C to stop.\n');
  }

  /**
   * Run once immediately
   */
  async runOnce() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Manual Data Fetch');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await this.fetchAndStoreHoldings();
  }

  /**
   * Get next scheduled run time
   */
  getNextRunTime() {
    const parts = this.schedule.split(' ');
    if (parts.length !== 5) return 'Invalid schedule';
    
    const [minute, hour] = parts;
    return `Daily at ${hour}:${minute} UTC`;
  }
}

// Run if called directly
if (require.main === module) {
  const fetcher = new DataFetcherJob();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--once')) {
    // Run once and exit
    sequelize.sync().then(() => {
      fetcher.runOnce().then(() => {
        console.log('\n✓ Done. Exiting...');
        process.exit(0);
      });
    });
  } else {
    // Start scheduler
    sequelize.sync().then(() => {
      fetcher.start();
    });
  }
}

module.exports = DataFetcherJob;