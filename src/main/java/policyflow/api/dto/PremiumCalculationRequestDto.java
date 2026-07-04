package policyflow.api.dto;

/**
 * Request payload structure for premium calculation.
 */
public class PremiumCalculationRequestDto {
    private VehicleDto vehicle;
    private ContactDto contact;

    public VehicleDto getVehicle() { return vehicle; }
    public void setVehicle(VehicleDto vehicle) { this.vehicle = vehicle; }

    public ContactDto getContact() { return contact; }
    public void setContact(ContactDto contact) { this.contact = contact; }
}
