package com.example.backend.service;

import com.example.backend.entity.Fee;
import com.example.backend.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeeService {
    @Autowired
    private FeeRepository feeRepository;

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public Optional<Fee> getFeeById(Long id) {
        return feeRepository.findById(id);
    }

    public List<Fee> getFeesByStudentId(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public Fee saveFee(Fee fee) {
        return feeRepository.save(fee);
    }

    public void deleteFee(Long id) {
        feeRepository.deleteById(id);
    }
}
