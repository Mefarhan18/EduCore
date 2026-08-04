package com.example.backend.ai.dto;

import lombok.Data;

@Data
public class AiChatRequest {
    private String message;
    private Long conversationId;
    private Long fileId;
}
