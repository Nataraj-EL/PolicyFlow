package policyflow.api.util;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import policyflow.api.dto.ContactDto;
import policyflow.api.dto.VehicleDto;
import policyflow.api.dto.PolicyDto;
import policyflow.api.dto.PolicyHistoryEntryDto;
import policyflow.api.dto.ClaimDto;
import policyflow.api.dto.PremiumBreakdownDto;
import policyflow.api.dto.PortfolioSummaryDto;

import policyflow.domain.account.Contact;
import policyflow.domain.account.ContactType;
import policyflow.domain.account.Address;
import policyflow.domain.vehicle.Vehicle;
import policyflow.domain.vehicle.VehicleType;
import policyflow.domain.vehicle.FuelType;
import policyflow.domain.policy.Policy;
import policyflow.domain.policy.PolicyType;
import policyflow.domain.policy.PolicyStatus;
import policyflow.domain.policy.PolicyHistoryEntry;
import policyflow.domain.policy.PolicyTransactionType;
import policyflow.domain.claim.Claim;
import policyflow.domain.claim.ClaimType;
import policyflow.domain.claim.ClaimStatus;
import policyflow.domain.rating.PremiumBreakdown;
import policyflow.domain.reporting.PortfolioSummary;

/**
 * Utility mapping class converting between Gosu Domain entities and Java REST DTOs.
 */
public class DtoMapper {

