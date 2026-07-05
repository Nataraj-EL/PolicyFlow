package policyflow.api.repository;

import static org.junit.Assert.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import policyflow.domain.account.Address;
import policyflow.domain.account.Contact;
import policyflow.domain.account.ContactType;
import policyflow.domain.claim.Claim;
import policyflow.domain.claim.ClaimHistoryEntry;
import policyflow.domain.claim.ClaimStatus;
import policyflow.domain.claim.ClaimTransactionType;
import policyflow.domain.claim.ClaimType;
import policyflow.domain.policy.Policy;
import policyflow.domain.policy.PolicyHistoryEntry;
import policyflow.domain.policy.PolicyStatus;
import policyflow.domain.policy.PolicyTransactionType;
import policyflow.domain.policy.PolicyType;
import policyflow.domain.vehicle.FuelType;
import policyflow.domain.vehicle.Vehicle;
import policyflow.domain.vehicle.VehicleType;

import policyflow.repository.account.ContactRepository;
import policyflow.repository.vehicle.VehicleRepository;
import policyflow.repository.policy.PolicyRepository;
import policyflow.repository.policy.PolicyHistoryRepository;
import policyflow.repository.claim.ClaimRepository;
import policyflow.repository.claim.ClaimHistoryRepository;

@RunWith(SpringRunner.class)
@SpringBootTest
public class JdbcRepositoryIntegrationTest {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private PolicyHistoryRepository policyHistoryRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimHistoryRepository claimHistoryRepository;

    @Before
    public void setUp() {
        // Clear history first because of FK constraints
        claimHistoryRepository.clear();
        policyHistoryRepository.clear();
        claimRepository.clear();
        policyRepository.clear();
        contactRepository.clear();
        vehicleRepository.clear();
    }

    @Test
    @Transactional
    public void testContactPersistence() {
        Contact contact = new Contact(ContactType.PERSON);
        contact.setFirstName("Nataraj");
        contact.setLastName("EL");
        contact.setEmailAddress("natarajel.dev@gmail.com");
        contact.setPhoneNumber("9876543210");
        Address address = new Address("No. 12, Anna Main Road", "Near GST Road", "Chennai", "Tamil Nadu", "600069", "IN");
        contact.setPrimaryAddress(address);

        contactRepository.save(contact);

        Contact retrieved = contactRepository.findById(contact.getID());
        assertNotNull(retrieved);
        assertEquals("Nataraj", retrieved.getFirstName());
        assertEquals("EL", retrieved.getLastName());
        assertEquals("natarajel.dev@gmail.com", retrieved.getEmailAddress());
        assertNotNull(retrieved.getPrimaryAddress());
        assertEquals("Chennai", retrieved.getPrimaryAddress().getCity());

        Contact byEmail = contactRepository.findByEmail("natarajel.dev@gmail.com");
        assertNotNull(byEmail);
        assertEquals(contact.getID(), byEmail.getID());
    }

    @Test
    @Transactional
    public void testVehiclePersistence() {
        Vehicle vehicle = new Vehicle("17CHARVINABCDE123");
        vehicle.setMake("Ford");
        vehicle.setModel("Explorer");
        vehicle.setManufactureYear(2022);
        vehicle.setLicensePlate("TN-01-AB-1234");
        vehicle.setVehicleType(VehicleType.SUV);
        vehicle.setFuelType(FuelType.HYBRID);

        vehicleRepository.save(vehicle);

        Vehicle retrieved = vehicleRepository.findById(vehicle.getID());
        assertNotNull(retrieved);
        assertEquals("17CHARVINABCDE123", retrieved.getVIN());
        assertEquals("Ford", retrieved.getMake());
        assertEquals("Explorer", retrieved.getModel());
        assertEquals(2022, retrieved.getManufactureYear());
        assertEquals(VehicleType.SUV, retrieved.getVehicleType());
        assertEquals(FuelType.HYBRID, retrieved.getFuelType());

        Vehicle byVin = vehicleRepository.findByVin("17CHARVINABCDE123");
        assertNotNull(byVin);
        assertEquals(vehicle.getID(), byVin.getID());
    }

