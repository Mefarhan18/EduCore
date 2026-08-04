package com.example.backend;

import com.example.backend.ai.dto.AiChatRequest;
import com.example.backend.ai.dto.AiChatResponse;
import com.example.backend.ai.service.AiService;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void testChatbotResponses() {
        String username = "testuser";
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setPassword("password");
            user.setRole(Role.STUDENT);
            user = userRepository.save(user);
        }

        String[] questions = {
            "What is Java?",
            "Explain DBMS",
            "What is inheritance in Java?"
        };

        for (String question : questions) {
            System.out.println("TESTING QUESTION: " + question);
            AiChatRequest request = new AiChatRequest();
            request.setMessage(question);
            
            AiChatResponse response = aiService.processChat(request, username);
            
            assertNotNull(response);
            assertNotNull(response.getResponse());
            assertFalse(response.getResponse().isBlank());
            
            System.out.println("AI RESPONSE: " + response.getResponse());
            System.out.println("----------------------------------------");
        }
    }
}
