package policyflow.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object exposing portfolio reporting details.
 */
public class PortfolioSummaryDto {
    private int activePoliciesCount;
    private int openClaimsCount;
    private BigDecimal totalActivePremium;
    private LocalDateTime generatedAt;
    private Map<String, Integer> policiesByStatus;
    private Map<String, Integer> policiesByType;
    private Map<String, Integer> claimsByStatus;
    private Map<String, Integer> claimsByType;

    public int getActivePoliciesCount() { return activePoliciesCount; }
    public void setActivePoliciesCount(int activePoliciesCount) { this.activePoliciesCount = activePoliciesCount; }

    public int getOpenClaimsCount() { return openClaimsCount; }
    public void setOpenClaimsCount(int openClaimsCount) { this.openClaimsCount = openClaimsCount; }

    public BigDecimal getTotalActivePremium() { return totalActivePremium; }
    public void setTotalActivePremium(BigDecimal totalActivePremium) { this.totalActivePremium = totalActivePremium; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public Map<String, Integer> getPoliciesByStatus() { return policiesByStatus; }
    public void setPoliciesByStatus(Map<String, Integer> policiesByStatus) { this.policiesByStatus = policiesByStatus; }

    public Map<String, Integer> getPoliciesByType() { return policiesByType; }
    public void setPoliciesByType(Map<String, Integer> policiesByType) { this.policiesByType = policiesByType; }

    public Map<String, Integer> getClaimsByStatus() { return claimsByStatus; }
    public void setClaimsByStatus(Map<String, Integer> claimsByStatus) { this.claimsByStatus = claimsByStatus; }

    public Map<String, Integer> getClaimsByType() { return claimsByType; }
    public void setClaimsByType(Map<String, Integer> claimsByType) { this.claimsByType = claimsByType; }
}
