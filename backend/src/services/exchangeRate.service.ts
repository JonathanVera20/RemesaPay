import axios from 'axios';
import config from '../config/config';
import logger from '../utils/logger';
import redisService from './redis';
import prisma from '../config/database';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface ExchangeRateProvider {
  name: string;
  getRate(from: string, to: string): Promise<number>;
}

// CoinGecko provider
class CoinGeckoProvider implements ExchangeRateProvider {
  name = 'CoinGecko';
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getRate(from: string, to: string): Promise<number> {
    try {
      // Map currency codes to CoinGecko IDs
      const currencyMap: Record<string, string> = {
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'USD': 'usd',
        'EUR': 'eur',
        'ETH': 'ethereum',
        'BTC': 'bitcoin'
      };

      if (from === 'USD' && to === 'USD') return 1;
      if (from === 'USDC' && to === 'USD') return 1;
      if (from === 'USD' && to === 'USDC') return 1;

      const fromId = currencyMap[from.toUpperCase()];
      const toId = currencyMap[to.toUpperCase()];

      if (!fromId || !toId) {
        throw new Error(`Unsupported currency pair: ${from}/${to}`);
      }

      const response = await axios.get(
        `${this.baseUrl}/simple/price?ids=${fromId}&vs_currencies=${to.toLowerCase()}`,
        { timeout: 10000 }
      );

      const rate = response.data[fromId]?.[to.toLowerCase()];
      if (!rate) {
        throw new Error(`Rate not found for ${from}/${to}`);
      }

      return parseFloat(rate);
    } catch (error) {
      logger.error(`CoinGecko provider error for ${from}/${to}:`, error);
      throw error;
    }
  }
}

// ExchangeRate-API provider
class ExchangeRateAPIProvider implements ExchangeRateProvider {
  name = 'ExchangeRate-API';
  private baseUrl = 'https://v6.exchangerate-api.com/v6';

  async getRate(from: string, to: string): Promise<number> {
    try {
      if (from === to) return 1;

      const response = await axios.get(
        `${this.baseUrl}/${config.exchangeRate.apiKey}/pair/${from.toUpperCase()}/${to.toUpperCase()}`,
        { timeout: 10000 }
      );

      if (response.data.result !== 'success') {
        throw new Error(`API returned: ${response.data.result}`);
      }

      return parseFloat(response.data.conversion_rate);
    } catch (error) {
      logger.error(`ExchangeRate-API provider error for ${from}/${to}:`, error);
      throw error;
    }
  }
}

// Banco Central del Ecuador provider (for USD/local rates)
class BCEProvider implements ExchangeRateProvider {
  name = 'Banco Central Ecuador';
  private baseUrl = 'https://contenido.bce.fin.ec/resumen_ticker.php';

  async getRate(from: string, to: string): Promise<number> {
    try {
      // Ecuador uses USD as official currency, so USD rates are always 1
      if ((from === 'USD' && to === 'USD') || (from === 'USDC' && to === 'USD')) {
        return 1;
      }

      // For other currencies, we'd need to parse BCE data
      // This is a simplified implementation
      throw new Error(`BCE provider does not support ${from}/${to}`);
    } catch (error) {
      logger.error(`BCE provider error for ${from}/${to}:`, error);
      throw error;
    }
  }
}

class ExchangeRateService {
  private providers: ExchangeRateProvider[] = [
    new CoinGeckoProvider(),
    new ExchangeRateAPIProvider(),
    new BCEProvider()
  ];

  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly STALE_TTL = 3600; // 1 hour for stale data

  // Get exchange rate with caching and fallback
  async getExchangeRate(from: string, to: string, useCache: boolean = true): Promise<ExchangeRate> {
    const pair = `${from.toUpperCase()}/${to.toUpperCase()}`;
    const cacheKey = `exchange_rate:${pair}`;

    try {
      // Check cache first
      if (useCache) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          const rate = JSON.parse(cached);
          logger.debug(`Exchange rate cache hit for ${pair}`, { rate: rate.rate, source: rate.source });
          return {
            ...rate,
            lastUpdated: new Date(rate.lastUpdated)
          };
        }
      }

