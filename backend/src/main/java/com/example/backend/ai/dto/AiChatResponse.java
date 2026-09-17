package com.example.backend.ai.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiChatResponse {
    private Long id;
    private Long conversationId;
    private String role;
    private String message;
    private String response;
    private LocalDateTime createdAt;
}
