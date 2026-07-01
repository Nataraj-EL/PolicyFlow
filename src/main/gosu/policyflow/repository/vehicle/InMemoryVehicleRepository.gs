package policyflow.repository.vehicle

uses policyflow.domain.vehicle.Vehicle
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link VehicleRepository} for in-memory persistence.
 */
public class InMemoryVehicleRepository implements VehicleRepository {
  private var _db = new ConcurrentHashMap<UUID, Vehicle>()

  override function save(vehicle : Vehicle) : Vehicle {
    if (vehicle == null) {
      throw new IllegalArgumentException("Vehicle cannot be null")
    }
    if (vehicle.ID == null) {
      throw new IllegalArgumentException("Vehicle ID cannot be null")
    }
    _db.put(vehicle.ID, vehicle)
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
    var cleanVin = vin.trim().toLowerCase()
    for (v in _db.values()) {
      var currentVin = v.VIN ?: ""
      if (currentVin.trim().toLowerCase().equals(cleanVin)) {
        return v
      }
    }
    return null
  }

  override function findAll() : List<Vehicle> {
    return new ArrayList<Vehicle>(_db.values())
  }

  override function delete(id : UUID) : boolean {
    if (id == null) {
      return false
    }
    return _db.remove(id) != null
  }

  override function clear() {
    _db.clear()
  }
}
