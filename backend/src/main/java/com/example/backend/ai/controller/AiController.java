package com.example.backend.ai.controller;

import com.example.backend.ai.dto.AiChatRequest;
import com.example.backend.ai.dto.AiChatResponse;
import com.example.backend.ai.dto.AiConversationDto;
import com.example.backend.ai.entity.AiUploadedFile;
import com.example.backend.ai.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, Authentication authentication) {
        String username = authentication.getName();
        AiChatResponse response = aiService.processChat(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiConversationDto>> getConversations(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(aiService.getUserConversations(username));
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<List<AiChatResponse>> getHistory(@PathVariable Long conversationId, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(aiService.getConversationHistory(conversationId, username));
    }

    @DeleteMapping("/history/{conversationId}")
    public ResponseEntity<?> deleteConversation(@PathVariable Long conversationId, Authentication authentication) {
        String username = authentication.getName();
        aiService.deleteConversation(conversationId, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        String username = authentication.getName();
        try {
            AiUploadedFile uploadedFile = aiService.uploadFile(file, username);
            return ResponseEntity.ok(Map.of("id", uploadedFile.getId(), "fileName", uploadedFile.getFileName()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file");
        }
    }
}
