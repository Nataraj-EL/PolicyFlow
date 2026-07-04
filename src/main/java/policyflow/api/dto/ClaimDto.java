package policyflow.api.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Data Transfer Object representing an Insurance Claim.
 */
public class ClaimDto {
    private UUID id;
    private String claimNumber;
    private UUID policyId;
    private LocalDate lossDate;
    private LocalDate reportedDate;
    private String status; // OPEN, CLOSED
    private String claimType; // e.g. COLLISION, COMPREHENSIVE
    private String description;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public LocalDate getLossDate() { return lossDate; }
    public void setLossDate(LocalDate lossDate) { this.lossDate = lossDate; }

    public LocalDate getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDate reportedDate) { this.reportedDate = reportedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClaimType() { return claimType; }
    public void setClaimType(String claimType) { this.claimType = claimType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
