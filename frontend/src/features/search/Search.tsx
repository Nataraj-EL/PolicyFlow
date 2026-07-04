import React, { useState } from 'react';
import { useSearchContacts, useSearchPolicies, useSearchClaims } from '../../services/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search as SearchIcon, Users, FileText, AlertTriangle } from 'lucide-react';

export const Search: React.FC = () => {
  const [entityType, setEntityType] = useState<'CONTACT' | 'POLICY' | 'CLAIM'>('CONTACT');
  const [query, setQuery] = useState('');
  
  // Optional Filter States
  const [contactTypeFilter, setContactTypeFilter] = useState('');
  const [policyStatusFilter, setPolicyStatusFilter] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('');

  // Execution triggers
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [triggerSearch, setTriggerSearch] = useState(false);

  // TanStack Queries (enabled only when triggerSearch is true)
  const { data: contactsResult, isLoading: contactsLoading } = useSearchContacts(
    searchParams,
    triggerSearch && entityType === 'CONTACT'
  );

  const { data: policiesResult, isLoading: policiesLoading } = useSearchPolicies(
    searchParams,
    triggerSearch && entityType === 'POLICY'
  );

  const { data: claimsResult, isLoading: claimsLoading } = useSearchClaims(
    searchParams,
    triggerSearch && entityType === 'CLAIM'
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: Record<string, string> = {
      q: query.trim(),
    };

    if (entityType === 'CONTACT' && contactTypeFilter) {
      params.contactType = contactTypeFilter;
    } else if (entityType === 'POLICY' && policyStatusFilter) {
      params.status = policyStatusFilter;
    } else if (entityType === 'CLAIM' && claimStatusFilter) {
      params.status = claimStatusFilter;
    }

    setSearchParams(params);
    setTriggerSearch(true);
  };

  const isLoading = contactsLoading || policiesLoading || claimsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Criteria Card */}
      <Card title="Cross-Entity Global Lookup" subtitle="Search across customer contact records, insurance policies, and claim details.">
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 2fr', gap: '16px', alignItems: 'flex-end' }} className="search-grid-responsive">
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Target Entity</label>
              <select
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value as 'CONTACT' | 'POLICY' | 'CLAIM');
                  setTriggerSearch(false); // Reset search state
                }}
              >
                <option value="CONTACT">Contacts / Customers</option>
                <option value="POLICY">Insurance Policies</option>
                <option value="CLAIM">Claims Registry</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Search Term *</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  entityType === 'CONTACT'
                    ? 'Search name, email, city...'
                    : entityType === 'POLICY'
                    ? 'Search policy number, insured name...'
                    : 'Search claim number, description...'
                }
              />
            </div>

            {/* Conditionally rendered optional filters */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              {entityType === 'CONTACT' && (
                <>
                  <label>Type Filter</label>
                  <select value={contactTypeFilter} onChange={(e) => setContactTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="PERSON">PERSON</option>
                    <option value="COMPANY">COMPANY</option>
                  </select>
                </>
              )}

              {entityType === 'POLICY' && (
                <>
                  <label>Status Filter</label>
                  <select value={policyStatusFilter} onChange={(e) => setPolicyStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="IN_FORCE">IN_FORCE</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </>
              )}

              {entityType === 'CLAIM' && (
                <>
                  <label>Status Filter</label>
                  <select value={claimStatusFilter} onChange={(e) => setClaimStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              <SearchIcon size={16} /> Execute Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Search Results Card */}
      {triggerSearch && (
        <Card title="Search Results" subtitle={`Found results matching your criteria.`}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Searching database...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              
              {/* Contacts Result Table */}
              {entityType === 'CONTACT' && (
                <>
                  {!contactsResult || contactsResult.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>No matching contact records found.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactsResult.map((c) => (
                          <tr key={c.id}>
                            <td>{c.contactType}</td>
                            <td style={{ fontWeight: 600 }}>{c.contactType === 'PERSON' ? `${c.firstName} ${c.lastName}` : c.companyName}</td>
                            <td>{c.emailAddress}</td>
                            <td>{c.phoneNumber || 'N/A'}</td>
                            <td>{c.city}, {c.state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* Policies Result Table */}
              {entityType === 'POLICY' && (
                <>
                  {!policiesResult || policiesResult.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>No matching policy contracts found.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Policy Number</th>
                          <th>Line of Business</th>
                          <th>Effective Dates</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policiesResult.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{p.policyNumber}</td>
                            <td>{p.policyType?.replace('_', ' ')}</td>
                            <td>{p.effectiveDate} to {p.expirationDate}</td>
                            <td>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: 'var(--color-muted)',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* Claims Result Table */}
              {entityType === 'CLAIM' && (
                <>
                  {!claimsResult || claimsResult.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>No matching claim records found.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Claim Number</th>
                          <th>Classification Type</th>
                          <th>Loss Date</th>
                          <th>Status</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimsResult.map((c) => (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{c.claimNumber}</td>
                            <td>{c.claimType}</td>
                            <td>{c.lossDate}</td>
                            <td>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: 'var(--color-muted)',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td>{c.description || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

            </div>
          )}
        </Card>
      )}

      <style>{`
        @media (max-width: 768px) {
          .search-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>

    </div>
  );
};
