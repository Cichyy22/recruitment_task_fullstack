import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

const ExchangeChart = ({ currency, defaultToday }) => {
  
  const [selectedDate, setSelectedDate] = useState(defaultToday);
  const [submittedDate, setSubmittedDate] = useState(selectedDate);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(selectedDate)
  // Ref to always have latest history in callback
  const historyRef = useRef(history);
  useEffect(() => { historyRef.current = history; }, [history, submittedDate]);

  // Callback ref for canvas element, redraw chart on mount/update
  const setCanvasRef = useCallback((canvas) => {
    if (canvas && historyRef.current.length > 0) {
      drawChart(canvas, historyRef.current, currency);
    }
  }, [currency]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/rates/history/${currency}/${submittedDate}`);
        setHistory(res.data);
      } catch (err) {
        setHistory([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currency, submittedDate]);

  // Redraw when history or currency changes and canvas present
  useEffect(() => {
    const canvas = document.getElementById(`chart-canvas-${currency}`);
    if (canvas && history.length > 0) {
      drawChart(canvas, history, currency);
    }
  }, [history, currency, submittedDate]);

  if (loading) return <p>Wczytywanie wykresu...</p>;
  if (history.length === 0) return <p>Brak danych historycznych.</p>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
       <h4 style={{ marginBottom: '16px' }}>
    Wykres dla {history[0].name} ({history[0].code})
  </h4>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
    <label htmlFor="datePicker" style={{ marginBottom: 0 }}>Od dnia:</label>
    <input
      type="date"
      id="datePicker"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
    />
    <button
      onClick={() => setSubmittedDate(selectedDate)}
      style={{
        padding: '6px 12px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Szukaj
    </button>
  </div>
      <canvas
        id={`chart-canvas-${currency}`}
        ref={setCanvasRef}
        width={600}
        height={300}
        style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          maxWidth: '100%',
          display: 'block'
        }}
      />
      <div style={{ marginTop: '15px' }}>
        <h5>Dane historyczne:</h5>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Data</th>
                {history[0]?.buy && <th style={{ padding: '8px', textAlign: 'right' }}>Kupno</th>}
                <th style={{ padding: '8px', textAlign: 'right' }}>Sprzedaż</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.date} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{new Date(entry.date).toLocaleDateString('pl-PL')}</td>
                  {entry.buy && <td style={{ padding: '8px', textAlign: 'right' }}>{entry.buy}</td>}
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{entry.sell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function drawChart(canvas, history, currency) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width = 600;
  const height = canvas.height = 300;

  ctx.clearRect(0, 0, width, height);

  const values = history.map(e => parseFloat(e.sell)).filter(v => !isNaN(v));
  if (values.length === 0) {
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Brak danych do wyświetlenia', width / 2, height / 2);
    return;
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Horizontal grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * chartHeight / 5);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Line chart
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  history.forEach((entry, i) => {
    const x = padding + (i * chartWidth / (history.length - 1));
    const y = padding + chartHeight - ((parseFloat(entry.sell) - minValue) / range * chartHeight);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points and values
  ctx.fillStyle = '#2196F3';
  history.forEach((entry, i) => {
    const x = padding + (i * chartWidth / (history.length - 1));
    const y = padding + chartHeight - ((parseFloat(entry.sell) - minValue) / range * chartHeight);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(parseFloat(entry.sell).toFixed(4), x, y - 10);
    ctx.fillStyle = '#2196F3';
  });

  // Y-axis labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (i * range / 5);
    const y = padding + (i * chartHeight / 5);
    ctx.fillText(value.toFixed(4), padding - 10, y + 4);
  }

  // X-axis labels (dates)
  history.forEach((entry, i) => {
    const x = padding + (i * chartWidth / (history.length - 1));
    const date = new Date(entry.date);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
    ctx.save();
    ctx.translate(x, height - 5);
    ctx.fillText(dateStr, 0, 0);
    ctx.restore();
  });

  // Chart title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Kurs ${currency} - ostatnie 14 dni`, width / 2, 20);
}

export default ExchangeChart;
