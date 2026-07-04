package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import policyflow.api.dto.PremiumBreakdownDto;
import policyflow.api.dto.PremiumCalculationRequestDto;
import policyflow.api.util.DtoMapper;
import policyflow.domain.account.Contact;
import policyflow.domain.rating.PremiumBreakdown;
import policyflow.domain.vehicle.Vehicle;
import policyflow.service.rating.PremiumCalculationService;

/**
 * REST controller for executing Premium Calculations.
 */
@RestController
@RequestMapping("/api/premium")
public class PremiumController {

    private final PremiumCalculationService premiumCalculationService;

    @Autowired
    public PremiumController(PremiumCalculationService premiumCalculationService) {
        this.premiumCalculationService = premiumCalculationService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<PremiumBreakdownDto> calculatePremium(@RequestBody PremiumCalculationRequestDto request) {
        if (request == null || request.getVehicle() == null || request.getContact() == null) {
            throw new IllegalArgumentException("Vehicle and Contact details must be provided.");
        }
        Vehicle vehicle = DtoMapper.toDomain(request.getVehicle());
        Contact contact = DtoMapper.toDomain(request.getContact());
        PremiumBreakdown breakdown = premiumCalculationService.calculatePremium(vehicle, contact);
        return ResponseEntity.ok(DtoMapper.toDto(breakdown));
    }
}
