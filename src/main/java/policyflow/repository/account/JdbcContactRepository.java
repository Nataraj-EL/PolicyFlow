package policyflow.repository.account;

import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import policyflow.domain.account.Address;
import policyflow.domain.account.Contact;
import policyflow.domain.account.ContactType;

public class JdbcContactRepository implements ContactRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcContactRepository(JdbcTemplate jdbcTemplate) {
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

    private final RowMapper<Contact> rowMapper = new RowMapper<Contact>() {
        @Override
        public Contact mapRow(ResultSet rs, int rowNum) throws SQLException {
            String typeStr = rs.getString("contact_type");
            ContactType type = typeStr != null ? ContactType.valueOf(typeStr) : null;
            Contact contact = new Contact(type);
            
            setPrivateField(contact, "_id", UUID.fromString(rs.getString("id")));
            contact.setFirstName(rs.getString("first_name"));
            contact.setLastName(rs.getString("last_name"));
            contact.setCompanyName(rs.getString("company_name"));
            contact.setEmailAddress(rs.getString("email_address"));
            contact.setPhoneNumber(rs.getString("phone_number"));

            String line1 = rs.getString("address_line1");
            if (line1 != null) {
                Address address = new Address(
                    line1,
                    rs.getString("address_line2"),
                    rs.getString("city"),
                    rs.getString("state"),
                    rs.getString("postal_code"),
                    "US"
                );
                contact.setPrimaryAddress(address);
            }
            return contact;
        }
    };

    @Override
    public Contact save(Contact contact) {
        if (contact == null) return null;
        UUID id = contact.getID();
        
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM contacts WHERE id = ?",
            Integer.class,
            id.toString()
        );

        Address addr = contact.getPrimaryAddress();
        String line1 = addr != null ? addr.getAddressLine1() : null;
        String line2 = addr != null ? addr.getAddressLine2() : null;
        String city = addr != null ? addr.getCity() : null;
        String state = addr != null ? addr.getState() : null;
        String postalCode = addr != null ? addr.getPostalCode() : null;

        if (count != null && count > 0) {
            jdbcTemplate.update(
                "UPDATE contacts SET contact_type = ?, first_name = ?, last_name = ?, company_name = ?, email_address = ?, phone_number = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ? WHERE id = ?",
                contact.getContactType() != null ? contact.getContactType().name() : null,
                contact.getFirstName(),
                contact.getLastName(),
                contact.getCompanyName(),
                contact.getEmailAddress(),
                contact.getPhoneNumber(),
                line1,
                line2,
                city,
                state,
                postalCode,
                id.toString()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO contacts (id, contact_type, first_name, last_name, company_name, email_address, phone_number, address_line1, address_line2, city, state, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                id.toString(),
                contact.getContactType() != null ? contact.getContactType().name() : null,
                contact.getFirstName(),
                contact.getLastName(),
                contact.getCompanyName(),
                contact.getEmailAddress(),
                contact.getPhoneNumber(),
                line1,
                line2,
                city,
                state,
                postalCode
            );
        }
        return contact;
    }

    @Override
    public Contact findById(UUID id) {
        if (id == null) return null;
        List<Contact> contacts = jdbcTemplate.query(
            "SELECT * FROM contacts WHERE id = ?",
            rowMapper,
            id.toString()
        );
        return contacts.isEmpty() ? null : contacts.get(0);
    }

    @Override
    public List<Contact> findAll() {
        return jdbcTemplate.query("SELECT * FROM contacts", rowMapper);
    }

    @Override
    public boolean delete(UUID id) {
        if (id == null) return false;
        int rows = jdbcTemplate.update("DELETE FROM contacts WHERE id = ?", id.toString());
        return rows > 0;
    }

    @Override
    public Contact findByEmail(String email) {
        if (email == null) return null;
        List<Contact> contacts = jdbcTemplate.query(
            "SELECT * FROM contacts WHERE email_address = ?",
            rowMapper,
            email
        );
        return contacts.isEmpty() ? null : contacts.get(0);
    }

    @Override
    public void clear() {
        jdbcTemplate.update("DELETE FROM contacts");
    }
}
