package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomTypeOrderByCreatedAtDesc(ChatMessage.RoomType roomType, Pageable pageable);

    List<ChatMessage> findByRoomTypeAndCourseIdOrderByCreatedAtDesc(ChatMessage.RoomType roomType, Long courseId, Pageable pageable);

    List<ChatMessage> findByRoomTypeIsNullOrRoomTypeOrderByCreatedAtDesc(ChatMessage.RoomType roomType, Pageable pageable);
}
