import React, { useState, useMemo } from 'react';
import { 
  useContacts, 
  useCreateContact, 
  useUpdateContact, 
  useDeleteContact 
} from '../../services/queries';
import { Contact } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';

export const Contacts: React.FC = () => {
  const { data: contacts, isLoading, error } = useContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  // Form State
  const [contactType, setContactType] = useState<'PERSON' | 'COMPANY'>('PERSON');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Touched state tracker
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validations
  const formErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (contactType === 'PERSON') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
    }

    // Email validation: standard email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress.trim()) {
      errs.emailAddress = 'Email address is required';
    } else if (!emailRegex.test(emailAddress)) {
      errs.emailAddress = 'Invalid email format';
    }

    // Phone number: required, exactly 10 digits (numeric only)
    if (!phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(phoneNumber)) {
      errs.phoneNumber = 'Phone number must contain numbers only';
    } else if (phoneNumber.length !== 10) {
      errs.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (!addressLine1.trim()) errs.addressLine1 = 'Address Line 1 is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!state.trim()) errs.state = 'State is required';

    // PIN Code: exactly 6 digits
    if (!postalCode.trim()) {
      errs.postalCode = 'PIN Code is required';
    } else if (!/^\d+$/.test(postalCode)) {
      errs.postalCode = 'PIN Code must contain numbers only';
    } else if (postalCode.length !== 6) {
      errs.postalCode = 'PIN Code must be exactly 6 digits';
    }

    return errs;
  }, [contactType, firstName, lastName, companyName, emailAddress, phoneNumber, addressLine1, city, state, postalCode]);

  const isFormInvalid = Object.keys(formErrors).length > 0;

  const resetForm = () => {
    setSelectedContact(null);
    setContactType('PERSON');
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setEmailAddress('');
    setPhoneNumber('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setTouched({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setContactType(contact.contactType);
    setFirstName(contact.firstName || '');
    setLastName(contact.lastName || '');
    setCompanyName(contact.companyName || '');
    setEmailAddress(contact.emailAddress || '');
    setPhoneNumber(contact.phoneNumber || '');
    setAddressLine1(contact.addressLine1 || '');
    setAddressLine2(contact.addressLine2 || '');
    setCity(contact.city || '');
    setState(contact.state || '');
    setPostalCode(contact.postalCode || '');
    setTouched({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setContactToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormInvalid) {
      const allTouched: Record<string, boolean> = {
        firstName: true,
        lastName: true,
        companyName: true,
        emailAddress: true,
        phoneNumber: true,
        addressLine1: true,
        city: true,
        state: true,
        postalCode: true
      };
      setTouched(allTouched);
      showToast('Please correct form validation errors.', 'warning');
      return;
    }

    const payload: Contact = {
      contactType,
      firstName: contactType === 'PERSON' ? firstName : undefined,
      lastName: contactType === 'PERSON' ? lastName : undefined,
      companyName: contactType === 'COMPANY' ? companyName : undefined,
      emailAddress,
      phoneNumber,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
    };

    if (selectedContact?.id) {
      updateMutation.mutate(
        { id: selectedContact.id, data: payload },
        {
          onSuccess: () => {
            showToast('Contact updated successfully.', 'success');
            setIsModalOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            showToast(err.message || 'Failed to update contact.', 'error');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast('Contact created successfully.', 'success');
          setIsModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to create contact.', 'error');
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!contactToDelete) return;
    deleteMutation.mutate(contactToDelete, {
      onSuccess: () => {
        showToast('Contact deleted successfully.', 'success');
        setIsDeleteOpen(false);
        setContactToDelete(null);
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to delete contact.', 'error');
      },
    });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading contacts...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Card
        title="All Customer Contacts"
        subtitle="Manage customer directories, addresses, and details."
        actions={
          <Button onClick={handleOpenAdd} variant="primary">
            <UserPlus size={16} /> Add Contact
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          {contacts?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No contacts recorded. Click 'Add Contact' to get started.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name / Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts?.map((contact) => (
                  <tr key={contact.id}>
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
                        {contact.contactType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {contact.contactType === 'PERSON'
                        ? `${contact.firstName} ${contact.lastName}`
                        : contact.companyName}
                    </td>
                    <td>{contact.emailAddress}</td>
                    <td>{contact.phoneNumber || 'N/A'}</td>
                    <td>
                      {contact.city}, {contact.state} {contact.postalCode}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button onClick={() => handleOpenEdit(contact)} variant="outline" style={{ minHeight: '32px', padding: '4px 8px' }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          onClick={() => contact.id && handleOpenDelete(contact.id)}
                          variant="danger"
                          style={{ minHeight: '32px', padding: '4px 8px' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedContact ? 'Edit Contact' : 'Create Contact'}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">Cancel</Button>
            <Button
              onClick={handleFormSubmit}
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
              disabled={isFormInvalid}
            >
              {selectedContact ? 'Save Changes' : 'Create Contact'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Contact Type</label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value as 'PERSON' | 'COMPANY')}
              disabled={!!selectedContact} // Type is immutable once created
            >
              <option value="PERSON">Person / Individual</option>
              <option value="COMPANY">Company / Corporate</option>
            </select>
          </div>

          {contactType === 'PERSON' ? (
            <div className="form-grid-2">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                  placeholder="Nataraj"
                />
                {touched.firstName && formErrors.firstName && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                  placeholder="EL"
                />
                {touched.lastName && formErrors.lastName && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.lastName}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
                placeholder="e.g. Acme Corp"
              />
              {touched.companyName && formErrors.companyName && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.companyName}</span>
              )}
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, emailAddress: true }))}
                placeholder="natarajel.dev@gmail.com"
              />
              {touched.emailAddress && formErrors.emailAddress && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.emailAddress}</span>
              )}
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, phoneNumber: true }))}
                placeholder="e.g. 9876543210"
              />
              {touched.phoneNumber && formErrors.phoneNumber && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.phoneNumber}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Address Line 1 *</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, addressLine1: true }))}
              placeholder="No. 12, Anna Main Road"
            />
            {touched.addressLine1 && formErrors.addressLine1 && (
              <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.addressLine1}</span>
            )}
          </div>

          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Near GST Road"
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, city: true }))}
                placeholder="Chennai"
              />
              {touched.city && formErrors.city && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.city}</span>
              )}
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, state: true }))}
                placeholder="Tamil Nadu"
              />
              {touched.state && formErrors.state && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.state}</span>
              )}
            </div>
            <div className="form-group">
              <label>PIN Code *</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, postalCode: true }))}
                placeholder="600069"
              />
              {touched.postalCode && formErrors.postalCode && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.postalCode}</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button onClick={() => setIsDeleteOpen(false)} variant="secondary">Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="danger"
              isLoading={deleteMutation.isPending}
            >
              Delete Contact
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete this customer contact record? This action is permanent and cannot be undone.
        </p>
      </Modal>

      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};
