import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import moment from 'moment';

const calculateStats = (prices) => {
  if (!prices || prices.length === 0) return { mean: 0, stdDev: 0 };
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / (prices.length - 1) || 0;
  return { mean, stdDev: Math.sqrt(variance) };
};

const StockChart = ({ ticker, minutes, stockData }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null); // Store chart instance

  useEffect(() => {
    if (!stockData || stockData.length === 0) {
      console.log('StockChart: No data to render');
      return;
    }

    console.log(`StockChart: Rendering chart for ${ticker} with ${stockData.length} data points`);

    const ctx = canvasRef.current.getContext('2d');
    const prices = stockData.map((d) => d.price);
    const times = stockData.map((d) => moment(d.lastUpdatedAt).format('HH:mm:ss'));
    const { mean } = calculateStats(prices);

    // Destroy existing chart if it exists
    if (chartRef.current) {
      console.log('StockChart: Destroying existing chart');
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: times,
        datasets: [
          {
            label: `${ticker} Price`,
            data: prices,
            borderColor: '#1976d2',
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 8,
          },
          {
            label: 'Average Price',
            data: Array(prices.length).fill(mean),
            borderColor: '#d32f2f',
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `Price: $${context.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Time' } },
          y: { title: { display: true, text: 'Price ($)' } },
        },
      },
    });

    return () => {
      // Cleanup on unmount
      if (chartRef.current) {
        console.log('StockChart: Cleaning up chart on unmount');
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [stockData, ticker]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default StockChart;