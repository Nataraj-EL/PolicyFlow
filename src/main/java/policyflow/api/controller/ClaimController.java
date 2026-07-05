package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import policyflow.api.dto.ClaimDto;
import policyflow.api.util.DtoMapper;
import policyflow.domain.claim.Claim;
import policyflow.service.claim.ClaimService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing Claims.
 */
@RestController
@RequestMapping("/api/claims")
@Transactional
public class ClaimController {

    private final ClaimService claimService;

    @Autowired
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    public ResponseEntity<List<ClaimDto>> getAllClaims() {
        List<Claim> list = claimService.searchClaims(null, null, null);
        List<ClaimDto> claims = new ArrayList<>();
        if (list != null) {
            for (Claim claim : list) {
                claims.add(DtoMapper.toDto(claim));
            }
        }
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimDto> getClaimById(@PathVariable("id") UUID id) {
        Claim claim = claimService.getClaim(id);
        if (claim == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toDto(claim));
    }

    @PostMapping
    public ResponseEntity<ClaimDto> fileClaim(@RequestBody ClaimDto dto) {
        Claim claim = DtoMapper.toDomain(dto);
        Claim created = claimService.fileClaim(claim);
        return new ResponseEntity<>(DtoMapper.toDto(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClaimDto> updateClaim(@PathVariable("id") UUID id, @RequestBody ClaimDto dto) {
        dto.setId(id);
        Claim claim = DtoMapper.toDomain(dto);
        Claim updated = claimService.updateClaim(claim);
        return ResponseEntity.ok(DtoMapper.toDto(updated));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeClaim(@PathVariable("id") UUID id, @RequestParam("reason") String reason) {
        claimService.closeClaim(id, reason);
        return ResponseEntity.ok().build();
    }
}
