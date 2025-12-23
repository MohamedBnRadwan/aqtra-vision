import React, { useState } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { useNavigate } from 'react-router-dom';

const SolarApplicationForm: React.FC = () => {
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>('');
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [wantBackup, setWantBackup] = useState<boolean>(false);
  const [primaryUse, setPrimaryUse] = useState<string>('home');
  const [result, setResult] = useState<string>('');

  const navigate = useNavigate();

  function round(val: number) {
    return Math.round(val * 10) / 10;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const monthly = typeof monthlyKWh === 'number' && monthlyKWh > 0 ? monthlyKWh : 0;
    if (!monthly) {
      setResult('Please provide average monthly energy consumption in kWh.');
      return;
    }

    const peakSunHours = 5; // conservative average
    const dailyKWh = monthly / 30;
    const requiredKw = dailyKWh / peakSunHours; // kW
    const systemKw = requiredKw / 0.85; // losses
    const panelWatt = 400; // typical modern module
    const panels = Math.ceil((systemKw * 1000) / panelWatt);
    const areaPerPanel = 1.7; // sqm
    const areaNeeded = round(panels * areaPerPanel);

    let recommendedType = 'On-Grid (Grid-Tied)';
    if (!hasGrid) recommendedType = 'Off-Grid (Standalone)';
    else if (wantBackup) recommendedType = 'Hybrid (Grid + Storage)';
    if (primaryUse === 'pump') recommendedType = 'Solar Water Pumping (specialized design)';

    let areaMsg = `Estimated panels: ${panels} panels (~${round(systemKw)} kW). Approx area needed: ${areaNeeded} m².`;
    if (availableArea && typeof availableArea === 'number' && availableArea < areaNeeded) {
      areaMsg += ` Provided area (${availableArea} m²) may be insufficient — consider higher-efficiency modules or ground mounts.`;
    }

    const billMsg = monthlyBill ? `Estimated monthly bill: ${monthlyBill}` : '';

    setResult(`${recommendedType}\n${areaMsg}\n${billMsg}`);
  };

  return (
    <>
      <HeaderBanner title="Solar Application Form" subtitle="Answer a few questions to get a recommended system." backgroundImage="/src/assets/hero-bg-2.jpg" />

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4">
              <h3>Tell us about your needs</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Average monthly energy consumption (kWh)</label>
                  <input type="number" className="form-control" value={monthlyKWh as any} onChange={e => setMonthlyKWh(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Average monthly electricity bill (optional)</label>
                  <input type="number" className="form-control" value={monthlyBill as any} onChange={e => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Available installation area (m²) (optional)</label>
                  <input type="number" className="form-control" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>

                <div className="mb-3 form-check">
                  <input id="grid" className="form-check-input" type="checkbox" checked={hasGrid} onChange={e => setHasGrid(e.target.checked)} />
                  <label className="form-check-label" htmlFor="grid">Do you have grid connection?</label>
                </div>

                <div className="mb-3 form-check">
                  <input id="backup" className="form-check-input" type="checkbox" checked={wantBackup} onChange={e => setWantBackup(e.target.checked)} />
                  <label className="form-check-label" htmlFor="backup">Require backup during outages?</label>
                </div>

                <div className="mb-3">
                  <label className="form-label">Primary use</label>
                  <select className="form-select" value={primaryUse} onChange={e => setPrimaryUse(e.target.value)}>
                    <option value="home">Home</option>
                    <option value="commercial">Commercial</option>
                    <option value="pump">Water Pump</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">Get Recommendation</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/solar-solutions')}>Back to Solar</button>
                </div>
              </form>

              {result && (
                <div className="mt-4">
                  <h5>Recommendation</h5>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SolarApplicationForm;
