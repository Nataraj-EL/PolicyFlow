package policyflow.api.dto;

import java.math.BigDecimal;

/**
 * Data Transfer Object representing the calculated premium breakdown.
 */
public class PremiumBreakdownDto {
    private BigDecimal basePremium;
    private BigDecimal vehicleAgeFactor;
    private BigDecimal vehicleTypeFactor;
    private BigDecimal fuelTypeFactor;
    private BigDecimal contactTypeFactor;
    private BigDecimal tax;
    private BigDecimal totalPremium;

    public BigDecimal getBasePremium() { return basePremium; }
    public void setBasePremium(BigDecimal basePremium) { this.basePremium = basePremium; }

    public BigDecimal getVehicleAgeFactor() { return vehicleAgeFactor; }
    public void setVehicleAgeFactor(BigDecimal vehicleAgeFactor) { this.vehicleAgeFactor = vehicleAgeFactor; }

    public BigDecimal getVehicleTypeFactor() { return vehicleTypeFactor; }
    public void setVehicleTypeFactor(BigDecimal vehicleTypeFactor) { this.vehicleTypeFactor = vehicleTypeFactor; }

    public BigDecimal getFuelTypeFactor() { return fuelTypeFactor; }
    public void setFuelTypeFactor(BigDecimal fuelTypeFactor) { this.fuelTypeFactor = fuelTypeFactor; }

    public BigDecimal getContactTypeFactor() { return contactTypeFactor; }
    public void setContactTypeFactor(BigDecimal contactTypeFactor) { this.contactTypeFactor = contactTypeFactor; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getTotalPremium() { return totalPremium; }
    public void setTotalPremium(BigDecimal totalPremium) { this.totalPremium = totalPremium; }
}
