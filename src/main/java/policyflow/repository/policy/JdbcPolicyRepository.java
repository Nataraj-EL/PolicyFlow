package policyflow.repository.policy;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.policy.Policy;
import policyflow.domain.policy.PolicyStatus;
import policyflow.domain.policy.PolicyType;

public class JdbcPolicyRepository implements PolicyRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcPolicyRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static void setPrivateField(Object obj, String fieldName, Object value) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set private field " + fieldName, e);
        }
    }

    private final RowMapper<Policy> rowMapper = new RowMapper<Policy>() {
        @Override
        public Policy mapRow(ResultSet rs, int rowNum) throws SQLException {
            Policy policy = new Policy();
            
            setPrivateField(policy, "_id", UUID.fromString(rs.getString("id")));
            setPrivateField(policy, "_policyNumber", rs.getString("policy_number"));
            
            String policyTypeStr = rs.getString("policy_type");
            if (policyTypeStr != null) {
                policy.setPolicyType(PolicyType.valueOf(policyTypeStr));
            }
            
            String statusStr = rs.getString("status");
            if (statusStr != null) {
                policy.setStatus(PolicyStatus.valueOf(statusStr));
            }
            
            String contactIdStr = rs.getString("contact_id");
            if (contactIdStr != null) {
                policy.setPrimaryNamedInsuredId(UUID.fromString(contactIdStr));
            }
            
            String vehicleIdStr = rs.getString("vehicle_id");
            if (vehicleIdStr != null) {
                policy.setVehicleId(UUID.fromString(vehicleIdStr));
            }
            
            policy.setEffectiveDate(rs.getObject("effective_date", LocalDate.class));
            policy.setExpirationDate(rs.getObject("expiration_date", LocalDate.class));
            policy.setCancellationDate(rs.getObject("cancellation_date", LocalDate.class));
            policy.setCancellationReason(rs.getString("cancellation_reason"));
            
            String prevIdStr = rs.getString("previous_policy_id");
            if (prevIdStr != null) {
                policy.setPreviousPolicyId(UUID.fromString(prevIdStr));
            }
            
            return policy;
        }
    };

    @Override
    public Policy save(Policy policy) {
        if (policy == null) return null;
        UUID id = policy.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM policies WHERE id = ?",
            Integer.class,
            id.toString()
        );

        String contactId = policy.getPrimaryNamedInsuredId() != null ? policy.getPrimaryNamedInsuredId().toString() : null;
        String vehicleId = policy.getVehicleId() != null ? policy.getVehicleId().toString() : null;
        String prevId = policy.getPreviousPolicyId() != null ? policy.getPreviousPolicyId().toString() : null;

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE policies SET policy_number = ?, contact_id = ?, vehicle_id = ?, policy_type = ?, status = ?, effective_date = ?, expiration_date = ?, cancellation_date = ?, cancellation_reason = ?, previous_policy_id = ? WHERE id = ?",
                policy.getPolicyNumber(),
                contactId,
                vehicleId,
                policy.getPolicyType() != null ? policy.getPolicyType().name() : null,
                policy.getStatus() != null ? policy.getStatus().name() : null,
                policy.getEffectiveDate(),
                policy.getExpirationDate(),
                policy.getCancellationDate(),
                policy.getCancellationReason(),
                prevId,
                id.toString()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO policies (id, policy_number, contact_id, vehicle_id, policy_type, status, effective_date, expiration_date, cancellation_date, cancellation_reason, previous_policy_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                policy.getPolicyNumber(),
                contactId,
                vehicleId,
                policy.getPolicyType() != null ? policy.getPolicyType().name() : null,
                policy.getStatus() != null ? policy.getStatus().name() : null,
                policy.getEffectiveDate(),
                policy.getExpirationDate(),
                policy.getCancellationDate(),
                policy.getCancellationReason(),
                prevId
            );
        }
        return policy;
    }

    @Override
    public Policy findById(UUID id) {
        if (id == null) return null;
        List<Policy> policies = jdbcTemplate.query(
            "SELECT * FROM policies WHERE id = ?",
            rowMapper,
            id.toString()
        );
        return policies.isEmpty() ? null : policies.get(0);
    }

    @Override
    public Policy findByPolicyNumber(String policyNumber) {
        if (policyNumber == null) return null;
        List<Policy> policies = jdbcTemplate.query(
            "SELECT * FROM policies WHERE policy_number = ?",
            rowMapper,
            policyNumber
        );
        return policies.isEmpty() ? null : policies.get(0);
    }

    @Override
    public List<Policy> findByVehicleId(UUID vehicleId) {
        if (vehicleId == null) return List.of();
        return jdbcTemplate.query(
            "SELECT * FROM policies WHERE vehicle_id = ?",
            rowMapper,
            vehicleId.toString()
        );
    }

    @Override
    public List<Policy> findAll() {
        return jdbcTemplate.query("SELECT * FROM policies", rowMapper);
    }

    @Override
    public boolean delete(UUID id) {
        if (id == null) return false;
        int rows = jdbcTemplate.update("DELETE FROM policies WHERE id = ?", id.toString());
        return rows > 0;
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM policies");
    }
}
