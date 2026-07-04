package policyflow.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object representing a Policy transaction audit entry.
 */
public class PolicyHistoryEntryDto {
    private UUID id;
    private UUID policyId;
    private String transactionType;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime timestamp;
    private String description;
    private String performedBy;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getOldStatus() { return oldStatus; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
