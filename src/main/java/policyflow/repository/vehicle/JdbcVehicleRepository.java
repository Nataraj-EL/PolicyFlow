package policyflow.repository.vehicle;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.vehicle.FuelType;
import policyflow.domain.vehicle.Vehicle;
import policyflow.domain.vehicle.VehicleType;

public class JdbcVehicleRepository implements VehicleRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcVehicleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static void setPrivateField(Object obj, String fieldName, Object value) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set private field " + fieldName, e);
        }
    }

    private final RowMapper<Vehicle> rowMapper = new RowMapper<Vehicle>() {
        @Override
        public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
            String vin = rs.getString("vin");
            Vehicle vehicle = new Vehicle(vin);
            
            setPrivateField(vehicle, "_id", UUID.fromString(rs.getString("id")));
            vehicle.setMake(rs.getString("make"));
            vehicle.setModel(rs.getString("model"));
            vehicle.setManufactureYear(rs.getInt("manufacture_year"));
            vehicle.setLicensePlate(rs.getString("license_plate"));
            
            String vehicleTypeStr = rs.getString("vehicle_type");
            if (vehicleTypeStr != null) {
                vehicle.setVehicleType(VehicleType.valueOf(vehicleTypeStr));
            }
            
            String fuelTypeStr = rs.getString("fuel_type");
            if (fuelTypeStr != null) {
                vehicle.setFuelType(FuelType.valueOf(fuelTypeStr));
            }
            
            return vehicle;
        }
    };

    @Override
    public Vehicle save(Vehicle vehicle) {
        if (vehicle == null) return null;
        UUID id = vehicle.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM vehicles WHERE id = ?",
            Integer.class,
            id.toString()
        );

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE vehicles SET vin = ?, make = ?, model = ?, manufacture_year = ?, license_plate = ?, vehicle_type = ?, fuel_type = ? WHERE id = ?",
                vehicle.getVIN(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getManufactureYear(),
                vehicle.getLicensePlate(),
                vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null,
                vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null,
                id.toString()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO vehicles (id, vin, make, model, manufacture_year, license_plate, vehicle_type, fuel_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                vehicle.getVIN(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getManufactureYear(),
                vehicle.getLicensePlate(),
                vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null,
                vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null
            );
        }
        return vehicle;
    }

    @Override
    public Vehicle findById(UUID id) {
        if (id == null) return null;
        List<Vehicle> vehicles = jdbcTemplate.query(
            "SELECT * FROM vehicles WHERE id = ?",
            rowMapper,
            id.toString()
        );
        return vehicles.isEmpty() ? null : vehicles.get(0);
    }

    @Override
    public Vehicle findByVin(String vin) {
        if (vin == null) return null;
        List<Vehicle> vehicles = jdbcTemplate.query(
            "SELECT * FROM vehicles WHERE vin = ?",
            rowMapper,
            vin
        );
        return vehicles.isEmpty() ? null : vehicles.get(0);
    }

    @Override
    public List<Vehicle> findAll() {
        return jdbcTemplate.query("SELECT * FROM vehicles", rowMapper);
    }

    @Override
    public boolean delete(UUID id) {
        if (id == null) return false;
        int rows = jdbcTemplate.update("DELETE FROM vehicles WHERE id = ?", id.toString());
        return rows > 0;
    }

    @Override
    public Vehicle findByLicensePlate(String plate) {
        if (plate == null) return null;
        List<Vehicle> vehicles = jdbcTemplate.query(
            "SELECT * FROM vehicles WHERE license_plate = ?",
            rowMapper,
            plate
        );
        return vehicles.isEmpty() ? null : vehicles.get(0);
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM vehicles");
    }
}
