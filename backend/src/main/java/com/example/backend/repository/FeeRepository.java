package com.example.backend.repository;

import com.example.backend.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentId(Long studentId);

    @Query("SELECT SUM(f.paidAmount) FROM Fee f")
    BigDecimal getTotalFeesCollected();

    @Query("SELECT SUM(f.amount - f.paidAmount) FROM Fee f WHERE f.status != 'PAID'")
    BigDecimal getTotalFeesPending();
}
