import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ExchangeChart from './ExchangeChart';


const ExchangePage = () => {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedCurrency, setExpandedCurrency] = useState(null);
    const defaultToday = new Date().toISOString().split('T')[0];
    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/rates/today');
        setRates(res.data);
      } catch (err) {
        console.error('Błąd pobierania kursów:', err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchRates();
    }, []);
  
    if (loading) return <p>Wczytywanie danych...</p>;
  
    const handleToggle = (currency) => {
      setExpandedCurrency((prev) => (prev === currency ? null : currency));
    };
  
    return (
      <div className="w-100 h-75 px-4" style={{overflowX: 'hidden'}}>
        <h2 className="mb-4 pt-4">Kursy walut</h2>
        <button className="btn btn-primary btn-sm rounded-pill shadow-sm d-flex align-items-center gap-2 mb-2"
            onClick={fetchRates}
            aria-label="Odśwież kursy walut">Odśwież</button>
        <div className="row gx-4 pb-4">
          <div className="col-lg-6 col-md-6 col-12">
            <div className="table-responsive-sm">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Waluta</th>
                    <th>Kupno</th>
                    <th>Sprzedaż</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rates).map(([currency, rate]) => (
                    <tr key={currency} className={expandedCurrency === currency ? "table-primary" : ""}>
                      <td className="fw-bold">{rate.name} ({rate.code})</td>
                      <td>{rate.buy ?? '-'}</td>
                      <td>{rate.sell}</td>
                      <td>
                        <button
                          className={`btn btn-${expandedCurrency === currency ? 'danger' : 'primary'} btn-sm`}
                          onClick={() => handleToggle(currency)}
                        >
                          {expandedCurrency === currency ? 'Ukryj' : 'Szczegóły'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-12 d-flex align-items-stretch">
            <div className="w-100 bg-light p-3 border rounded d-flex align-items-center justify-content-center" style={{minHeight: 350}}>
              {expandedCurrency ? (
                <ExchangeChart currency={expandedCurrency} defaultToday={defaultToday} />
              ) : (
                <div className="text-muted text-center w-100">
                  <p className="fs-5">W tym miejscu pojawią się szczegóły wybranej waluty.</p>
                  <p className="mb-0">Kliknij <span className="fw-bold">Szczegóły</span> przy wybranej walucie, aby zobaczyć wykres i historię.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  

export default ExchangePage;