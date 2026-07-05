package policyflow.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import policyflow.api.dto.VehicleDto;
import policyflow.api.util.DtoMapper;
import policyflow.domain.vehicle.Vehicle;
import policyflow.service.vehicle.VehicleService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing Vehicles.
 */
@RestController
@RequestMapping("/api/vehicles")
@Transactional
public class VehicleController {

    private final VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        List<Vehicle> list = vehicleService.getAllVehicles();
        List<VehicleDto> vehicles = new ArrayList<>();
        if (list != null) {
            for (Vehicle vehicle : list) {
                vehicles.add(DtoMapper.toDto(vehicle));
            }
        }
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable("id") UUID id) {
        Vehicle vehicle = vehicleService.getVehicle(id);
        if (vehicle == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toDto(vehicle));
    }

    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(@RequestBody VehicleDto dto) {
        Vehicle vehicle = DtoMapper.toDomain(dto);
        Vehicle created = vehicleService.createVehicle(vehicle);
        return new ResponseEntity<>(DtoMapper.toDto(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable("id") UUID id, @RequestBody VehicleDto dto) {
        dto.setId(id);
        Vehicle vehicle = DtoMapper.toDomain(dto);
        Vehicle updated = vehicleService.updateVehicle(vehicle);
        return ResponseEntity.ok(DtoMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable("id") UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
