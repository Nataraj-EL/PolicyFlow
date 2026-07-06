import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useReportingSummary } from '../../services/queries';
import { Card } from '../../components/ui/Card';
import { FileText, AlertTriangle, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const Dashboard: React.FC = () => {
  const { data: summary, isLoading, error } = useReportingSummary();



  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--color-border)',
            borderTopColor: 'var(--color-brand)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          border: '1px solid rgba(198, 40, 40, 0.2)',
          borderRadius: '8px',
        }}
      >
        <p><strong>Error loading dashboard:</strong> {error?.message || 'Failed to fetch reporting details.'}</p>
      </div>
    );
  }

  // Map policies by status to Recharts data
  const policyStatusData = Object.entries(summary.policiesByStatus).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  // Map policies by type to Recharts data
  const policyTypeData = Object.entries(summary.policiesByType).map(([key, val]) => ({
    name: key.replace('_', ' '),
    value: val,
  }));

  // Map claims by status to Recharts data
  const claimStatusData = Object.entries(summary.claimsByStatus).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  // Theme-compliant colors for chart segments
  const COLORS = ['#a1461c', '#c27d53', '#dbd3c5', '#261e1a', '#2e7d32'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
              }}
            >
              <FileText size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Policies</p>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{summary.activePoliciesCount}</h4>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#fffde7',
                color: '#b78103',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Open Claims</p>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{summary.openClaimsCount}</h4>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
              }}
            >
              <IndianRupee size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total In-Force Premium</p>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {formatCurrency(summary.totalActivePremium)}
              </h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Visualizations Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Policies by Type */}
        <Card title="Policies by Type Distribution">
          <div style={{ height: '300px', width: '100%' }}>
            {policyTypeData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No active policies recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={policyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {policyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Claims by Status */}
        <Card title="Claims Status Breakdown">
          <div style={{ height: '300px', width: '100%' }}>
            {claimStatusData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No claim records filed.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)' 
                    }} 
                  />
                  <Bar dataKey="value" fill="var(--color-brand)" radius={[4, 4, 0, 0]}>
                    {claimStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
