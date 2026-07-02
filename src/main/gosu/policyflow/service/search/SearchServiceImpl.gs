package policyflow.service.search

uses policyflow.domain.account.Contact
uses policyflow.domain.policy.Policy
uses policyflow.domain.claim.Claim
uses policyflow.domain.search.ContactSearchCriteria
uses policyflow.domain.search.PolicySearchCriteria
uses policyflow.domain.search.ClaimSearchCriteria
uses policyflow.repository.account.ContactRepository
uses policyflow.repository.policy.PolicyRepository
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.repository.claim.ClaimRepository
uses java.util.ArrayList
uses java.util.HashSet
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for running advanced cross-entity queries.
 */
public class SearchServiceImpl implements SearchService {
  private var _contactRepo : ContactRepository
  private var _policyRepo : PolicyRepository
  private var _vehicleRepo : VehicleRepository
  private var _claimRepo : ClaimRepository

  /**
   * Primary constructor injecting all repositories.
   * 
   * @param contactRepo The Contact repository.
   * @param policyRepo The Policy repository.
   * @param vehicleRepo The Vehicle repository.
   * @param claimRepo The Claim repository.
   */
  public construct(contactRepo : ContactRepository, policyRepo : PolicyRepository, vehicleRepo : VehicleRepository, claimRepo : ClaimRepository) {
    if (contactRepo == null || policyRepo == null || vehicleRepo == null || claimRepo == null) {
      throw new IllegalArgumentException("Repositories cannot be null")
    }
    _contactRepo = contactRepo
    _policyRepo = policyRepo
    _vehicleRepo = vehicleRepo
    _claimRepo = claimRepo
  }

