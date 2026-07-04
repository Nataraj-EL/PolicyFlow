package policyflow.api.dto;

import java.util.UUID;

/**
 * Data Transfer Object representing a Vehicle.
 */
public class VehicleDto {
    private UUID id;
    private String vin;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String vehicleType; // e.g. PASSENGER_AUTO, COMMERCIAL_AUTO
    private String fuelType; // e.g. GASOLINE, DIESEL, ELECTRIC, HYBRID

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
}
