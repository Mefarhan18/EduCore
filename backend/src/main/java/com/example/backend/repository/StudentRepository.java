package com.example.backend.repository;

import com.example.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    
    Page<Student> findByNameContainingIgnoreCaseOrRollNoContainingIgnoreCase(String name, String rollNo, Pageable pageable);
}
