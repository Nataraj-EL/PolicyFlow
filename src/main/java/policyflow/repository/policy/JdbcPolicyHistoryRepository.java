package policyflow.repository.policy;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.policy.PolicyHistoryEntry;
import policyflow.domain.policy.PolicyStatus;
import policyflow.domain.policy.PolicyTransactionType;

public class JdbcPolicyHistoryRepository implements PolicyHistoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcPolicyHistoryRepository(JdbcTemplate jdbcTemplate) {
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

    private final RowMapper<PolicyHistoryEntry> rowMapper = new RowMapper<>() {
        @Override
        public PolicyHistoryEntry mapRow(ResultSet rs, int rowNum) throws SQLException {
            UUID policyId = UUID.fromString(rs.getString("policy_id"));
            String transactionTypeStr = rs.getString("transaction_type");
            String oldStatusStr = rs.getString("old_status");
            String newStatusStr = rs.getString("new_status");
            String description = rs.getString("description");
            String performedBy = rs.getString("performed_by");

            PolicyHistoryEntry entry = new PolicyHistoryEntry(
                policyId,
                PolicyTransactionType.valueOf(transactionTypeStr),
                oldStatusStr != null ? PolicyStatus.valueOf(oldStatusStr) : null,
                PolicyStatus.valueOf(newStatusStr),
                description,
                performedBy
            );

            setPrivateField(entry, "_id", UUID.fromString(rs.getString("id")));
            setPrivateField(entry, "_timestamp", rs.getObject("timestamp", LocalDateTime.class));

            return entry;
        }
    };

    @Override
    public PolicyHistoryEntry save(PolicyHistoryEntry entry) {
        if (entry == null) return null;
        UUID id = entry.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM policy_history WHERE id = ?",
            Integer.class,
            id.toString()
        );

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE policy_history SET policy_id = ?, transaction_type = ?, old_status = ?, new_status = ?, timestamp = ?, description = ?, performed_by = ? WHERE id = ?",
                entry.getPolicyId().toString(),
                entry.getTransactionType() != null ? entry.getTransactionType().name() : null,
                entry.getOldStatus() != null ? entry.getOldStatus().name() : null,
                entry.getNewStatus() != null ? entry.getNewStatus().name() : null,
                entry.getTimestamp(),
                entry.getDescription(),
                entry.getPerformedBy(),
                id.toString()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO policy_history (id, policy_id, transaction_type, old_status, new_status, timestamp, description, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                entry.getPolicyId().toString(),
                entry.getTransactionType() != null ? entry.getTransactionType().name() : null,
                entry.getOldStatus() != null ? entry.getOldStatus().name() : null,
                entry.getNewStatus() != null ? entry.getNewStatus().name() : null,
                entry.getTimestamp(),
                entry.getDescription(),
                entry.getPerformedBy()
            );
        }
        return entry;
    }

    @Override
    public List<PolicyHistoryEntry> findByPolicyId(UUID policyId) {
        if (policyId == null) return List.of();
        return jdbcTemplate.query(
            "SELECT * FROM policy_history WHERE policy_id = ? ORDER BY timestamp ASC",
            rowMapper,
            policyId.toString()
        );
    }

    @Override
    public List<PolicyHistoryEntry> findAll() {
        return jdbcTemplate.query("SELECT * FROM policy_history ORDER BY timestamp ASC", rowMapper);
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM policy_history");
    }
}
