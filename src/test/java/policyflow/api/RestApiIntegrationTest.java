package policyflow.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import policyflow.api.dto.ContactDto;
import policyflow.api.dto.VehicleDto;
import policyflow.api.dto.PolicyDto;
import policyflow.api.dto.ClaimDto;
import policyflow.api.dto.PremiumCalculationRequestDto;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Full integration test suite for the REST API endpoints using Spring MockMvc.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class RestApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private policyflow.repository.claim.ClaimHistoryRepository claimHistoryRepository;
    @Autowired
    private policyflow.repository.policy.PolicyHistoryRepository policyHistoryRepository;
    @Autowired
    private policyflow.repository.claim.ClaimRepository claimRepository;
    @Autowired
    private policyflow.repository.policy.PolicyRepository policyRepository;
    @Autowired
    private policyflow.repository.account.ContactRepository contactRepository;
    @Autowired
    private policyflow.repository.vehicle.VehicleRepository vehicleRepository;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        claimHistoryRepository.clear();
        policyHistoryRepository.clear();
        claimRepository.clear();
        policyRepository.clear();
        contactRepository.clear();
        vehicleRepository.clear();
    }

    @Test
    public void testInfoAndHealthEndpoints() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.application", is("PolicyFlow")))
                .andExpect(jsonPath("$.swaggerDocs", is("/swagger-ui/index.html")));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.application", is("PolicyFlow")));
    }

    @Test
    public void testFullWorkflowIntegration() throws Exception {
        // 1. Create a Contact
        ContactDto contactDto = new ContactDto();
        contactDto.setContactType("PERSON");
        contactDto.setFirstName("John");
        contactDto.setLastName("Doe");
        contactDto.setEmailAddress("john.doe@example.com");
        contactDto.setPhoneNumber("555-0199");
        contactDto.setAddressLine1("123 Main St");
        contactDto.setCity("Seattle");
        contactDto.setState("WA");
        contactDto.setPostalCode("98101");

        String contactJson = mockMvc.perform(post("/api/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(contactDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andReturn().getResponse().getContentAsString();

        ContactDto createdContact = objectMapper.readValue(contactJson, ContactDto.class);
        UUID contactId = createdContact.getId();

        // 2. Create a Vehicle
        VehicleDto vehicleDto = new VehicleDto();
        vehicleDto.setVin("1FM5K8F85HGD12345"); // Valid 17-char VIN
        vehicleDto.setMake("Ford");
        vehicleDto.setModel("Explorer");
        vehicleDto.setYear(2017);
        vehicleDto.setLicensePlate("XYZ-9876");
        vehicleDto.setVehicleType("SUV");
        vehicleDto.setFuelType("GASOLINE");

        String vehicleJson = mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicleDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.make", is("Ford")))
                .andReturn().getResponse().getContentAsString();

        VehicleDto createdVehicle = objectMapper.readValue(vehicleJson, VehicleDto.class);
        UUID vehicleId = createdVehicle.getId();

        // 3. Calculate Premium
        PremiumCalculationRequestDto premiumReq = new PremiumCalculationRequestDto();
        premiumReq.setContact(createdContact);
        premiumReq.setVehicle(createdVehicle);

        mockMvc.perform(post("/api/premium/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(premiumReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.basePremium", notNullValue()))
                .andExpect(jsonPath("$.totalPremium", notNullValue()));

        // 4. Create a Policy
        PolicyDto policyDto = new PolicyDto();
        policyDto.setContactId(contactId);
        policyDto.setVehicleId(vehicleId);
        policyDto.setPolicyType("PERSONAL_AUTO");
        policyDto.setEffectiveDate(LocalDate.now());
        policyDto.setExpirationDate(LocalDate.now().plusYears(1));

        String policyJson = mockMvc.perform(post("/api/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(policyDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.policyNumber", notNullValue()))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();

        PolicyDto createdPolicy = objectMapper.readValue(policyJson, PolicyDto.class);
        UUID policyId = createdPolicy.getId();

        // 4b. Endorse (update) policy to make it IN_FORCE
        createdPolicy.setStatus("IN_FORCE");
        mockMvc.perform(put("/api/policies/" + policyId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createdPolicy)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_FORCE")));

        // 5. File a Claim
        ClaimDto claimDto = new ClaimDto();
        claimDto.setPolicyId(policyId);
        claimDto.setClaimType("COLLISION");
        claimDto.setLossDate(LocalDate.now());
        claimDto.setReportedDate(LocalDate.now());
        claimDto.setDescription("Fender bender in parking lot.");

        String claimJson = mockMvc.perform(post("/api/claims")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(claimDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.claimNumber", notNullValue()))
                .andExpect(jsonPath("$.status", is("OPEN")))
                .andReturn().getResponse().getContentAsString();

        ClaimDto createdClaim = objectMapper.readValue(claimJson, ClaimDto.class);
        UUID claimId = createdClaim.getId();

        // 6. Run Search Queries
        mockMvc.perform(get("/api/search/contacts")
                .param("firstName", "john")
                .param("vehicleMake", "Ford"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].lastName", is("Doe")));

        mockMvc.perform(get("/api/search/policies")
                .param("status", "IN_FORCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));

        mockMvc.perform(get("/api/search/claims")
                .param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));

        // 7. Check Reporting Portfolio Summary
        mockMvc.perform(get("/api/reporting/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activePoliciesCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.openClaimsCount", greaterThanOrEqualTo(1)));

        // 8. Close Claim
        mockMvc.perform(post("/api/claims/" + claimId + "/close")
                .param("reason", "Settled and paid out."))
                .andExpect(status().isOk());

        // 9. Cancel and Reinstate Policy
        mockMvc.perform(post("/api/policies/" + policyId + "/cancel")
                .param("reason", "Non-payment"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/policies/" + policyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));

        mockMvc.perform(post("/api/policies/" + policyId + "/reinstate")
                .param("reason", "Payment received"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/policies/" + policyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_FORCE")));
    }
}