    @Test
    @Transactional
    public void testPolicyAndHistoryPersistence() {
        Contact contact = new Contact(ContactType.PERSON);
        contact.setFirstName("Test");
        contact.setLastName("User");
        contact.setEmailAddress("test@example.com");
        Address address = new Address("Line 1", "Line 2", "City", "State", "123456", "IN");
        contact.setPrimaryAddress(address);
        contactRepository.save(contact);

        Vehicle vehicle = new Vehicle("VIN12345678901234");
        vehicle.setMake("Honda");
        vehicle.setModel("Civic");
        vehicle.setManufactureYear(2021);
        vehicle.setVehicleType(VehicleType.SEDAN);
        vehicle.setFuelType(FuelType.GASOLINE);
        vehicleRepository.save(vehicle);

        Policy policy = new Policy();
        policy.setPrimaryNamedInsuredId(contact.getID());
        policy.setVehicleId(vehicle.getID());
        policy.setPolicyType(PolicyType.PERSONAL_AUTO);
        policy.setStatus(PolicyStatus.IN_FORCE);
        policy.setEffectiveDate(LocalDate.now());
        policy.setExpirationDate(LocalDate.now().plusYears(1));

        policyRepository.save(policy);

        Policy retrieved = policyRepository.findById(policy.getID());
        assertNotNull(retrieved);
        assertEquals(contact.getID(), retrieved.getPrimaryNamedInsuredId());
        assertEquals(vehicle.getID(), retrieved.getVehicleId());
        assertEquals(PolicyStatus.IN_FORCE, retrieved.getStatus());

        PolicyHistoryEntry historyEntry = new PolicyHistoryEntry(
            policy.getID(),
            PolicyTransactionType.CREATION,
            PolicyStatus.DRAFT,
            PolicyStatus.IN_FORCE,
            "Policy activated",
            "ADMIN"
        );
        policyHistoryRepository.save(historyEntry);

        List<PolicyHistoryEntry> history = policyHistoryRepository.findByPolicyId(policy.getID());
        assertEquals(1, history.size());
        assertEquals("Policy activated", history.get(0).getDescription());
        assertEquals("ADMIN", history.get(0).getPerformedBy());
    }

    @Test
    @Transactional
    public void testClaimAndHistoryPersistence() {
        Contact contact = new Contact(ContactType.PERSON);
        contact.setFirstName("Claimant");
        contact.setLastName("Smith");
        contact.setEmailAddress("smith@example.com");
        Address address = new Address("Line 1", null, "City", "State", "123456", "IN");
        contact.setPrimaryAddress(address);
        contactRepository.save(contact);

        Vehicle vehicle = new Vehicle("VINCLAIM123456789");
        vehicle.setMake("Toyota");
        vehicle.setModel("Corolla");
        vehicle.setManufactureYear(2020);
        vehicle.setVehicleType(VehicleType.SEDAN);
        vehicle.setFuelType(FuelType.GASOLINE);
        vehicleRepository.save(vehicle);

        Policy policy = new Policy();
        policy.setPrimaryNamedInsuredId(contact.getID());
        policy.setVehicleId(vehicle.getID());
        policy.setPolicyType(PolicyType.PERSONAL_AUTO);
        policy.setStatus(PolicyStatus.IN_FORCE);
        policy.setEffectiveDate(LocalDate.now());
        policy.setExpirationDate(LocalDate.now().plusYears(1));
        policyRepository.save(policy);

        Claim claim = new Claim();
        claim.setPolicyId(policy.getID());
        claim.setLossDate(LocalDate.now().minusDays(5));
        claim.setReportedDate(LocalDate.now());
        claim.setStatus(ClaimStatus.OPEN);
        claim.setClaimType(ClaimType.COLLISION);
        claim.setDescription("Collision with a tree");
        claimRepository.save(claim);

        Claim retrieved = claimRepository.findById(claim.getID());
        assertNotNull(retrieved);
        assertEquals(policy.getID(), retrieved.getPolicyId());
        assertEquals(ClaimStatus.OPEN, retrieved.getStatus());

        ClaimHistoryEntry historyEntry = new ClaimHistoryEntry(
            claim.getID(),
            ClaimTransactionType.CREATION,
            ClaimStatus.DRAFT,
            ClaimStatus.OPEN,
            "Claim opened",
            "ADJUSTER"
        );
        claimHistoryRepository.save(historyEntry);

        List<ClaimHistoryEntry> history = claimHistoryRepository.findByClaimId(claim.getID());
        assertEquals(1, history.size());
        assertEquals("Claim opened", history.get(0).getDescription());
        assertEquals("ADJUSTER", history.get(0).getPerformedBy());
    }
}
