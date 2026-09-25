package com.example.backend.ai.service;

import com.example.backend.ai.dto.AiChatRequest;
import com.example.backend.ai.dto.AiChatResponse;
import com.example.backend.ai.dto.AiConversationDto;
import com.example.backend.ai.entity.AiChatMessage;
import com.example.backend.ai.entity.AiConversation;
import com.example.backend.ai.entity.AiUploadedFile;
import com.example.backend.ai.repository.AiChatMessageRepository;
import com.example.backend.ai.repository.AiConversationRepository;
import com.example.backend.ai.repository.AiUploadedFileRepository;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.nio.file.*;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private final AiConversationRepository conversationRepository;
    private final AiChatMessageRepository chatMessageRepository;
    private final AiUploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    public AiService(
            AiConversationRepository conversationRepository,
            AiChatMessageRepository chatMessageRepository,
            AiUploadedFileRepository uploadedFileRepository,
            UserRepository userRepository,
            WebClient.Builder webClientBuilder
    ) {

        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.uploadedFileRepository = uploadedFileRepository;
        this.userRepository = userRepository;

        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    @PostConstruct
    public void init() {
        try {

            if (uploadDir == null || uploadDir.isBlank()) {
                uploadDir = "./uploads";
            }

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            logger.info("Uploads directory initialized successfully: {}", uploadDir);

        } catch (Exception e) {

            logger.error("Could not initialize uploads directory", e);

            uploadDir = "./uploads";
        }
    }

    @Transactional
    public AiChatResponse processChat(AiChatRequest request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AiConversation conversation;

        if (request.getConversationId() != null) {

            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

        } else {

            conversation = new AiConversation();

            conversation.setUser(user);

            String title = request.getMessage().length() > 30
                    ? request.getMessage().substring(0, 30) + "..."
                    : request.getMessage();

            conversation.setTitle(title);

            conversation = conversationRepository.save(conversation);
        }

        String fullPrompt = buildPrompt(request, user);

        String aiResponseText = callGeminiApi(fullPrompt);

        AiChatMessage chatMessage = new AiChatMessage();

        chatMessage.setConversation(conversation);
        chatMessage.setUser(user);
        chatMessage.setRole("user");
        chatMessage.setMessage(request.getMessage());
        chatMessage.setResponse(aiResponseText);

        chatMessageRepository.save(chatMessage);

        AiChatResponse responseDto = new AiChatResponse();

        responseDto.setId(chatMessage.getId());
        responseDto.setConversationId(conversation.getId());
        responseDto.setRole("model");
        responseDto.setMessage(request.getMessage());
        responseDto.setResponse(aiResponseText);
        responseDto.setCreatedAt(chatMessage.getCreatedAt());

        return responseDto;
    }

    private String buildPrompt(AiChatRequest request, User user) {

        StringBuilder prompt = new StringBuilder();

        if ("STUDENT".equals(user.getRole().name())) {

            prompt.append("You are an expert AI educational tutor.\n");
            prompt.append("Explain concepts in beginner-friendly language.\n");
            prompt.append("Provide step-by-step solutions.\n");
            prompt.append("Give coding examples when relevant.\n\n");

        } else if ("TEACHER".equals(user.getRole().name())) {

            prompt.append("You are an expert AI educational assistant for teachers.\n");
            prompt.append("Help create assignments, quizzes, explanations, and lesson plans.\n\n");

        } else {

            prompt.append("You are a helpful educational AI assistant.\n\n");
        }

        if (request.getFileId() != null) {

            AiUploadedFile uploadedFile = uploadedFileRepository.findById(request.getFileId())
                    .orElseThrow(() -> new RuntimeException("Uploaded file not found"));

            prompt.append("Context from uploaded document:\n");
            prompt.append(uploadedFile.getExtractedText()).append("\n\n");
        }

        prompt.append("Question: ").append(request.getMessage());

        return prompt.toString();
    }

    private String callGeminiApi(String prompt) {
        List<String> models = new java.util.ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            models.add(geminiModel);
        }
        if (!models.contains("gemini-2.5-flash")) {
            models.add("gemini-2.5-flash");
        }
        // if (!models.contains("gemini-2.0-flash")) {
        //     models.add("gemini-2.0-flash");
        // }
        if (!models.contains("gemini-3.5-flash")) {
            models.add("gemini-3.5-flash");
        }

        Exception lastException = null;
        for (int i = 0; i < models.size(); i++) {
            String model = models.get(i);
            try {
                return callGeminiApiWithModel(prompt, model);
            } catch (Exception e) {
                lastException = e;
                logger.warn("Model {} failed: {}", model, e.getMessage());
                if (i < models.size() - 1) {
                    logger.info("Retrying with next fallback model...");
                }
            }
        }

        if (lastException instanceof WebClientResponseException) {
            WebClientResponseException wcre = (WebClientResponseException) lastException;
            String errorBody = wcre.getResponseBodyAsString();
            logger.error("All Gemini API models failed. Last Google API error body: {}", errorBody);

            if (errorBody.contains("API_KEY_INVALID")) {
                return "Invalid Gemini API key.";
            }
            if (errorBody.contains("quota") || wcre.getStatusCode().value() == 429) {
                return "Gemini quota exceeded.";
            }
            if (errorBody.contains("not found") || errorBody.contains("model")) {
                return "Unsupported Gemini model.";
            }
            return "AI service temporarily unavailable.";
        } else if (lastException != null) {
            logger.error("All Gemini API models failed. Last unexpected error: ", lastException);
            return "Unexpected AI service error.";
        }

        return "AI service temporarily unavailable.";
    }

    private String callGeminiApiWithModel(String prompt, String modelName) throws Exception {

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalArgumentException("Gemini API key is missing.");
        }

        try {
            String uri =
                    "/v1beta/models/"
                            + modelName
                            + ":generateContent?key="
                            + geminiApiKey;

            String finalEndpoint = "https://generativelanguage.googleapis.com" + uri;
            logger.info("Active Gemini model: {}", modelName);
            logger.info("Final API endpoint: {}", finalEndpoint);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                             Map.of("text", prompt)
                                    )
                            )
                    )
            );

            logger.info("Sending request to Gemini API");

            Map response = webClient.post()
                    .uri(uri)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            logger.info("Gemini API response received successfully");

            if (response == null || !response.containsKey("candidates")) {
                throw new RuntimeException("No AI response received.");
            }

            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) response.get("candidates");

            if (candidates.isEmpty()) {
                throw new RuntimeException("Empty AI response.");
            }

            Map<String, Object> content =
                    (Map<String, Object>) candidates.get(0).get("content");

            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                throw new RuntimeException("Invalid AI response.");
            }

            return parts.get(0).get("text").toString();

        } catch (WebClientResponseException e) {
            String errorBody = e.getResponseBodyAsString();
            logger.error("Raw Google API error body: {}", errorBody);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected Gemini Error for model: {}", modelName, e);
            throw e;
        }
    }

    public List<AiConversationDto> getUserConversations(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return conversationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(conv -> {

                    AiConversationDto dto = new AiConversationDto();

                    dto.setId(conv.getId());
                    dto.setTitle(conv.getTitle());
                    dto.setCreatedAt(conv.getCreatedAt());

                    return dto;

                }).collect(Collectors.toList());
    }

    public List<AiChatResponse> getConversationHistory(
            Long conversationId,
            String username
    ) {

        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(msg -> {

                    AiChatResponse dto = new AiChatResponse();

                    dto.setId(msg.getId());
                    dto.setConversationId(msg.getConversation().getId());
                    dto.setRole("model");
                    dto.setMessage(msg.getMessage());
                    dto.setResponse(msg.getResponse());
                    dto.setCreatedAt(msg.getCreatedAt());

                    return dto;

                }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteConversation(Long conversationId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chatMessageRepository.deleteByConversationIdAndUserId(
                conversationId,
                user.getId()
        );

        conversationRepository.deleteById(conversationId);
    }

    @Transactional
    public AiUploadedFile uploadFile(
            MultipartFile file,
            String username
    ) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();

        String uniqueFilename =
                System.currentTimeMillis() + "_" + originalFilename;

        Path filePath = uploadPath.resolve(uniqueFilename);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        String extractedText = "";

        if (originalFilename != null
                && originalFilename.toLowerCase().endsWith(".pdf")) {

            try (PDDocument document = PDDocument.load(filePath.toFile())) {

                PDFTextStripper stripper = new PDFTextStripper();

                extractedText = stripper.getText(document);

                if (extractedText.length() > 50000) {
                    extractedText = extractedText.substring(0, 50000);
                }

            } catch (Exception e) {

                logger.error("PDF extraction failed", e);
            }
        }

        AiUploadedFile uploadedFile = new AiUploadedFile();

        uploadedFile.setUploadedBy(user);
        uploadedFile.setFileName(originalFilename);
        uploadedFile.setFilePath(filePath.toString());
        uploadedFile.setExtractedText(extractedText);

        return uploadedFileRepository.save(uploadedFile);
    }
}