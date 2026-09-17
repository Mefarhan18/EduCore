package com.example.backend.ai.repository;

import com.example.backend.ai.entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<AiChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    void deleteByUserId(Long userId);
    void deleteByConversationIdAndUserId(Long conversationId, Long userId);
}
