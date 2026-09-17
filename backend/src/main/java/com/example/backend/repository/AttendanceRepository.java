package com.example.backend.repository;

import com.example.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a")
    long countTotalAttendanceRecords();

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'PRESENT'")
    long countPresentAttendanceRecords();
}
