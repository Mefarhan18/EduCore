package com.example.backend.ai.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiConversationDto {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
}
