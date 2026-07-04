package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import policyflow.api.dto.ContactDto;
import policyflow.api.dto.PolicyDto;
import policyflow.api.dto.ClaimDto;
import policyflow.api.util.DtoMapper;

import policyflow.domain.search.ContactSearchCriteria;
import policyflow.domain.search.PolicySearchCriteria;
import policyflow.domain.search.ClaimSearchCriteria;

import policyflow.domain.account.Contact;
import policyflow.domain.policy.Policy;
import policyflow.domain.policy.PolicyStatus;
import policyflow.domain.policy.PolicyType;
import policyflow.domain.claim.Claim;
import policyflow.domain.claim.ClaimStatus;

import policyflow.service.search.SearchService;

import java.util.ArrayList;
import java.util.List;

/**
 * REST controller for executing advanced search queries.
 */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactDto>> searchContacts(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "vehicleMake", required = false) String vehicleMake) {
        ContactSearchCriteria criteria = new ContactSearchCriteria();
        criteria.setFirstName(firstName);
        criteria.setLastName(lastName);
        criteria.setEmail(email);
        criteria.setVehicleMake(vehicleMake);

        List<Contact> list = searchService.searchContacts(criteria);
        List<ContactDto> results = new ArrayList<>();
        if (list != null) {
            for (Contact contact : list) {
                results.add(DtoMapper.toDto(contact));
            }
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> searchPolicies(
            @RequestParam(value = "policyNumber", required = false) String policyNumber,
            @RequestParam(value = "contactFirstName", required = false) String contactFirstName,
            @RequestParam(value = "contactLastName", required = false) String contactLastName,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type) {
        PolicySearchCriteria criteria = new PolicySearchCriteria();
        criteria.setPolicyNumber(policyNumber);
        criteria.setContactFirstName(contactFirstName);
        criteria.setContactLastName(contactLastName);
        if (status != null && !status.trim().isEmpty()) {
            criteria.setStatus(PolicyStatus.valueOf(status.toUpperCase()));
        }
        if (type != null && !type.trim().isEmpty()) {
            criteria.setType(PolicyType.valueOf(type.toUpperCase()));
        }

        List<Policy> list = searchService.searchPolicies(criteria);
        List<PolicyDto> results = new ArrayList<>();
        if (list != null) {
            for (Policy policy : list) {
                results.add(DtoMapper.toDto(policy));
            }
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimDto>> searchClaims(
            @RequestParam(value = "claimNumber", required = false) String claimNumber,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "vin", required = false) String vin,
            @RequestParam(value = "contactEmail", required = false) String contactEmail) {
        ClaimSearchCriteria criteria = new ClaimSearchCriteria();
        criteria.setClaimNumber(claimNumber);
        if (status != null && !status.trim().isEmpty()) {
            criteria.setStatus(ClaimStatus.valueOf(status.toUpperCase()));
        }
        criteria.setVin(vin);
        criteria.setContactEmail(contactEmail);

        List<Claim> list = searchService.searchClaims(criteria);
        List<ClaimDto> results = new ArrayList<>();
        if (list != null) {
            for (Claim claim : list) {
                results.add(DtoMapper.toDto(claim));
            }
        }
        return ResponseEntity.ok(results);
    }
}
