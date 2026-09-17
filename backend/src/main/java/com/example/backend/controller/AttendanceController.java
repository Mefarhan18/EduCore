package com.example.backend.controller;

import com.example.backend.entity.Attendance;
import com.example.backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Attendance>> getMyAttendance() {
        com.example.backend.security.UserDetailsImpl userDetails = (com.example.backend.security.UserDetailsImpl) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return studentService.getStudentByUserId(userDetails.getId())
                .map(student -> ResponseEntity.ok(attendanceService.getAttendanceByStudentId(student.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public List<Attendance> getAttendanceByStudentId(@PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudentId(studentId);
    }

    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<java.util.Map<String, Object>> getAttendanceSummary(@PathVariable Long studentId) {
        List<Attendance> records = attendanceService.getAttendanceByStudentId(studentId);
        long presentCount = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        double percentage = records.isEmpty() ? 0 : ((double) presentCount / records.size()) * 100;
        
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("total", records.size());
        summary.put("present", presentCount);
        summary.put("percentage", percentage);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.example.backend.service.StudentService studentService;

    @Autowired
    private com.example.backend.service.NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        Attendance savedAttendance = attendanceService.saveAttendance(attendance);
        sendAttendanceNotification(savedAttendance);
        return savedAttendance;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendanceDetails) {
        return attendanceService.getAttendanceById(id).map(attendance -> {
            attendance.setDate(attendanceDetails.getDate());
            attendance.setStatus(attendanceDetails.getStatus());
            Attendance savedAttendance = attendanceService.saveAttendance(attendance);
            sendAttendanceNotification(savedAttendance);
            return ResponseEntity.ok(savedAttendance);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void sendAttendanceNotification(Attendance attendance) {
        if (attendance.getStatus() == Attendance.AttendanceStatus.ABSENT || attendance.getStatus() == Attendance.AttendanceStatus.LATE) {
            studentService.getStudentById(attendance.getStudent().getId()).ifPresent(student -> {
                if (student.getParent() != null && student.getParent().getUser() != null) {
                    com.example.backend.entity.Notification notif = new com.example.backend.entity.Notification();
                    notif.setUserId(student.getParent().getUser().getId());
                    notif.setTitle("Attendance Alert");
                    notif.setMessage("Your child " + student.getName() + " was marked " + attendance.getStatus() + " on " + attendance.getDate() + ".");
                    notif.setType(com.example.backend.entity.Notification.NotificationType.ANNOUNCEMENT);
                    notificationService.createNotification(notif);
                }
            });
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id).map(attendance -> {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
