package policyflow.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller exposing basic service information, Swagger URL, and application health checking.
 */
@RestController
public class InfoController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "PolicyFlow");
        info.put("description", "Guidewire-inspired Insurance Core Platform REST API");
        info.put("version", "1.0.0");
        info.put("swaggerDocs", "/swagger-ui/index.html");
        info.put("healthCheck", "/api/health");
        return ResponseEntity.ok(info);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("application", "PolicyFlow");
        status.put("version", "1.0.0");
        return ResponseEntity.ok(status);
    }
}
