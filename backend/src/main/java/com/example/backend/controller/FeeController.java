package com.example.backend.controller;

import com.example.backend.entity.Fee;
import com.example.backend.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/fees")
public class FeeController {
    @Autowired
    private FeeService feeService;

    @Autowired
    private com.example.backend.service.StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Fee>> getMyFees() {
        com.example.backend.security.UserDetailsImpl userDetails = (com.example.backend.security.UserDetailsImpl) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return studentService.getStudentByUserId(userDetails.getId())
                .map(student -> ResponseEntity.ok(feeService.getFeesByStudentId(student.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('PARENT')")
    public List<Fee> getFeesByStudentId(@PathVariable Long studentId) {
        return feeService.getFeesByStudentId(studentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Fee> getFeeById(@PathVariable Long id) {
        return feeService.getFeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.example.backend.service.NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Fee createFee(@RequestBody Fee fee) {
        Fee savedFee = feeService.saveFee(fee);
        sendFeeNotification(savedFee);
        return savedFee;
    }

    private void sendFeeNotification(Fee fee) {
        studentService.getStudentById(fee.getStudent().getId()).ifPresent(student -> {
            if (student.getUser() != null) {
                com.example.backend.entity.Notification notif = new com.example.backend.entity.Notification();
                notif.setUserId(student.getUser().getId());
                notif.setTitle("New Fee Assigned");
                notif.setMessage("A new fee of $" + fee.getAmount() + " has been assigned.");
                notif.setType(com.example.backend.entity.Notification.NotificationType.FEES);
                notificationService.createNotification(notif);
            }
            if (student.getParent() != null && student.getParent().getUser() != null) {
                com.example.backend.entity.Notification notif = new com.example.backend.entity.Notification();
                notif.setUserId(student.getParent().getUser().getId());
                notif.setTitle("New Fee Assigned");
                notif.setMessage("A new fee of $" + fee.getAmount() + " has been assigned to " + student.getName() + ".");
                notif.setType(com.example.backend.entity.Notification.NotificationType.FEES);
                notificationService.createNotification(notif);
            }
        });
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

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Fee> payFee(@PathVariable Long id, @RequestBody java.util.Map<String, java.math.BigDecimal> payload) {
        return feeService.getFeeById(id).map(fee -> {
            java.math.BigDecimal paymentAmount = payload.getOrDefault("amount", java.math.BigDecimal.ZERO);
            
            if (fee.getPaidAmount() == null) {
                fee.setPaidAmount(java.math.BigDecimal.ZERO);
            }
            
            java.math.BigDecimal newPaidAmount = fee.getPaidAmount().add(paymentAmount);
            fee.setPaidAmount(newPaidAmount);
            
            if (newPaidAmount.compareTo(fee.getAmount()) >= 0) {
                fee.setStatus(Fee.FeeStatus.PAID);
            } else if (newPaidAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                fee.setStatus(Fee.FeeStatus.PARTIAL);
            }
            
            fee.setPaymentDate(LocalDate.now());
            return ResponseEntity.ok(feeService.saveFee(fee));
        }).orElse(ResponseEntity.notFound().build());
    }
}
