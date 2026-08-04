package com.example.backend.ai.repository;

import com.example.backend.ai.entity.AiUploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiUploadedFileRepository extends JpaRepository<AiUploadedFile, Long> {
    List<AiUploadedFile> findByUploadedByIdOrderByCreatedAtDesc(Long userId);
}
