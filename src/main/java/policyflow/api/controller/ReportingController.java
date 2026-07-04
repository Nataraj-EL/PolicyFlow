package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import policyflow.api.dto.PortfolioSummaryDto;
import policyflow.api.util.DtoMapper;
import policyflow.service.reporting.ReportingService;

/**
 * REST controller for generating Portfolio Reports.
 */
@RestController
@RequestMapping("/api/reporting")
public class ReportingController {

    private final ReportingService reportingService;

    @Autowired
    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDto> getPortfolioSummary() {
        PortfolioSummaryDto summaryDto = DtoMapper.toDto(reportingService.generatePortfolioSummary());
        return ResponseEntity.ok(summaryDto);
    }
}
