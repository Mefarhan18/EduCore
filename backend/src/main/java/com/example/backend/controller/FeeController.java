package com.example.backend.controller;

import com.example.backend.entity.Fee;
import com.example.backend.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/fees")
public class FeeController {
    @Autowired
    private FeeService feeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public List<Fee> getFeesByStudentId(@PathVariable Long studentId) {
        return feeService.getFeesByStudentId(studentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<Fee> getFeeById(@PathVariable Long id) {
        return feeService.getFeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Fee createFee(@RequestBody Fee fee) {
        return feeService.saveFee(fee);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fee> updateFee(@PathVariable Long id, @RequestBody Fee feeDetails) {
        return feeService.getFeeById(id).map(fee -> {
            fee.setAmount(feeDetails.getAmount());
            fee.setDueDate(feeDetails.getDueDate());
            fee.setStatus(feeDetails.getStatus());
            return ResponseEntity.ok(feeService.saveFee(fee));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFee(@PathVariable Long id) {
        return feeService.getFeeById(id).map(fee -> {
            feeService.deleteFee(id);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