      // Try each provider in order
      for (const provider of this.providers) {
        try {
          const rate = await provider.getRate(from, to);
          const exchangeRate: ExchangeRate = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            rate,
            lastUpdated: new Date(),
            source: provider.name
          };

          // Cache the result
          await redisService.setex(cacheKey, this.CACHE_TTL, JSON.stringify(exchangeRate));
          
          // Store in database for historical tracking
          await this.storeExchangeRate(exchangeRate);

          logger.info(`Exchange rate fetched successfully for ${pair}`, {
            rate,
            source: provider.name
          });

          return exchangeRate;
        } catch (error) {
          logger.warn(`Provider ${provider.name} failed for ${pair}:`, error);
          continue;
        }
      }

      // If all providers fail, try to get stale data
      const staleKey = `exchange_rate_stale:${pair}`;
      const staleData = await redisService.get(staleKey);
      if (staleData) {
        const rate = JSON.parse(staleData);
        logger.warn(`Using stale exchange rate for ${pair}`, { age: Date.now() - new Date(rate.lastUpdated).getTime() });
        return {
          ...rate,
          lastUpdated: new Date(rate.lastUpdated)
        };
      }

      throw new Error(`Failed to fetch exchange rate for ${pair} from all providers`);

    } catch (error) {
      logger.error(`Exchange rate service error for ${pair}:`, error);
      throw error;
    }
  }

  // Store exchange rate in database for historical tracking
  private async storeExchangeRate(rate: ExchangeRate): Promise<void> {
    try {
      await prisma.exchangeRate.create({
        data: {
          fromCurrency: rate.from,
          toCurrency: rate.to,
          rate: rate.rate.toString(),
          source: rate.source,
          timestamp: rate.lastUpdated
        }
      });

      // Also store as stale backup
      const staleKey = `exchange_rate_stale:${rate.from}/${rate.to}`;
      await redisService.setex(staleKey, this.STALE_TTL, JSON.stringify(rate));

    } catch (error) {
      logger.error('Failed to store exchange rate:', error);
      // Don't throw - this is not critical
    }
  }

  // Convert amount from one currency to another
  async convertAmount(amount: number, from: string, to: string): Promise<{
    originalAmount: number;
    convertedAmount: number;
    rate: number;
    from: string;
    to: string;
    timestamp: Date;
  }> {
    const exchangeRate = await this.getExchangeRate(from, to);
    const convertedAmount = amount * exchangeRate.rate;

    return {
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(6)),
      rate: exchangeRate.rate,
      from: exchangeRate.from,
      to: exchangeRate.to,
      timestamp: exchangeRate.lastUpdated
    };
  }

  // Get multiple exchange rates at once
  async getMultipleRates(pairs: Array<{from: string; to: string}>): Promise<ExchangeRate[]> {
    const promises = pairs.map(pair => 
      this.getExchangeRate(pair.from, pair.to).catch(error => {
        logger.error(`Failed to get rate for ${pair.from}/${pair.to}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter(rate => rate !== null) as ExchangeRate[];
  }

  // Get historical exchange rates
  async getHistoricalRates(
    from: string,
    to: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExchangeRate[]> {
    try {
      const rates = await prisma.exchangeRate.findMany({
        where: {
          fromCurrency: from.toUpperCase(),
          toCurrency: to.toUpperCase(),
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { timestamp: 'asc' }
      });

      return rates.map(rate => ({
        from: rate.fromCurrency,
        to: rate.toCurrency,
        rate: parseFloat(rate.rate),
        lastUpdated: rate.timestamp,
        source: rate.source
      }));
    } catch (error) {
      logger.error('Failed to get historical rates:', error);
      throw error;
    }
  }

  // Get rate statistics
  async getRateStatistics(from: string, to: string, days: number = 30): Promise<{
    average: number;
    min: number;
    max: number;
    volatility: number;
    dataPoints: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const rates = await this.getHistoricalRates(from, to, startDate, new Date());
      
      if (rates.length === 0) {
        throw new Error(`No historical data found for ${from}/${to}`);
      }

      const values = rates.map(r => r.rate);
      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate volatility (standard deviation)
      const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
      const volatility = Math.sqrt(variance);

      return {
        average: parseFloat(average.toFixed(6)),
        min: parseFloat(min.toFixed(6)),
        max: parseFloat(max.toFixed(6)),
        volatility: parseFloat(volatility.toFixed(6)),
        dataPoints: rates.length
      };
    } catch (error) {
      logger.error('Failed to get rate statistics:', error);
      throw error;
    }
  }

  // Warm up cache with common currency pairs
  async warmupCache(): Promise<void> {
    const commonPairs = [
      { from: 'USD', to: 'USDC' },
      { from: 'USDC', to: 'USD' },
      { from: 'USD', to: 'EUR' },
      { from: 'EUR', to: 'USD' },
      { from: 'ETH', to: 'USD' },
      { from: 'BTC', to: 'USD' }
    ];

    logger.info('Warming up exchange rate cache...');
    
    const promises = commonPairs.map(pair =>
      this.getExchangeRate(pair.from, pair.to, false).catch(error => {
        logger.warn(`Failed to warm up ${pair.from}/${pair.to}:`, error);
      })
    );

    await Promise.all(promises);
    logger.info('Exchange rate cache warmup completed');
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Array<{
      name: string;
      status: 'up' | 'down';
      responseTime?: number;
    }>;
  }> {
    const providerResults = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const start = Date.now();
          await provider.getRate('USD', 'USD');
          const responseTime = Date.now() - start;
          
          return {
            name: provider.name,
            status: 'up' as const,
            responseTime
          };
        } catch (error) {
          return {
            name: provider.name,
            status: 'down' as const
          };
        }
      })
    );

    const upProviders = providerResults.filter(p => p.status === 'up').length;
    const totalProviders = providerResults.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (upProviders === totalProviders) {
      status = 'healthy';
    } else if (upProviders > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      providers: providerResults
    };
  }
}

export default new ExchangeRateService();
