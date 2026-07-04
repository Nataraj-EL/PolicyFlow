import React, { useState } from 'react';
import { useCalculatePremium } from '../../services/queries';
import { PremiumBreakdown, Contact, Vehicle } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calculator as CalcIcon, Receipt, CheckCircle } from 'lucide-react';

export const Calculator: React.FC = () => {
  const calculateMutation = useCalculatePremium();
  const { showToast } = useToast();

  const [breakdown, setBreakdown] = useState<PremiumBreakdown | null>(null);

  // Simulated Rating Parameters Form State
  const [contactType, setContactType] = useState<'PERSON' | 'COMPANY'>('PERSON');
  const [vehicleType, setVehicleType] = useState('SEDAN');
  const [fuelType, setFuelType] = useState('GASOLINE');
  const [year, setYear] = useState<number>(new Date().getFullYear() - 2);
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [vin, setVin] = useState('1ABCDE2FGHIJKLMNO'); // dummy valid vin representation
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [postalCode, setPostalCode] = useState('10001');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const mockContact: Contact = {
      contactType,
      firstName: contactType === 'PERSON' ? 'Simulated' : undefined,
      lastName: contactType === 'PERSON' ? 'Customer' : undefined,
      companyName: contactType === 'COMPANY' ? 'Simulated Company' : undefined,
      emailAddress: 'simulated@policyflow.local',
      addressLine1: '123 Rating Lane',
      city,
      state,
      postalCode,
    };

    const mockVehicle: Vehicle = {
      vin,
      make,
      model,
      year,
      vehicleType,
      fuelType,
    };

    calculateMutation.mutate(
      { contact: mockContact, vehicle: mockVehicle },
      {
        onSuccess: (data) => {
          setBreakdown(data);
          showToast('Premium calculation completed successfully.', 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to calculate premium.', 'error');
        },
      }
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const formatFactor = (val: number) => {
    return val === 1.0 ? '1.0x (Neutral)' : `${val > 1.0 ? '+' : ''}${(val - 1.0).toFixed(2)}x`;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
      }}
    >
      {/* Parameter Input Form Card */}
      <Card title="Rating Risk Parameters" subtitle="Specify driver and vehicle attributes to test rating algorithm coefficients.">
        <form onSubmit={handleCalculate}>
          
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-brand)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Driver Insured Info
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Insured Type</label>
              <select value={contactType} onChange={(e) => setContactType(e.target.value as 'PERSON' | 'COMPANY')}>
                <option value="PERSON">Person / Individual</option>
                <option value="COMPANY">Company / Fleet</option>
              </select>
            </div>
            <div className="form-group">
              <label>ZIP / Postal Code</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </div>

          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-brand)', margin: '16px 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vehicle Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Manufacture Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())} 
              />
            </div>
            <div className="form-group">
              <label>Body Type</label>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="TRUCK">Truck</option>
                <option value="COUPE">Coupe</option>
                <option value="VAN">Van</option>
                <option value="MOTORCYCLE">Motorcycle</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Fuel Engine Class</label>
            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
              <option value="GASOLINE">Gasoline</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric (EV)</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '12px' }} isLoading={calculateMutation.isPending}>
            <CalcIcon size={16} /> Calculate Premium Quote
          </Button>
        </form>
      </Card>

      {/* Quote Breakdown Output Card */}
      <Card title="Underwriting Premium Breakdown" subtitle="Detailed coefficients, base premiums, and total in-force premium quote.">
        {breakdown ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            {/* Dynamic Receipt Style */}
            <div
              style={{
                backgroundColor: 'var(--color-brand-light)',
                border: '1px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Base Premium Rate</span>
                <span>{formatCurrency(breakdown.basePremium)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vehicle Age Coefficient</span>
                  <span>{formatFactor(breakdown.vehicleAgeFactor)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vehicle Type Coefficient</span>
                  <span>{formatFactor(breakdown.vehicleTypeFactor)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fuel Engine Coefficient</span>
                  <span>{formatFactor(breakdown.fuelTypeFactor)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer Profile Coefficient</span>
                  <span>{formatFactor(breakdown.contactTypeFactor)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Regulatory Tax (6%)</span>
                <span>{formatCurrency(breakdown.tax)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--color-brand)',
                  paddingTop: '12px',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--color-brand)',
                }}
              >
                <span>Total Premium Quote</span>
                <span>{formatCurrency(breakdown.totalPremium)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 600 }}>
              <CheckCircle size={16} />
              <span>Quote generated dynamically in-memory. Underwriting rules satisfied.</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
              gap: '12px',
            }}
          >
            <Receipt size={40} style={{ color: 'var(--color-border)' }} />
            <span>Select risk parameters and calculate to view receipt.</span>
          </div>
        )}
      </Card>
    </div>
  );
};
