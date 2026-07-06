import React, { useState, useMemo } from 'react';
import { 
  useVehicles, 
  useCreateVehicle, 
  useUpdateVehicle, 
  useDeleteVehicle 
} from '../../services/queries';
import { Vehicle } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Car, Edit2, Trash2, Plus } from 'lucide-react';

export const Vehicles: React.FC = () => {
  const { data: vehicles, isLoading, error } = useVehicles();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Form State
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('SEDAN');
  const [fuelType, setFuelType] = useState('GASOLINE');

  // Touched state tracker
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validations
  const formErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    const vinRegex = /^[A-Za-z0-9]{17}$/;
    if (!vin.trim()) {
      errs.vin = 'VIN is required';
    } else if (!vinRegex.test(vin)) {
      errs.vin = 'VIN must be exactly 17 alphanumeric characters';
    }

    if (!make.trim()) errs.make = 'Vehicle Make is required';
    if (!model.trim()) errs.model = 'Vehicle Model is required';

    const currentYear = new Date().getFullYear();
    if (!year) {
      errs.year = 'Manufacture Year is required';
    } else if (year < 1900 || year > currentYear + 1) {
      errs.year = `Manufacture year must be between 1900 and ${currentYear + 1}`;
    }

    return errs;
  }, [vin, make, model, year]);

  const isFormInvalid = Object.keys(formErrors).length > 0;

  const resetForm = () => {
    setSelectedVehicle(null);
    setVin('');
    setMake('');
    setModel('');
    setYear(new Date().getFullYear());
    setLicensePlate('');
    setVehicleType('SEDAN');
    setFuelType('GASOLINE');
    setTouched({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVin(vehicle.vin);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setLicensePlate(vehicle.licensePlate || '');
    setVehicleType(vehicle.vehicleType);
    setFuelType(vehicle.fuelType);
    setTouched({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setVehicleToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormInvalid) {
      const allTouched: Record<string, boolean> = {
        vin: true,
        make: true,
        model: true,
        year: true
      };
      setTouched(allTouched);
      showToast('Please correct form validation errors.', 'warning');
      return;
    }

    const payload: Vehicle = {
      vin: vin.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      year,
      licensePlate: licensePlate.trim() || undefined,
      vehicleType,
      fuelType,
    };

    if (selectedVehicle?.id) {
      updateMutation.mutate(
        { id: selectedVehicle.id, data: payload },
        {
          onSuccess: () => {
            showToast('Vehicle updated successfully.', 'success');
            setIsModalOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            showToast(err.message || 'Failed to update vehicle.', 'error');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast('Vehicle created successfully.', 'success');
          setIsModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to create vehicle.', 'error');
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!vehicleToDelete) return;
    deleteMutation.mutate(vehicleToDelete, {
      onSuccess: () => {
        showToast('Vehicle deleted successfully.', 'success');
        setIsDeleteOpen(false);
        setVehicleToDelete(null);
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to delete vehicle.', 'error');
      },
    });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading vehicles...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Card
        title="Vehicle Risk Registry"
        subtitle="Manage and view vehicle risk assets and identifiers."
        actions={
          <Button onClick={handleOpenAdd} variant="primary">
            <Plus size={16} /> Add Vehicle
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          {vehicles?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No vehicles registered. Click 'Add Vehicle' to get started.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>VIN</th>
                  <th>Make / Model</th>
                  <th>Year</th>
                  <th>Body Type</th>
                  <th>Fuel</th>
                  <th>License Plate</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles?.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {vehicle.vin}
                    </td>
                    <td>{vehicle.make} {vehicle.model}</td>
                    <td>{vehicle.year}</td>
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
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td>{vehicle.fuelType}</td>
                    <td>{vehicle.licensePlate || 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button onClick={() => handleOpenEdit(vehicle)} variant="outline" style={{ minHeight: '32px', padding: '4px 8px' }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          onClick={() => vehicle.id && handleOpenDelete(vehicle.id)}
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
        title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">Cancel</Button>
            <Button
              onClick={handleFormSubmit}
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
              disabled={isFormInvalid}
            >
              {selectedVehicle ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>VIN (Vehicle Identification Number) *</label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, vin: true }))}
              placeholder="17 Alphanumeric characters"
              maxLength={17}
              disabled={!!selectedVehicle} // VIN is immutable in PolicyFlow domain
              style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
            />
            {touched.vin && formErrors.vin && (
              <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.vin}</span>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Vehicle Make *</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, make: true }))}
                placeholder="e.g. Ford"
              />
              {touched.make && formErrors.make && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.make}</span>
              )}
            </div>
            <div className="form-group">
              <label>Vehicle Model *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, model: true }))}
                placeholder="e.g. Explorer"
              />
              {touched.model && formErrors.model && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.model}</span>
              )}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Manufacture Year *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 0)}
                onBlur={() => setTouched(prev => ({ ...prev, year: true }))}
                placeholder="e.g. 2017"
              />
              {touched.year && formErrors.year && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.year}</span>
              )}
            </div>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="e.g. XYZ-9876 (Optional)"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="form-grid-2">
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
            <div className="form-group">
              <label>Fuel Type</label>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                <option value="GASOLINE">Gasoline</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric (EV)</option>
                <option value="HYBRID">Hybrid</option>
              </select>
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
              Delete Vehicle
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete this vehicle record? This action is permanent and cannot be undone.
        </p>
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
