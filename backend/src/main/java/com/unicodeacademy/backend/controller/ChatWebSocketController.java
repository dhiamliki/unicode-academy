package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ChatMessageRequest;
import com.unicodeacademy.backend.dto.ChatMessageResponse;
import com.unicodeacademy.backend.model.ChatMessage;
import com.unicodeacademy.backend.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/global")
    @SendTo("/topic/chat/global")
    public ChatMessageResponse sendGlobal(ChatMessageRequest request, Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Unauthorized");
        }

        ChatMessage saved = chatMessageService.createGlobalMessage(principal.getName(), request.getContent());
        return chatMessageService.toResponse(saved);
    }

    @MessageMapping("/chat/course/{courseId}")
    @SendTo("/topic/chat/course/{courseId}")
    public ChatMessageResponse sendCourse(@DestinationVariable Long courseId,
                                          ChatMessageRequest request,
                                          Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Unauthorized");
        }

        ChatMessage saved = chatMessageService.createCourseMessage(principal.getName(), request.getContent(), courseId);
        return chatMessageService.toResponse(saved);
    }
}
