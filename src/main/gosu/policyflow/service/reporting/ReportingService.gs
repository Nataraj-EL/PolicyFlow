package policyflow.service.reporting

uses policyflow.domain.reporting.PortfolioSummary

/**
 * Service interface for generating portfolio reporting statistics and summaries.
 */
public interface ReportingService {
  /**
   * Generates a complete portfolio summary including counts, premium aggregation, and distributions.
   * 
   * @return A compiled PortfolioSummary.
   */
  public function generatePortfolioSummary() : PortfolioSummary
}
