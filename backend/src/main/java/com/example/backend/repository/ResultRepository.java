package com.example.backend.repository;

import com.example.backend.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentId(Long studentId);

    @Query("SELECT COUNT(r) FROM Result r")
    long countTotalResults();

    @Query("SELECT COUNT(r) FROM Result r WHERE r.grade != 'F'")
    long countPassedResults();
}
