package policyflow.repository.vehicle

uses policyflow.domain.vehicle.Vehicle
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link VehicleRepository} for in-memory persistence.
 * Employs secondary indexes for fast O(1) VIN and LicensePlate lookups.
 */
public class InMemoryVehicleRepository implements VehicleRepository {
  private var _db = new ConcurrentHashMap<UUID, Vehicle>()
  private var _vinIndex = new ConcurrentHashMap<String, Vehicle>()
  private var _plateIndex = new ConcurrentHashMap<String, Vehicle>()

  override function save(vehicle : Vehicle) : Vehicle {
    if (vehicle == null) {
      throw new IllegalArgumentException("Vehicle cannot be null")
    }
    if (vehicle.ID == null) {
      throw new IllegalArgumentException("Vehicle ID cannot be null")
    }

    // Clean old indexes if updating
    var existing = _db.get(vehicle.ID)
    if (existing != null) {
      if (existing.VIN != null) {
        _vinIndex.remove(existing.VIN.trim().toLowerCase())
      }
      if (existing.LicensePlate != null) {
        _plateIndex.remove(existing.LicensePlate.trim().toLowerCase())
      }
    }

    _db.put(vehicle.ID, vehicle)

    if (vehicle.VIN != null && !vehicle.VIN.trim().isEmpty()) {
      _vinIndex.put(vehicle.VIN.trim().toLowerCase(), vehicle)
    }
    if (vehicle.LicensePlate != null && !vehicle.LicensePlate.trim().isEmpty()) {
      _plateIndex.put(vehicle.LicensePlate.trim().toLowerCase(), vehicle)
    }

    return vehicle
  }

  override function findById(id : UUID) : Vehicle {
    if (id == null) {
      return null
    }
    return _db.get(id)
  }

  override function findByVin(vin : String) : Vehicle {
    if (vin == null || vin.trim().isEmpty()) {
      return null
    }
    return _vinIndex.get(vin.trim().toLowerCase())
  }

  override function findByLicensePlate(plate : String) : Vehicle {
    if (plate == null || plate.trim().isEmpty()) {
      return null
    }
    return _plateIndex.get(plate.trim().toLowerCase())
  }

  override function findAll() : List<Vehicle> {
    return new ArrayList<Vehicle>(_db.values())
  }

  override function delete(id : UUID) : boolean {
    if (id == null) {
      return false
    }
    var existing = _db.remove(id)
    if (existing != null) {
      if (existing.VIN != null) {
        _vinIndex.remove(existing.VIN.trim().toLowerCase())
      }
      if (existing.LicensePlate != null) {
        _plateIndex.remove(existing.LicensePlate.trim().toLowerCase())
      }
      return true
    }
    return false
  }

  override function clear() {
    _db.clear()
    _vinIndex.clear()
    _plateIndex.clear()
  }
}
