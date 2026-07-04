package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import policyflow.api.dto.ContactDto;
import policyflow.api.util.DtoMapper;
import policyflow.domain.account.Contact;
import policyflow.service.account.ContactService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing Contacts.
 */
@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    @Autowired
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<List<ContactDto>> getAllContacts() {
        List<Contact> list = contactService.getAllContacts();
        List<ContactDto> contacts = new ArrayList<>();
        if (list != null) {
            for (Contact contact : list) {
                contacts.add(DtoMapper.toDto(contact));
            }
        }
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDto> getContactById(@PathVariable("id") UUID id) {
        Contact contact = contactService.getContact(id);
        if (contact == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toDto(contact));
    }

    @PostMapping
    public ResponseEntity<ContactDto> createContact(@RequestBody ContactDto dto) {
        Contact contact = DtoMapper.toDomain(dto);
        Contact created = contactService.createContact(contact);
        return new ResponseEntity<>(DtoMapper.toDto(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDto> updateContact(@PathVariable("id") UUID id, @RequestBody ContactDto dto) {
        dto.setId(id);
        Contact contact = DtoMapper.toDomain(dto);
        Contact updated = contactService.updateContact(contact);
        return ResponseEntity.ok(DtoMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable("id") UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}
