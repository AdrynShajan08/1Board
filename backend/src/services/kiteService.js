const KiteConnect = require('kiteconnect').KiteConnect;
require('dotenv').config();

class KiteService {
  constructor() {
    this.apiKey = process.env.KITE_API_KEY;
    this.apiSecret = process.env.KITE_API_SECRET;
    this.accessToken = process.env.KITE_ACCESS_TOKEN;
    
    this.kite = new KiteConnect({
      api_key: this.apiKey
    });
    
    if (this.accessToken) {
      this.kite.setAccessToken(this.accessToken);
    }
  }

  /**
   * Generate login URL for authentication
   */
  getLoginURL() {
    return this.kite.getLoginURL();
  }

  /**
   * Generate access token from request token
   */
  async generateSession(requestToken) {
    try {
      const response = await this.kite.generateSession(requestToken, this.apiSecret);
      this.accessToken = response.access_token;
      this.kite.setAccessToken(this.accessToken);
      
      console.log('✓ Access token generated successfully');
      console.log('⚠️  Save this access token in your .env file:');
      console.log(`KITE_ACCESS_TOKEN=${this.accessToken}`);
      
      return response;
    } catch (error) {
      console.error('✗ Error generating session:', error.message);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const profile = await this.kite.getProfile();
      return profile;
    } catch (error) {
      console.error('✗ Error fetching profile:', error.message);
      throw error;
    }
  }

  /**
 * Get mutual fund holdings
 */
async getMFHoldings() {
  try {
    const holdings = await this.kite.getMFHoldings();
    
    console.log('Raw holdings response:', holdings);
    console.log('Holdings type:', typeof holdings);
    console.log('Is array?', Array.isArray(holdings));
    
    // Check if holdings is valid
    if (!holdings) {
      console.log('No holdings returned');
      return [];
    }
    
    if (!Array.isArray(holdings)) {
      console.error('Holdings is not an array:', holdings);
      return [];
    }
    
    if (holdings.length === 0) {
      console.log('Holdings array is empty');
      return [];
    }
    
    // Calculate additional fields
    const enrichedHoldings = holdings.map(holding => {
      const investedValue = holding.quantity * holding.average_price;
      const currentValue = holding.quantity * holding.last_price;
      const pnl = currentValue - investedValue;
      const returnPercentage = ((currentValue - investedValue) / investedValue) * 100;
      
      return {
        ...holding,
        invested_value: investedValue,
        current_value: currentValue,
        pnl: pnl,
        return_percentage: returnPercentage
      };
    });
    
    return enrichedHoldings;
  } catch (error) {
    console.error('✗ Error fetching MF holdings:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

  /**
   * Get margins
   */
  async getMargins() {
    try {
      const margins = await this.kite.getMargins();
      return margins;
    } catch (error) {
      console.error('✗ Error fetching margins:', error.message);
      throw error;
    }
  }

  /**
   * Validate if access token is valid
   */
  async validateSession() {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = KiteService;