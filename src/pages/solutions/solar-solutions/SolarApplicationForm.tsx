import React, { useState } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBank, faTractor, faIndustry, faHome, faSolarPanel, faCalculator, faHospital, faTriangleExclamation, faCircle, faSlash, faHandHolding, faHandHoldingUsd, faRulerCombined, faDollarSign, faTachometer, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

import './SolarApplicationForm.css';

const SolarApplicationForm: React.FC = () => {
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>(100);
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [wantBackup, setWantBackup] = useState<boolean>(false);
  const [hugeBill, setHugeBill] = useState<boolean>(false);
  const [primaryUse, setPrimaryUse] = useState<string>('home');
  const [result, setResult] = useState<string>('');
  const [recommendedSystem, setRecommendedSystem] = useState<string[]>([]);

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
    if (primaryUse === 'agricultural') recommendedType = 'Solar Water Pumping (specialized design)';
    if (hugeBill) recommendedType += ' with Energy Optimization';
    if (primaryUse === 'hospital' || primaryUse === 'bank' || primaryUse === 'industry') {
      recommendedType += ' with Enhanced Reliability Features';
    }

    if (primaryUse === 'home') {
      recommendedType += ' for Residential Use';
    } else if (primaryUse === 'bank') {
      recommendedType += ' for Commercial Banking Facilities';
    } else if (primaryUse === 'hospital') {
      recommendedType += ' for Healthcare Institutions';
    } else if (primaryUse === 'agricultural') {
      recommendedType += ' for Agricultural Applications';
    } else if (primaryUse === 'industry') {
      recommendedType += ' for Industrial Operations';
    }

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
            <div className="card card-form-holder p-4">

              <h3>Tell us about your needs</h3>
              <form onSubmit={handleSubmit}>
                <div className='d-flex flex-wrap'></div>
                <div className="mb-3">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faTachometerAlt} className='fa-2x text-primary me-1' />
                    Average monthly energy consumption (kWh)</label>
                  <input type="number" className="form-control" value={monthlyKWh as any} onChange={e => setMonthlyKWh(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faDollarSign} className='fa-2x text-primary me-1' />
                    Average monthly electricity bill (optional)</label>
                  <input type="number" className="form-control" value={monthlyBill as any} onChange={e => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faRulerCombined} className='fa-2x text-primary me-1' />
                    Available installation area (m²) (optional)</label>
                  <input type="number" className="form-control" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>


                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="grid" checked={hasGrid} onChange={e => setHasGrid(e.target.checked)} />
                  <label className="form-check-label" htmlFor="grid">
                    <FontAwesomeIcon icon={faBolt} className='text-warning' />
                    Do you have grid connection?</label>
                </div>

                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="backup" checked={wantBackup} onChange={e => setWantBackup(e.target.checked)} />
                  <label className="form-check-label" htmlFor="backup">
                    <span className="fa-layers fa-fw">
                      <FontAwesomeIcon icon={faBolt} className='text-warning' />
                      <FontAwesomeIcon icon={faSlash} className='text-danger' transform="grow-2" />
                    </span>
                    Do you suffer from frequent power outages?</label>
                </div>

                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="hugeBill" checked={hugeBill} onChange={e => setHugeBill(e.target.checked)} />
                  <label className="form-check-label" htmlFor="hugeBill">
                    <FontAwesomeIcon icon={faHandHoldingUsd} className='text-warning' />
                    Are you suffering from a bill price that is too high?</label>
                </div>

                <div className="mb-3">
                  <label className="form-label">Primary use</label>
                  <div className='d-flex flex-wrap'>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-home" value="home" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'home'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-home">
                        <FontAwesomeIcon icon={faHome} className='fa-2x m-1' />
                        <span>Home</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-bank" value="bank" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'bank'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-bank">
                        <FontAwesomeIcon icon={faBank} className='fa-2x m-1' />
                        <span>Bank</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-hospital" value="hospital" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'hospital'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-hospital">
                        <FontAwesomeIcon icon={faHospital} className='fa-2x m-1' />
                        <span>Hospital</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-tractor" value="agricultural" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'agricultural'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-tractor">
                        <FontAwesomeIcon icon={faTractor} className='fa-2x m-1' />
                        <span>Agricultural</span>
                      </label>
                    </div>


                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-industry" value="industry" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'industry'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-industry">
                        <FontAwesomeIcon icon={faIndustry} className='fa-2x m-1' />
                        <span>Industry</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="w-100 gap-2">
                  <Link to="/solar-solutions" className="btn btn-outline-secondary">Back to Solar systems</Link>
                  <button className="btn btn-primary btn-lg float-end" type="submit">Get Recommendation <FontAwesomeIcon icon={faCalculator} /></button>
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
