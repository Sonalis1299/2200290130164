import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Tabs, Tab, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import StockChart from './StockChart';
import CorrelationHeatmap from './CorrelationHeatmap';
import '../App.css';

const API_BASE_URL = REACT_APP_API_URL;
const TOKEN = REACT_APP_API_TOKEN;

const MOCK_STOCKS = {
  'Advanced Micro Devices, Inc.': 'AMD',
  'Apple Inc.': 'AAPL',
  'Microsoft Corporation': 'MSFT',
  'NVIDIA Corporation': 'NVDA',
  'PayPal Holdings, Inc.': 'PYPL',
  'Taiwan Semiconductor Manufacturing Company': '2330TW',
  'Tesla, Inc.': 'TSLA',
  'Visa Inc.': 'V',
};

const MOCK_STOCK_DATA = {
  AMD: [
    { price: 666.66595, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 670.12345, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 665.98765, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  AAPL: [
    { price: 175.23456, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 176.54321, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 174.98765, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  MSFT: [
    { price: 410.12345, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 412.34567, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 409.87654, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  NVDA: [
    { price: 850.45678, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 855.67890, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 849.12345, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  PYPL: [
    { price: 65.23456, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 66.54321, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 64.98765, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  '2330TW': [
    { price: 580.12345, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 585.34567, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 579.87654, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  TSLA: [
    { price: 250.45678, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 255.67890, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 249.12345, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
  V: [
    { price: 280.23456, lastUpdatedAt: '2025-05-08T04:11:42.465706306Z' },
    { price: 282.54321, lastUpdatedAt: '2025-05-08T04:12:42.465706306Z' },
    { price: 279.98765, lastUpdatedAt: '2025-05-08T04:13:42.465706306Z' },
  ],
};

const fetchStocks = async () => {
  try {
    const response = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${TOKEN}` } });
    return response.data.stocks || MOCK_STOCKS;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired API token. Using mock data.');
    } else if (error.response?.status === 503) {
      throw new Error('API temporarily unavailable. Using mock data.');
    }
    return MOCK_STOCKS;
  }
};

const fetchStockData = async (ticker, minutes) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${ticker}?minutes=${minutes}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    return Array.isArray(response.data) ? response.data : [response.data.stock];
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    if (error.response?.status === 401) {
      throw new Error(`Unauthorized: Invalid or expired API token for ${ticker}. Using mock data.`);
    } else if (error.response?.status === 503) {
      throw new Error(`API temporarily unavailable for ${ticker}. Using mock data.`);
    }
    return MOCK_STOCK_DATA[ticker] || MOCK_STOCK_DATA['AMD']; // Fallback to ticker-specific mock data or default
  }
};

const App = () => {
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [stockData, setStockData] = useState([]);
  const [stockDataMap, setStockDataMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      try {
        const stockList = await fetchStocks();
        if (Object.keys(stockList).length === 0) {
          throw new Error('No stocks available');
        }
        setStocks(stockList);
        const firstStock = Object.values(stockList)[0] || '';
        setSelectedStock(firstStock);
      } catch (err) {
        setError(err.message || 'Failed to load stocks. Using mock data.');
        setStocks(MOCK_STOCKS);
        setSelectedStock(Object.values(MOCK_STOCKS)[0] || '');
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    const loadStockData = async () => {
      setLoading(true);
      setStockData([]);
      try {
        const data = await fetchStockData(selectedStock, minutes);
        console.log(`App: Fetched ${data.length} data points for ${selectedStock}`);
        setStockData(data);
        setError(null); // Clear error on successful fetch
      } catch (err) {
        setError(err.message || `Failed to load data for ${selectedStock}. Using mock data.`);
        setStockData(MOCK_STOCK_DATA[selectedStock] || MOCK_STOCK_DATA['AMD']);
      } finally {
        setLoading(false);
      }
    };
    loadStockData();
  }, [selectedStock, minutes]);

  useEffect(() => {
    const loadAllStockData = async () => {
      const stockKeys = Object.values(stocks);
      const newDataMap = {};
      let apiUnavailable = false;
      for (const ticker of stockKeys) {
        try {
          newDataMap[ticker] = await fetchStockData(ticker, minutes);
        } catch (err) {
          console.error(`Failed to load data for ${ticker}:`, err);
          newDataMap[ticker] = MOCK_STOCK_DATA[ticker] || MOCK_STOCK_DATA['AMD'];
          if (err.message.includes('API temporarily unavailable')) {
            apiUnavailable = true;
          }
        }
      }
      setStockDataMap(newDataMap);
      if (apiUnavailable) {
        setError('API is temporarily unavailable. Displaying mock data.');
      }
    };
    if (Object.keys(stocks).length > 0) {
      loadAllStockData();
    }
  }, [stocks, minutes]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (error && Object.keys(stocks).length === 0) {
    return <Typography className="error-message">{error}</Typography>;
  }

  return (
    <Container className="app-container">
      <Typography variant="h4" gutterBottom>
        Stock Price Aggregation
      </Typography>
      {error && (
        <Typography className="error-message" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="Stock Chart" />
        <Tab label="Correlation Heatmap" />
      </Tabs>
      {tab === 0 && (
        <Box>
          {Object.keys(stocks).length > 0 && (
            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Stock</InputLabel>
                <Select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  label="Stock"
                >
                  {Object.entries(stocks).map(([name, ticker]) => (
                    <MenuItem key={ticker} value={ticker}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Time Interval (Minutes)</InputLabel>
                <Select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  label="Time Interval (Minutes)"
                >
                  {[10, 30, 60, 120].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m} Minutes
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
          ) : stockData.length > 0 ? (
            <StockChart ticker={selectedStock} minutes={minutes} stockData={stockData} />
          ) : (
            <Typography>No data available for {selectedStock || 'selected stock'}.</Typography>
          )}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Time Interval (Minutes)</InputLabel>
            <Select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              label="Time Interval (Minutes)"
            >
              {[10, 30, 60, 120].map((m) => (
                <MenuItem key={m} value={m}>
                  {m} Minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
          ) : (
            <CorrelationHeatmap stocks={stocks} minutes={minutes} stockDataMap={stockDataMap} />
          )}
        </Box>
      )}
    </Container>
  );
};

export default App;