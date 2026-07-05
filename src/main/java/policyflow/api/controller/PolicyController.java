package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import policyflow.api.dto.PolicyDto;
import policyflow.api.dto.PolicyHistoryEntryDto;
import policyflow.api.util.DtoMapper;
import policyflow.common.time.ClockProvider;
import policyflow.domain.policy.Policy;
import policyflow.domain.policy.PolicyHistoryEntry;
import policyflow.service.policy.PolicyService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing Policies and Policy lifecycle transactions.
 */
@RestController
@RequestMapping("/api/policies")
@Transactional
public class PolicyController {

    private final PolicyService policyService;

    @Autowired
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public ResponseEntity<List<PolicyDto>> getAllPolicies() {
        List<Policy> list = policyService.getAllPolicies();
        List<PolicyDto> policies = new ArrayList<>();
        if (list != null) {
            for (Policy policy : list) {
                policies.add(DtoMapper.toDto(policy));
            }
        }
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable("id") UUID id) {
        Policy policy = policyService.getPolicy(id);
        if (policy == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toDto(policy));
    }

    @PostMapping
    public ResponseEntity<PolicyDto> createPolicy(@RequestBody PolicyDto dto) {
        Policy policy = DtoMapper.toDomain(dto);
        Policy created = policyService.createPolicy(policy);
        return new ResponseEntity<>(DtoMapper.toDto(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PolicyDto> updatePolicy(@PathVariable("id") UUID id, @RequestBody PolicyDto dto) {
        dto.setId(id);
        Policy policy = DtoMapper.toDomain(dto);
        Policy updated = policyService.updatePolicy(policy);
        return ResponseEntity.ok(DtoMapper.toDto(updated));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelPolicy(
            @PathVariable("id") UUID id,
            @RequestParam(value = "cancellationDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate cancellationDate,
            @RequestParam("reason") String reason) {
        LocalDate date = cancellationDate != null ? cancellationDate : ClockProvider.nowLocalDate();
        policyService.cancelPolicy(id, date, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<PolicyDto> renewPolicy(@PathVariable("id") UUID id) {
        Policy renewed = policyService.renewPolicy(id);
        return ResponseEntity.ok(DtoMapper.toDto(renewed));
    }

    @PostMapping("/{id}/reinstate")
    public ResponseEntity<Void> reinstatePolicy(
            @PathVariable("id") UUID id,
            @RequestParam("reason") String reason) {
        policyService.reinstatePolicy(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<PolicyHistoryEntryDto>> getPolicyHistory(@PathVariable("id") UUID id) {
        List<PolicyHistoryEntry> list = policyService.getPolicyHistory(id);
        List<PolicyHistoryEntryDto> history = new ArrayList<>();
        if (list != null) {
            for (PolicyHistoryEntry entry : list) {
                history.add(DtoMapper.toDto(entry));
            }
        }
        return ResponseEntity.ok(history);
    }
}
