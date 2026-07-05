package policyflow.repository.claim;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.claim.Claim;
import policyflow.domain.claim.ClaimStatus;
import policyflow.domain.claim.ClaimType;

public class JdbcClaimRepository implements ClaimRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcClaimRepository(JdbcTemplate jdbcTemplate) {
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

    private final RowMapper<Claim> rowMapper = new RowMapper<Claim>() {
        @Override
        public Claim mapRow(ResultSet rs, int rowNum) throws SQLException {
            Claim claim = new Claim();
            
            setPrivateField(claim, "_id", UUID.fromString(rs.getString("id")));
            claim.setClaimNumber(rs.getString("claim_number"));
            
            String policyIdStr = rs.getString("policy_id");
            if (policyIdStr != null) {
                claim.setPolicyId(UUID.fromString(policyIdStr));
            }
            
            String claimTypeStr = rs.getString("claim_type");
            if (claimTypeStr != null) {
                claim.setClaimType(ClaimType.valueOf(claimTypeStr));
            }
            
            String statusStr = rs.getString("status");
            if (statusStr != null) {
                claim.setStatus(ClaimStatus.valueOf(statusStr));
            }
            
            claim.setLossDate(rs.getObject("loss_date", LocalDate.class));
            claim.setReportedDate(rs.getObject("reported_date", LocalDate.class));
            claim.setDescription(rs.getString("description"));
            
            return claim;
        }
    };

    @Override
    public Claim save(Claim claim) {
        if (claim == null) return null;
        UUID id = claim.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM claims WHERE id = ?",
            Integer.class,
            id.toString()
        );

        String policyId = claim.getPolicyId() != null ? claim.getPolicyId().toString() : null;

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE claims SET claim_number = ?, policy_id = ?, claim_type = ?, status = ?, loss_date = ?, reported_date = ?, description = ? WHERE id = ?",
                claim.getClaimNumber(),
                policyId,
                claim.getClaimType() != null ? claim.getClaimType().name() : null,
                claim.getStatus() != null ? claim.getStatus().name() : null,
                claim.getLossDate(),
                claim.getReportedDate(),
                claim.getDescription(),
                id.toString()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO claims (id, claim_number, policy_id, claim_type, status, loss_date, reported_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                claim.getClaimNumber(),
                policyId,
                claim.getClaimType() != null ? claim.getClaimType().name() : null,
                claim.getStatus() != null ? claim.getStatus().name() : null,
                claim.getLossDate(),
                claim.getReportedDate(),
                claim.getDescription()
            );
        }
        return claim;
    }

    @Override
    public Claim findById(UUID id) {
        if (id == null) return null;
        List<Claim> claims = jdbcTemplate.query(
            "SELECT * FROM claims WHERE id = ?",
            rowMapper,
            id.toString()
        );
        return claims.isEmpty() ? null : claims.get(0);
    }

    @Override
    public Claim findByClaimNumber(String claimNumber) {
        if (claimNumber == null) return null;
        List<Claim> claims = jdbcTemplate.query(
            "SELECT * FROM claims WHERE claim_number = ?",
            rowMapper,
            claimNumber
        );
        return claims.isEmpty() ? null : claims.get(0);
    }

    @Override
    public List<Claim> findByPolicyId(UUID policyId) {
        if (policyId == null) return List.of();
        return jdbcTemplate.query(
            "SELECT * FROM claims WHERE policy_id = ?",
            rowMapper,
            policyId.toString()
        );
    }

    @Override
    public List<Claim> findAll() {
        return jdbcTemplate.query("SELECT * FROM claims", rowMapper);
    }

    @Override
    public void delete(UUID id) {
        if (id == null) return;
        jdbcTemplate.update("DELETE FROM claims WHERE id = ?", id.toString());
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM claims");
    }
}
