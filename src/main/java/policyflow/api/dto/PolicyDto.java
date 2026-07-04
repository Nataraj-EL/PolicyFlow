package policyflow.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Data Transfer Object representing an Insurance Policy.
 */
public class PolicyDto {
    private UUID id;
    private String policyNumber;
    private UUID contactId;
    private UUID vehicleId;
    private String policyType; // PERSONAL_AUTO, COMMERCIAL_AUTO
    private String status; // DRAFT, IN_FORCE, CANCELLED, EXPIRED
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    private LocalDate cancellationDate;
    private String cancellationReason;
    private UUID previousPolicyId;
    private BigDecimal basePremium;
    private BigDecimal tax;
    private BigDecimal totalPremium;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public UUID getContactId() { return contactId; }
    public void setContactId(UUID contactId) { this.contactId = contactId; }

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public String getPolicyType() { return policyType; }
    public void setPolicyType(String policyType) { this.policyType = policyType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public LocalDate getCancellationDate() { return cancellationDate; }
    public void setCancellationDate(LocalDate cancellationDate) { this.cancellationDate = cancellationDate; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public UUID getPreviousPolicyId() { return previousPolicyId; }
    public void setPreviousPolicyId(UUID previousPolicyId) { this.previousPolicyId = previousPolicyId; }

    public BigDecimal getBasePremium() { return basePremium; }
    public void setBasePremium(BigDecimal basePremium) { this.basePremium = basePremium; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getTotalPremium() { return totalPremium; }
    public void setTotalPremium(BigDecimal totalPremium) { this.totalPremium = totalPremium; }
}
