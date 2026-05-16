package com.example.backend.controller;

import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.FeeRepository;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.ResultRepository;
import com.example.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ResultRepository resultRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalTeachers", teacherRepository.count());
        stats.put("totalClasses", classRepository.count());

        BigDecimal collected = feeRepository.getTotalFeesCollected();
        BigDecimal pending = feeRepository.getTotalFeesPending();
        stats.put("totalFeesCollected", collected != null ? collected : BigDecimal.ZERO);
        stats.put("totalFeesPending", pending != null ? pending : BigDecimal.ZERO);

        long totalAtt = attendanceRepository.countTotalAttendanceRecords();
        long presentAtt = attendanceRepository.countPresentAttendanceRecords();
        double attendancePercentage = totalAtt > 0 ? ((double) presentAtt / totalAtt) * 100 : 0.0;
        stats.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);

        long totalRes = resultRepository.countTotalResults();
        long passedRes = resultRepository.countPassedResults();
        double passPercentage = totalRes > 0 ? ((double) passedRes / totalRes) * 100 : 0.0;
        stats.put("passPercentage", Math.round(passPercentage * 100.0) / 100.0);

        return stats;
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public Map<String, Object> getTeacherDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // For simplicity in Phase 4, we'll return total counts.
        // A more advanced query would filter by the specific teacher's assigned classes.
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalClasses", classRepository.count());

        long totalAtt = attendanceRepository.countTotalAttendanceRecords();
        long presentAtt = attendanceRepository.countPresentAttendanceRecords();
        double attendancePercentage = totalAtt > 0 ? ((double) presentAtt / totalAtt) * 100 : 0.0;
        stats.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);

        return stats;
    }
}
