import React, { useState } from 'react';
import { 
  usePolicies, 
  useCancelPolicy, 
  useRenewPolicy, 
  useReinstatePolicy, 
  useContacts, 
  useVehicles,
  usePolicyHistory,
  useCreatePolicy
} from '../../services/queries';
import { Policy, Contact, Vehicle } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FilePlus, History, Ban, RefreshCw, Undo, Eye } from 'lucide-react';

export const Policies: React.FC = () => {
  const { data: policies, isLoading: isPoliciesLoading } = usePolicies();
  const { data: contacts, isLoading: isContactsLoading } = useContacts();
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles();
  
  const createMutation = useCreatePolicy();
  const cancelMutation = useCancelPolicy();
  const renewMutation = useRenewPolicy();
  const reinstateMutation = useReinstatePolicy();
  const { showToast } = useToast();

  // Modals visibility state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReinstateOpen, setIsReinstateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Selected targets
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  // Policy Creation Form State
  const [contactId, setContactId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [policyType, setPolicyType] = useState('PERSONAL_AUTO');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );

  // Cancellation Form State
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationDate, setCancellationDate] = useState(new Date().toISOString().split('T')[0]);

  // Reinstatement Form State
  const [reinstateReason, setReinstateReason] = useState('');

  // Fetch History Query
  const { data: historyLogs, isLoading: isHistoryLoading } = usePolicyHistory(selectedPolicyId || '');

  const resetCreateForm = () => {
    setContactId('');
    setVehicleId('');
    setPolicyType('PERSONAL_AUTO');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setExpirationDate(
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    );
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactId || !vehicleId) {
      showToast('You must select a Customer Contact and a Vehicle Risk.', 'warning');
      return;
    }

    if (new Date(expirationDate) <= new Date(effectiveDate)) {
      showToast('Expiration date must fall strictly after the effective date.', 'warning');
      return;
    }

    const payload: Policy = {
      contactId,
      vehicleId,
      policyType,
      effectiveDate,
      expirationDate,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast('Policy Draft created successfully.', 'success');
        setIsCreateOpen(false);
        resetCreateForm();
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to create policy.', 'error');
      },
    });
  };

  const handleOpenCancel = (id: string) => {
    setSelectedPolicyId(id);
    setCancellationReason('');
    setCancellationDate(new Date().toISOString().split('T')[0]);
    setIsCancelOpen(true);
  };

  const handleCancelSubmit = () => {
    if (!selectedPolicyId) return;
    if (!cancellationReason.trim()) {
      showToast('Cancellation reason is required.', 'warning');
      return;
    }

    cancelMutation.mutate(
      { id: selectedPolicyId, reason: cancellationReason, date: cancellationDate },
      {
        onSuccess: () => {
          showToast('Policy cancelled successfully.', 'success');
          setIsCancelOpen(false);
          setSelectedPolicyId(null);
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to cancel policy.', 'error');
        },
      }
    );
  };

  const handleOpenReinstate = (id: string) => {
    setSelectedPolicyId(id);
    setReinstateReason('');
    setIsReinstateOpen(true);
  };

  const handleReinstateSubmit = () => {
    if (!selectedPolicyId) return;
    if (!reinstateReason.trim()) {
      showToast('Reinstatement reason is required.', 'warning');
      return;
    }

    reinstateMutation.mutate(
      { id: selectedPolicyId, reason: reinstateReason },
      {
        onSuccess: () => {
          showToast('Policy reinstated successfully to IN_FORCE status.', 'success');
          setIsReinstateOpen(false);
          setSelectedPolicyId(null);
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to reinstate policy.', 'error');
        },
      }
    );
  };

  const handleRenew = (id: string) => {
    renewMutation.mutate(id, {
      onSuccess: () => {
        showToast('Policy renewed for a new term successfully.', 'success');
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to renew policy.', 'error');
      },
    });
  };

  const handleOpenHistory = (id: string) => {
    setSelectedPolicyId(id);
    setIsHistoryOpen(true);
  };

  const getContactName = (id: string) => {
    const contact = contacts?.find((c) => c.id === id);
    if (!contact) return 'Unknown';
    return contact.contactType === 'PERSON'
      ? `${contact.firstName} ${contact.lastName}`
      : contact.companyName;
  };

  const getVehicleName = (id: string) => {
    const vehicle = vehicles?.find((v) => v.id === id);
    if (!vehicle) return 'Unknown';
    return `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'IN_FORCE':
        return { bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'CANCELLED':
        return { bg: 'var(--color-error-bg)', color: 'var(--color-error)' };
      case 'DRAFT':
        return { bg: 'var(--color-muted)', color: 'var(--color-text-secondary)' };
      case 'EXPIRED':
        return { bg: '#fffde7', color: '#b78103' };
      default:
        return { bg: 'var(--color-muted)', color: 'var(--color-text-secondary)' };
    }
  };

  if (isPoliciesLoading || isContactsLoading || isVehiclesLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading policies...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Card
        title="Insurance Policy Ledger"
        subtitle="Manage in-force policies, renew terms, process endorsements or cancellations."
        actions={
          <Button onClick={handleOpenCreate} variant="primary">
            <FilePlus size={16} /> Create Policy
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          {policies?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No policies registered. Click 'Create Policy' to establish a new contract term.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Policy Number</th>
                  <th>Insured</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Effective Dates</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies?.map((policy) => {
                  const statusColors = getStatusColor(policy.status);
                  return (
                    <tr key={policy.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {policy.policyNumber}
                      </td>
                      <td style={{ fontWeight: 500 }}>{getContactName(policy.contactId)}</td>
                      <td>{getVehicleName(policy.vehicleId)}</td>
                      <td>{policy.policyType?.replace('_', ' ')}</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {policy.effectiveDate} to {policy.expirationDate}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                          }}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Button
                            onClick={() => policy.id && handleOpenHistory(policy.id)}
                            variant="outline"
                            style={{ minHeight: '32px', padding: '4px 8px' }}
                            title="Audit History"
                          >
                            <History size={14} />
                          </Button>
                          {policy.status === 'IN_FORCE' && (
                            <>
                              <Button
                                onClick={() => policy.id && handleRenew(policy.id)}
                                variant="outline"
                                style={{ minHeight: '32px', padding: '4px 8px' }}
                                title="Renew Policy"
                              >
                                <RefreshCw size={14} />
                              </Button>
                              <Button
                                onClick={() => policy.id && handleOpenCancel(policy.id)}
                                variant="danger"
                                style={{ minHeight: '32px', padding: '4px 8px' }}
                                title="Cancel Policy"
                              >
                                <Ban size={14} />
                              </Button>
                            </>
                          )}
                          {policy.status === 'CANCELLED' && (
                            <Button
                              onClick={() => policy.id && handleOpenReinstate(policy.id)}
                              variant="primary"
                              style={{ minHeight: '32px', padding: '4px 8px', backgroundColor: 'var(--color-success)' }}
                              title="Reinstate Policy"
                            >
                              <Undo size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Creation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Policy"
        footer={
          <>
            <Button onClick={() => setIsCreateOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCreateSubmit} variant="primary" isLoading={createMutation.isPending}>
              Create Policy
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label>Customer Contact *</label>
            <select value={contactId} onChange={(e) => setContactId(e.target.value)}>
              <option value="">-- Select Contact --</option>
              {contacts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contactType === 'PERSON' ? `${c.firstName} ${c.lastName}` : c.companyName} ({c.emailAddress})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vehicle Risk *</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">-- Select Vehicle --</option>
              {vehicles?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.year}) - {v.vin}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Policy Line of Business</label>
            <select value={policyType} onChange={(e) => setPolicyType(e.target.value)}>
              <option value="PERSONAL_AUTO">Personal Auto</option>
              <option value="COMMERCIAL_AUTO">Commercial Auto</option>
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Effective Date *</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Expiration Date *</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Policy"
        footer={
          <>
            <Button onClick={() => setIsCancelOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCancelSubmit} variant="danger" isLoading={cancelMutation.isPending}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Cancellation Reason *</label>
          <input
            type="text"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="e.g. Non-payment, customer request"
          />
        </div>
        <div className="form-group">
          <label>Cancellation Date</label>
          <input
            type="date"
            value={cancellationDate}
            onChange={(e) => setCancellationDate(e.target.value)}
          />
        </div>
      </Modal>

      {/* Reinstatement Modal */}
      <Modal
        isOpen={isReinstateOpen}
        onClose={() => setIsReinstateOpen(false)}
        title="Reinstate Policy"
        footer={
          <>
            <Button onClick={() => setIsReinstateOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleReinstateSubmit} variant="primary" isLoading={reinstateMutation.isPending}>
              Confirm Reinstatement
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Reinstatement Reason *</label>
          <input
            type="text"
            value={reinstateReason}
            onChange={(e) => setReinstateReason(e.target.value)}
            placeholder="e.g. Past due payment received"
          />
        </div>
      </Modal>

      {/* History Audit Logs Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Policy Transaction Audit History"
        footer={<Button onClick={() => setIsHistoryOpen(false)} variant="secondary">Close</Button>}
      >
        {isHistoryLoading ? (
          <div>Loading transaction details...</div>
        ) : historyLogs?.length === 0 ? (
          <div>No transaction logs recorded.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Transaction</th>
                  <th>Transition</th>
                  <th>Performed By</th>
                  <th>Reason/Details</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs?.map((log) => (
                  <tr key={log.id} style={{ fontSize: '0.875rem' }}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{log.transactionType}</td>
                    <td>
                      {log.oldStatus || 'NONE'} &rarr; <span style={{ fontWeight: 600 }}>{log.newStatus}</span>
                    </td>
                    <td>{log.performedBy}</td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
