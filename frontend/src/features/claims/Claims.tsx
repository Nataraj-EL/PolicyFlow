import React, { useState } from 'react';
import { 
  useClaims, 
  useCreateClaim, 
  useCloseClaim, 
  usePolicies 
} from '../../services/queries';
import { Claim } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AlertOctagon, CheckSquare, Plus } from 'lucide-react';

export const Claims: React.FC = () => {
  const { data: claims, isLoading: isClaimsLoading } = useClaims();
  const { data: policies, isLoading: isPoliciesLoading } = usePolicies();
  
  const createMutation = useCreateClaim();
  const closeMutation = useCloseClaim();
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // File Claim Form State
  const [policyId, setPolicyId] = useState('');
  const [claimType, setClaimType] = useState('COLLISION');
  const [lossDate, setLossDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Close Claim Form State
  const [closeReason, setCloseReason] = useState('');

  const resetForm = () => {
    setPolicyId('');
    setClaimType('COLLISION');
    setLossDate(new Date().toISOString().split('T')[0]);
    setReportedDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyId) {
      showToast('You must select a Policy record to file a claim against.', 'warning');
      return;
    }

    if (new Date(lossDate) > new Date(reportedDate)) {
      showToast('Loss date cannot occur after the reported date.', 'warning');
      return;
    }

    const payload: Claim = {
      policyId,
      claimType,
      lossDate,
      reportedDate,
      description: description.trim() || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast('Claim record filed successfully in OPEN status.', 'success');
        setIsCreateOpen(false);
        resetForm();
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to file claim.', 'error');
      },
    });
  };

  const handleOpenClose = (id: string) => {
    setSelectedClaimId(id);
    setCloseReason('');
    setIsCloseOpen(true);
  };

  const handleCloseSubmit = () => {
    if (!selectedClaimId) return;
    if (!closeReason.trim()) {
      showToast('Close reason is required.', 'warning');
      return;
    }

    closeMutation.mutate(
      { id: selectedClaimId, reason: closeReason },
      {
        onSuccess: () => {
          showToast('Claim closed successfully.', 'success');
          setIsCloseOpen(false);
          setSelectedClaimId(null);
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to close claim.', 'error');
        },
      }
    );
  };

  const getPolicyNumber = (id: string) => {
    const policy = policies?.find((p) => p.id === id);
    return policy ? policy.policyNumber : 'Unknown';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#fffde7', color: '#b78103' };
      case 'CLOSED':
        return { bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
      default:
        return { bg: 'var(--color-muted)', color: 'var(--color-text-secondary)' };
    }
  };

  if (isClaimsLoading || isPoliciesLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading claims...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Card
        title="Claims Registry"
        subtitle="Track claims filed against active policy agreements."
        actions={
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={16} /> File Claim
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          {claims?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No claims recorded. Click 'File Claim' to file a claim against a policy.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Claim Number</th>
                  <th>Policy Number</th>
                  <th>Type</th>
                  <th>Loss Date</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims?.map((claim) => {
                  const colors = getStatusColor(claim.status);
                  return (
                    <tr key={claim.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {claim.claimNumber}
                      </td>
                      <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {getPolicyNumber(claim.policyId)}
                      </td>
                      <td>{claim.claimType}</td>
                      <td>{claim.lossDate}</td>
                      <td>{claim.reportedDate}</td>
                      <td>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: colors.bg,
                            color: colors.color,
                          }}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }} className="wrap-text">
                        {claim.description || 'No description'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {claim.status === 'OPEN' && (
                          <Button
                            onClick={() => claim.id && handleOpenClose(claim.id)}
                            variant="outline"
                            style={{ minHeight: '32px', padding: '4px 8px' }}
                            title="Close Claim"
                          >
                            <CheckSquare size={14} /> Close
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* File Claim Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="File Insurance Claim"
        footer={
          <>
            <Button onClick={() => setIsCreateOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCreateSubmit} variant="primary" isLoading={createMutation.isPending}>
              File Claim
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label>Associated Policy *</label>
            <select value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
              <option value="">-- Select Policy Contract --</option>
              {policies
                ?.filter((p) => p.status === 'IN_FORCE')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber} ({p.policyType?.replace('_', ' ')})
                  </option>
                ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Note: Claims can only be filed against IN_FORCE policy contracts.
            </p>
          </div>

          <div className="form-group">
            <label>Claim Classification Type</label>
            <select value={claimType} onChange={(e) => setClaimType(e.target.value)}>
              <option value="COLLISION">Collision</option>
              <option value="COMPREHENSIVE">Comprehensive (Theft/Damage)</option>
              <option value="THIRD_PARTY_LIABILITY">Third-Party Liability</option>
              <option value="GLASS_DAMAGE">Glass Damage</option>
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Loss Date *</label>
              <input
                type="date"
                value={lossDate}
                onChange={(e) => setLossDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Reported Date *</label>
              <input
                type="date"
                value={reportedDate}
                onChange={(e) => setReportedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Claim Occurrence Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a summary of the accident details..."
              rows={4}
            />
          </div>
        </form>
      </Modal>

      {/* Close Claim Modal */}
      <Modal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        title="Close Claim Record"
        footer={
          <>
            <Button onClick={() => setIsCloseOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCloseSubmit} variant="primary" isLoading={closeMutation.isPending}>
              Close Claim
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Claim Settlement / Close Reason *</label>
          <input
            type="text"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            placeholder="e.g. Settled payout, rejected/no damage"
          />
        </div>
      </Modal>

      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};