    private static void setPrivateField(Object obj, String fieldName, Object value) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set private field " + fieldName + " on " + obj.getClass().getSimpleName(), e);
        }
    }

    // --- Contact Mapping ---

    public static ContactDto toDto(Contact contact) {
        if (contact == null) return null;
        ContactDto dto = new ContactDto();
        dto.setId(contact.getID());
        dto.setContactType(contact.getContactType() != null ? contact.getContactType().name() : null);
        dto.setFirstName(contact.getFirstName());
        dto.setLastName(contact.getLastName());
        dto.setCompanyName(contact.getCompanyName());
        dto.setEmailAddress(contact.getEmailAddress());
        dto.setPhoneNumber(contact.getPhoneNumber());

        Address address = contact.getPrimaryAddress();
        if (address != null) {
            dto.setAddressLine1(address.getAddressLine1());
            dto.setAddressLine2(address.getAddressLine2());
            dto.setCity(address.getCity());
            dto.setState(address.getState());
            dto.setPostalCode(address.getPostalCode());
        }
        return dto;
    }

    public static Contact toDomain(ContactDto dto) {
        if (dto == null) return null;
        ContactType type = dto.getContactType() != null ? ContactType.valueOf(dto.getContactType()) : null;
        Contact contact = new Contact(type);
        if (dto.getId() != null) {
            setPrivateField(contact, "_id", dto.getId());
        }
        contact.setFirstName(dto.getFirstName());
        contact.setLastName(dto.getLastName());
        contact.setCompanyName(dto.getCompanyName());
        contact.setEmailAddress(dto.getEmailAddress());
        contact.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getAddressLine1() != null) {
            Address address = new Address(
                dto.getAddressLine1(),
                dto.getAddressLine2(),
                dto.getCity(),
                dto.getState(),
                dto.getPostalCode(),
                "US" // Default Country
            );
            contact.setPrimaryAddress(address);
        }
        return contact;
    }

    // --- Vehicle Mapping ---

    public static VehicleDto toDto(Vehicle vehicle) {
        if (vehicle == null) return null;
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getID());
        dto.setVin(vehicle.getVIN());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getManufactureYear());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setVehicleType(vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null);
        dto.setFuelType(vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null);
        return dto;
    }

    public static Vehicle toDomain(VehicleDto dto) {
        if (dto == null) return null;
        Vehicle vehicle = new Vehicle(dto.getVin());
        if (dto.getId() != null) {
            setPrivateField(vehicle, "_id", dto.getId());
        }
        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        if (dto.getYear() != null) {
            vehicle.setManufactureYear(dto.getYear());
        }
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setVehicleType(dto.getVehicleType() != null ? VehicleType.valueOf(dto.getVehicleType()) : null);
        vehicle.setFuelType(dto.getFuelType() != null ? FuelType.valueOf(dto.getFuelType()) : null);
        return vehicle;
    }

    // --- Policy Mapping ---

    public static PolicyDto toDto(Policy policy) {
        if (policy == null) return null;
        PolicyDto dto = new PolicyDto();
        dto.setId(policy.getID());
        dto.setPolicyNumber(policy.getPolicyNumber());
        dto.setContactId(policy.getPrimaryNamedInsuredId());
        dto.setVehicleId(policy.getVehicleId());
        dto.setPolicyType(policy.getPolicyType() != null ? policy.getPolicyType().name() : null);
        dto.setStatus(policy.getStatus() != null ? policy.getStatus().name() : null);
        dto.setEffectiveDate(policy.getEffectiveDate());
        dto.setExpirationDate(policy.getExpirationDate());
        dto.setCancellationDate(policy.getCancellationDate());
        dto.setCancellationReason(policy.getCancellationReason());
        dto.setPreviousPolicyId(policy.getPreviousPolicyId());
        return dto;
    }

    public static Policy toDomain(PolicyDto dto) {
        if (dto == null) return null;
        Policy policy = new Policy();
        if (dto.getId() != null) {
            setPrivateField(policy, "_id", dto.getId());
        }
        if (dto.getPolicyNumber() != null) {
            setPrivateField(policy, "_policyNumber", dto.getPolicyNumber());
        }
        policy.setPrimaryNamedInsuredId(dto.getContactId());
        policy.setVehicleId(dto.getVehicleId());
        policy.setPolicyType(dto.getPolicyType() != null ? PolicyType.valueOf(dto.getPolicyType()) : null);
        if (dto.getStatus() != null) {
            policy.setStatus(PolicyStatus.valueOf(dto.getStatus()));
        }
        policy.setEffectiveDate(dto.getEffectiveDate());
        policy.setExpirationDate(dto.getExpirationDate());
        policy.setCancellationDate(dto.getCancellationDate());
        policy.setCancellationReason(dto.getCancellationReason());
        policy.setPreviousPolicyId(dto.getPreviousPolicyId());
        return policy;
    }

    // --- Claim Mapping ---

    public static ClaimDto toDto(Claim claim) {
        if (claim == null) return null;
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getID());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setPolicyId(claim.getPolicyId());
        dto.setLossDate(claim.getLossDate());
        dto.setReportedDate(claim.getReportedDate());
        dto.setStatus(claim.getStatus() != null ? claim.getStatus().name() : null);
        dto.setClaimType(claim.getClaimType() != null ? claim.getClaimType().name() : null);
        dto.setDescription(claim.getDescription());
        return dto;
    }

    public static Claim toDomain(ClaimDto dto) {
        if (dto == null) return null;
        Claim claim = new Claim();
        if (dto.getId() != null) {
            setPrivateField(claim, "_id", dto.getId());
        }
        if (dto.getClaimNumber() != null) {
            claim.setClaimNumber(dto.getClaimNumber());
        }
        claim.setPolicyId(dto.getPolicyId());
        claim.setLossDate(dto.getLossDate());
        claim.setReportedDate(dto.getReportedDate());
        if (dto.getStatus() != null) {
            claim.setStatus(ClaimStatus.valueOf(dto.getStatus()));
        }
        claim.setClaimType(dto.getClaimType() != null ? ClaimType.valueOf(dto.getClaimType()) : null);
        claim.setDescription(dto.getDescription());
        return claim;
    }

    // --- Premium Breakdown Mapping ---

    public static PremiumBreakdownDto toDto(PremiumBreakdown breakdown) {
        if (breakdown == null) return null;
        PremiumBreakdownDto dto = new PremiumBreakdownDto();
        dto.setBasePremium(breakdown.getBasePremium());
        dto.setVehicleAgeFactor(breakdown.getVehicleAgeAdjustment());
        dto.setVehicleTypeFactor(breakdown.getVehicleTypeAdjustment());
        dto.setFuelTypeFactor(breakdown.getFuelTypeAdjustment());
        dto.setContactTypeFactor(breakdown.getContactTypeAdjustment());
        dto.setTax(breakdown.getTax());
        dto.setTotalPremium(breakdown.getTotalPremium());
        return dto;
    }

    // --- Portfolio Summary Mapping ---

    public static PortfolioSummaryDto toDto(PortfolioSummary summary) {
        if (summary == null) return null;
        PortfolioSummaryDto dto = new PortfolioSummaryDto();
        dto.setActivePoliciesCount(summary.getActivePoliciesCount());
        dto.setOpenClaimsCount(summary.getOpenClaimsCount());
        dto.setTotalActivePremium(summary.getTotalPremium());
        dto.setGeneratedAt(summary.getGeneratedAt());

        Map<String, Integer> policiesByStatus = new HashMap<>();
        if (summary.getPoliciesByStatus() != null) {
            for (Map.Entry<PolicyStatus, Integer> entry : summary.getPoliciesByStatus().entrySet()) {
                policiesByStatus.put(entry.getKey() != null ? entry.getKey().name() : "null", entry.getValue());
            }
        }
        dto.setPoliciesByStatus(policiesByStatus);

        Map<String, Integer> policiesByType = new HashMap<>();
        if (summary.getPoliciesByType() != null) {
            for (Map.Entry<PolicyType, Integer> entry : summary.getPoliciesByType().entrySet()) {
                policiesByType.put(entry.getKey() != null ? entry.getKey().name() : "null", entry.getValue());
            }
        }
        dto.setPoliciesByType(policiesByType);

        Map<String, Integer> claimsByStatus = new HashMap<>();
        if (summary.getClaimsByStatus() != null) {
            for (Map.Entry<ClaimStatus, Integer> entry : summary.getClaimsByStatus().entrySet()) {
                claimsByStatus.put(entry.getKey() != null ? entry.getKey().name() : "null", entry.getValue());
            }
        }
        dto.setClaimsByStatus(claimsByStatus);

        Map<String, Integer> claimsByType = new HashMap<>();
        if (summary.getClaimsByType() != null) {
            for (Map.Entry<ClaimType, Integer> entry : summary.getClaimsByType().entrySet()) {
                claimsByType.put(entry.getKey() != null ? entry.getKey().name() : "null", entry.getValue());
            }
        }
        dto.setClaimsByType(claimsByType);

        return dto;
    }

    public static PolicyHistoryEntryDto toDto(PolicyHistoryEntry entry) {
        if (entry == null) return null;
        PolicyHistoryEntryDto dto = new PolicyHistoryEntryDto();
        dto.setId(entry.getID());
        dto.setPolicyId(entry.getPolicyId());
        dto.setTransactionType(entry.getTransactionType() != null ? entry.getTransactionType().name() : null);
        dto.setOldStatus(entry.getOldStatus() != null ? entry.getOldStatus().name() : null);
        dto.setNewStatus(entry.getNewStatus() != null ? entry.getNewStatus().name() : null);
        dto.setTimestamp(entry.getTimestamp());
        dto.setDescription(entry.getDescription());
        dto.setPerformedBy(entry.getPerformedBy());
        return dto;
    }
}
