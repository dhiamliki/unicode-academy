package com.unicodeacademy.backend.config;

import com.unicodeacademy.backend.service.ChatMessageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatRetentionScheduler {

    private final ChatMessageService chatMessageService;

    @PostConstruct
    public void purgeOnStartup() {
        chatMessageService.deleteMessagesOlderThanRetention();
    }

    @Scheduled(cron = "${app.chat.retention-cron:0 0 * * * *}")
    public void purgeExpiredMessages() {
        chatMessageService.deleteMessagesOlderThanRetention();
    }
}