  override function searchContacts(criteria : ContactSearchCriteria) : List<Contact> {
    var list = _contactRepo.findAll()
    if (criteria == null) {
      return list
    }

    // 1. Filter by FirstName
    if (criteria.FirstName != null && !criteria.FirstName.trim().isEmpty()) {
      var query = criteria.FirstName.trim().toLowerCase()
      var temp = new ArrayList<Contact>()
      for (c in list) {
        if (c.FirstName != null && c.FirstName.trim().toLowerCase().contains(query)) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 2. Filter by LastName
    if (criteria.LastName != null && !criteria.LastName.trim().isEmpty()) {
      var query = criteria.LastName.trim().toLowerCase()
      var temp = new ArrayList<Contact>()
      for (c in list) {
        if (c.LastName != null && c.LastName.trim().toLowerCase().contains(query)) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 3. Filter by Email
    if (criteria.Email != null && !criteria.Email.trim().isEmpty()) {
      var query = criteria.Email.trim().toLowerCase()
      var temp = new ArrayList<Contact>()
      for (c in list) {
        if (c.EmailAddress != null && c.EmailAddress.trim().toLowerCase().contains(query)) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 4. Filter by VehicleMake (Cross-Entity Search)
    if (criteria.VehicleMake != null && !criteria.VehicleMake.trim().isEmpty()) {
      var makeQuery = criteria.VehicleMake.trim().toLowerCase()

      // Find matching vehicles
      var matchedVehicleIds = new HashSet<UUID>()
      for (v in _vehicleRepo.findAll()) {
        if (v.Make != null && v.Make.trim().toLowerCase().contains(makeQuery)) {
          matchedVehicleIds.add(v.ID)
        }
      }

      // Find primary insured contact IDs for policies linking to those vehicles
      var matchedContactIds = new HashSet<UUID>()
      for (p in _policyRepo.findAll()) {
        if (matchedVehicleIds.contains(p.VehicleId)) {
          matchedContactIds.add(p.PrimaryNamedInsuredId)
        }
      }

      var temp = new ArrayList<Contact>()
      for (c in list) {
        if (matchedContactIds.contains(c.ID)) {
          temp.add(c)
        }
      }
      list = temp
    }

    return list
  }

  override function searchPolicies(criteria : PolicySearchCriteria) : List<Policy> {
    var list = _policyRepo.findAll()
    if (criteria == null) {
      return list
    }

    // 1. Filter by PolicyNumber
    if (criteria.PolicyNumber != null && !criteria.PolicyNumber.trim().isEmpty()) {
      var query = criteria.PolicyNumber.trim().toLowerCase()
      var temp = new ArrayList<Policy>()
      for (p in list) {
        if (p.PolicyNumber != null && p.PolicyNumber.trim().toLowerCase().contains(query)) {
          temp.add(p)
        }
      }
      list = temp
    }

    // 2. Filter by Status
    if (criteria.Status != null) {
      var temp = new ArrayList<Policy>()
      for (p in list) {
        if (p.Status == criteria.Status) {
          temp.add(p)
        }
      }
      list = temp
    }

    // 3. Filter by Type
    if (criteria.Type != null) {
      var temp = new ArrayList<Policy>()
      for (p in list) {
        if (p.PolicyType == criteria.Type) {
          temp.add(p)
        }
      }
      list = temp
    }

    // 4. Filter by ContactFirstName (Cross-Entity Search)
    if (criteria.ContactFirstName != null && !criteria.ContactFirstName.trim().isEmpty()) {
      var nameQuery = criteria.ContactFirstName.trim().toLowerCase()
      var matchedContactIds = new HashSet<UUID>()
      for (c in _contactRepo.findAll()) {
        if (c.FirstName != null && c.FirstName.trim().toLowerCase().contains(nameQuery)) {
          matchedContactIds.add(c.ID)
        }
      }

      var temp = new ArrayList<Policy>()
      for (p in list) {
        if (matchedContactIds.contains(p.PrimaryNamedInsuredId)) {
          temp.add(p)
        }
      }
      list = temp
    }

    // 5. Filter by ContactLastName (Cross-Entity Search)
    if (criteria.ContactLastName != null && !criteria.ContactLastName.trim().isEmpty()) {
      var nameQuery = criteria.ContactLastName.trim().toLowerCase()
      var matchedContactIds = new HashSet<UUID>()
      for (c in _contactRepo.findAll()) {
        if (c.LastName != null && c.LastName.trim().toLowerCase().contains(nameQuery)) {
          matchedContactIds.add(c.ID)
        }
      }

      var temp = new ArrayList<Policy>()
      for (p in list) {
        if (matchedContactIds.contains(p.PrimaryNamedInsuredId)) {
          temp.add(p)
        }
      }
      list = temp
    }

    return list
  }

  override function searchClaims(criteria : ClaimSearchCriteria) : List<Claim> {
    var list = _claimRepo.findAll()
    if (criteria == null) {
      return list
    }

    // 1. Filter by ClaimNumber
    if (criteria.ClaimNumber != null && !criteria.ClaimNumber.trim().isEmpty()) {
      var query = criteria.ClaimNumber.trim().toLowerCase()
      var temp = new ArrayList<Claim>()
      for (c in list) {
        if (c.ClaimNumber != null && c.ClaimNumber.trim().toLowerCase().contains(query)) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 2. Filter by Status
    if (criteria.Status != null) {
      var temp = new ArrayList<Claim>()
      for (c in list) {
        if (c.Status == criteria.Status) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 3. Filter by Vin (Cross-Entity Search)
    if (criteria.Vin != null && !criteria.Vin.trim().isEmpty()) {
      var vinQuery = criteria.Vin.trim().toLowerCase()

      // Find matching vehicles
      var matchedVehicleIds = new HashSet<UUID>()
      for (v in _vehicleRepo.findAll()) {
        if (v.VIN != null && v.VIN.trim().toLowerCase().contains(vinQuery)) {
          matchedVehicleIds.add(v.ID)
        }
      }

      // Find policy IDs linking to these vehicles
      var matchedPolicyIds = new HashSet<UUID>()
      for (p in _policyRepo.findAll()) {
        if (matchedVehicleIds.contains(p.VehicleId)) {
          matchedPolicyIds.add(p.ID)
        }
      }

      var temp = new ArrayList<Claim>()
      for (c in list) {
        if (matchedPolicyIds.contains(c.PolicyId)) {
          temp.add(c)
        }
      }
      list = temp
    }

    // 4. Filter by ContactEmail (Cross-Entity Search)
    if (criteria.ContactEmail != null && !criteria.ContactEmail.trim().isEmpty()) {
      var emailQuery = criteria.ContactEmail.trim().toLowerCase()

      // Find matching contacts
      var matchedContactIds = new HashSet<UUID>()
      for (ct in _contactRepo.findAll()) {
        if (ct.EmailAddress != null && ct.EmailAddress.trim().toLowerCase().contains(emailQuery)) {
          matchedContactIds.add(ct.ID)
        }
      }

      // Find policy IDs linking to these contacts
      var matchedPolicyIds = new HashSet<UUID>()
      for (p in _policyRepo.findAll()) {
        if (matchedContactIds.contains(p.PrimaryNamedInsuredId)) {
          matchedPolicyIds.add(p.ID)
        }
      }

      var temp = new ArrayList<Claim>()
      for (c in list) {
        if (matchedPolicyIds.contains(c.PolicyId)) {
          temp.add(c)
        }
      }
      list = temp
    }

    return list
  }
}
