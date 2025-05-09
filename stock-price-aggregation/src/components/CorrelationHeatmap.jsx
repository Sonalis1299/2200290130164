import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const calculateStats = (prices) => {
  if (!prices || prices.length === 0) return { mean: 0, stdDev: 0 };
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / (prices.length - 1) || 0;
  return { mean, stdDev: Math.sqrt(variance) };
};

const calculateCorrelation = (dataX, dataY) => {
  if (!dataX || !dataY || dataX.length !== dataY.length || dataX.length < 2) return 0;
  const meanX = dataX.reduce((sum, x) => sum + x, 0) / dataX.length;
  const meanY = dataY.reduce((sum, y) => sum + y, 0) / dataY.length;
  let cov = 0, stdX = 0, stdY = 0;
  for (let i = 0; i < dataX.length; i++) {
    cov += (dataX[i] - meanX) * (dataY[i] - meanY);
    stdX += Math.pow(dataX[i] - meanX, 2);
    stdY += Math.pow(dataY[i] - meanY, 2);
  }
  cov /= dataX.length - 1;
  stdX = Math.sqrt(stdX / (dataX.length - 1)) || 0;
  stdY = Math.sqrt(stdY / (dataX.length - 1)) || 0;
  return stdX * stdY === 0 ? 0 : cov / (stdX * stdY);
};

const CorrelationHeatmap = ({ stocks, minutes, stockDataMap }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredStock, setHoveredStock] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const stockKeys = Object.values(stocks);
    const n = stockKeys.length;
    if (n === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const maxCellSize = 50;
    const cellSize = Math.min(maxCellSize, Math.floor(containerWidth / (n + 1)));
    const canvasSize = n * cellSize + 60;

    canvasRef.current.width = canvasSize;
    canvasRef.current.height = canvasSize;
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const correlations = stockKeys.map((stockX, i) =>
      stockKeys.map((stockY, j) => {
        if (i === j) return 1;
        const dataX = (stockDataMap[stockX] || []).map((d) => d.price);
        const dataY = (stockDataMap[stockY] || []).map((d) => d.price);
        return calculateCorrelation(dataX, dataY);
      })
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const corr = correlations[i][j];
        const color = corr > 0 ? `rgba(33, 150, 243, ${Math.abs(corr)})` : `rgba(244, 67, 54, ${Math.abs(corr)})`;
        ctx.fillStyle = color;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Roboto';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(corr.toFixed(2), j * cellSize + cellSize / 2, i * cellSize + cellSize / 2);
      }
    }

    ctx.fillStyle = '#000';
    ctx.font = '14px Roboto';
    stockKeys.forEach((stock, i) => {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(stock, n * cellSize + 50, i * cellSize + cellSize / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(stock, i * cellSize + cellSize / 2, -10);
    });

    const legend = document.createElement('canvas');
    legend.width = 200;
    legend.height = 20;
    const legendCtx = legend.getContext('2d');
    const gradient = legendCtx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, 'rgba(244, 67, 54, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(33, 150, 243, 1)');
    legendCtx.fillStyle = gradient;
    legendCtx.fillRect(0, 0, 200, 20);
    legendCtx.fillStyle = '#000';
    legendCtx.font = '12px Roboto';
    legendCtx.textAlign = 'start';
    legendCtx.textBaseline = 'middle';
    legendCtx.fillText('-1', 0, 10);
    legendCtx.textAlign = 'end';
    legendCtx.fillText('1', 200, 10);
    ctx.drawImage(legend, 0, n * cellSize + 20);
  }, [stocks, stockDataMap]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !containerRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const stockKeys = Object.values(stocks);
    const containerWidth = containerRef.current.offsetWidth;
    const cellSize = Math.min(50, Math.floor(containerWidth / (stockKeys.length + 1)));
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);
    if (row >= 0 && row < stockKeys.length && col >= 0 && col < stockKeys.length) {
      setHoveredStock(stockKeys[row]);
    } else {
      setHoveredStock(null);
    }
  };

  const stats = hoveredStock && stockDataMap[hoveredStock] ? calculateStats(stockDataMap[hoveredStock].map((d) => d.price)) : null;

  return (
    <Box ref={containerRef} className="heatmap-container">
      <canvas ref={canvasRef} className="heatmap-canvas" onMouseMove={handleMouseMove} />
      {hoveredStock && stats && (
        <Box mt={2}>
          <Typography>Stock: {hoveredStock}</Typography>
          <Typography>Average Price: ${stats.mean.toFixed(2)}</Typography>
          <Typography>Std Dev: ${stats.stdDev.toFixed(2)}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CorrelationHeatmap;