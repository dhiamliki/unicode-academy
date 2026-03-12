package com.unicodeacademy.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class AccountTerminationEmailService {

    private static final Logger log = LoggerFactory.getLogger(AccountTerminationEmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@unicode.local}")
    private String fromAddress;

    @Value("${app.mail.account-termination.enabled:true}")
    private boolean enabled;

    public AccountTerminationEmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendAdminTerminationEmail(String recipientEmail, String username) {
        if (!enabled) {
            return;
        }
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }
        if (mailHost == null || mailHost.isBlank()) {
            log.warn("E-mail de suppression de compte ignore: spring.mail.host n'est pas configure (definir SMTP_HOST ou spring.mail.host)");
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("E-mail de suppression de compte ignore: JavaMailSender indisponible");
            return;
        }

        String normalizedEmail = recipientEmail.trim();
        String displayName = username != null && !username.isBlank() ? username.trim() : "utilisateur";
        String escapedDisplayName = HtmlUtils.htmlEscape(displayName);

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
                  <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; padding:30px;">
                    
                    <h2 style="color:#0f172a; margin-bottom:20px;">
                      UniCode Academy
                    </h2>
                
                    <p style="font-size:16px; color:#1f2937;">
                      Bonjour {{username}},
                    </p>
                
                    <p style="font-size:15px; color:#374151; line-height:1.6;">
                      Votre compte UniCode a ete desactive par un administrateur.
                    </p>
                
                    <p style="font-size:15px; color:#374151; line-height:1.6;">
                      Si vous pensez qu'il s'agit d'une erreur, contactez notre equipe de support.
                    </p>
                
                    <div style="margin-top:30px; padding-top:20px; border-top:1px solid #e5e7eb;">
                      <p style="font-size:13px; color:#6b7280;">
                        Ceci est un message automatique de UniCode Academy.
                      </p>
                    </div>
                
                  </div>
                </div>
                """.replace("{{username}}", escapedDisplayName);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(normalizedEmail);
            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress.trim());
            }
            helper.setSubject("Votre compte UniCode a ete desactive");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("E-mail de suppression de compte envoye a {}", normalizedEmail);
        } catch (MessagingException | MailException ex) {
            log.error("Impossible d'envoyer l'e-mail de suppression de compte a {}", normalizedEmail, ex);
        }
    }
}
