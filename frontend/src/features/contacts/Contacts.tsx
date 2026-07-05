import React, { useState } from 'react';
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
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setContactToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (contactType === 'PERSON') {
      if (!firstName.trim() || !lastName.trim()) {
        showToast('First and Last names are required for Person contact type.', 'warning');
        return;
      }
    } else {
      if (!companyName.trim()) {
        showToast('Company name is required for Company contact type.', 'warning');
        return;
      }
    }

    if (!emailAddress.trim() || !emailAddress.includes('@') || !emailAddress.includes('.')) {
      showToast('A valid email address containing @ and . is required.', 'warning');
      return;
    }

    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      showToast('Physical address details (Line 1, City, State, and Postal Code) are required.', 'warning');
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nataraj"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="EL"
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="natarajel.dev@gmail.com"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 555-0199"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address Line 1 *</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="No. 12, Anna Main Road"
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Chennai"
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Tamil Nadu"
              />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="600069"
              />
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

    </div>
  );
};
