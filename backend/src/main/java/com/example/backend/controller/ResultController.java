package com.example.backend.controller;

import com.example.backend.entity.Result;
import com.example.backend.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.backend.service.StudentService;
import com.example.backend.security.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/results")
public class ResultController {
    @Autowired
    private ResultService resultService;

    @Autowired
    private StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Result> getAllResults() {
        return resultService.getAllResults();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Result>> getMyResults() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return studentService.getStudentByUserId(userDetails.getId())
                .map(student -> ResponseEntity.ok(resultService.getResultsByStudentId(student.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public List<Result> getResultsByStudentId(@PathVariable Long studentId) {
        return resultService.getResultsByStudentId(studentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Result> getResultById(@PathVariable Long id) {
        return resultService.getResultById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.example.backend.service.NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public Result createResult(@RequestBody Result result) {
        Result savedResult = resultService.saveResult(result);
        sendResultNotification(savedResult);
        return savedResult;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Result> updateResult(@PathVariable Long id, @RequestBody Result resultDetails) {
        return resultService.getResultById(id).map(result -> {
            result.setMarks(resultDetails.getMarks());
            result.setGrade(resultDetails.getGrade());
            result.setExamTerm(resultDetails.getExamTerm());
            Result savedResult = resultService.saveResult(result);
            sendResultNotification(savedResult);
            return ResponseEntity.ok(savedResult);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void sendResultNotification(Result result) {
        studentService.getStudentById(result.getStudent().getId()).ifPresent(student -> {
            if (student.getUser() != null) {
                com.example.backend.entity.Notification notif = new com.example.backend.entity.Notification();
                notif.setUserId(student.getUser().getId());
                notif.setTitle("New Result Posted");
                notif.setMessage("A new result for " + result.getExamTerm() + " has been posted. Grade: " + result.getGrade());
                notif.setType(com.example.backend.entity.Notification.NotificationType.RESULT);
                notificationService.createNotification(notif);
            }
            if (student.getParent() != null && student.getParent().getUser() != null) {
                com.example.backend.entity.Notification notif = new com.example.backend.entity.Notification();
                notif.setUserId(student.getParent().getUser().getId());
                notif.setTitle("Child Result Posted");
                notif.setMessage("A new result for " + student.getName() + " has been posted. Grade: " + result.getGrade());
                notif.setType(com.example.backend.entity.Notification.NotificationType.RESULT);
                notificationService.createNotification(notif);
            }
        });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteResult(@PathVariable Long id) {
        return resultService.getResultById(id).map(result -> {
            resultService.deleteResult(id);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
