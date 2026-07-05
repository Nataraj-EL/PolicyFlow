package policyflow.repository.claim;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.claim.ClaimHistoryEntry;
import policyflow.domain.claim.ClaimStatus;
import policyflow.domain.claim.ClaimTransactionType;

public class JdbcClaimHistoryRepository implements ClaimHistoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcClaimHistoryRepository(JdbcTemplate jdbcTemplate) {
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

    private final RowMapper<ClaimHistoryEntry> rowMapper = new RowMapper<>() {
        @Override
        public ClaimHistoryEntry mapRow(ResultSet rs, int rowNum) throws SQLException {
            UUID claimId = UUID.fromString(rs.getString("claim_id"));
            String transactionTypeStr = rs.getString("transaction_type");
            String oldStatusStr = rs.getString("old_status");
            String newStatusStr = rs.getString("new_status");
            String description = rs.getString("description");
            String performedBy = rs.getString("performed_by");

            ClaimHistoryEntry entry = new ClaimHistoryEntry(
                claimId,
                ClaimTransactionType.valueOf(transactionTypeStr),
                oldStatusStr != null ? ClaimStatus.valueOf(oldStatusStr) : null,
                ClaimStatus.valueOf(newStatusStr),
                description,
                performedBy
            );

            setPrivateField(entry, "_id", UUID.fromString(rs.getString("id")));
            setPrivateField(entry, "_timestamp", rs.getObject("timestamp", LocalDateTime.class));

            return entry;
        }
    };

    @Override
    public ClaimHistoryEntry save(ClaimHistoryEntry entry) {
        if (entry == null) return null;
        UUID id = entry.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM claim_history WHERE id = ?",
            Integer.class,
            id.toString()
        );

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE claim_history SET claim_id = ?, transaction_type = ?, old_status = ?, new_status = ?, timestamp = ?, description = ?, performed_by = ? WHERE id = ?",
                entry.getClaimId().toString(),
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
                "INSERT INTO claim_history (id, claim_id, transaction_type, old_status, new_status, timestamp, description, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                entry.getClaimId().toString(),
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
    public List<ClaimHistoryEntry> findByClaimId(UUID claimId) {
        if (claimId == null) return List.of();
        return jdbcTemplate.query(
            "SELECT * FROM claim_history WHERE claim_id = ? ORDER BY timestamp ASC",
            rowMapper,
            claimId.toString()
        );
    }

    @Override
    public List<ClaimHistoryEntry> findAll() {
        return jdbcTemplate.query("SELECT * FROM claim_history ORDER BY timestamp ASC", rowMapper);
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM claim_history");
    }
}
