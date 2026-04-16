package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AiHintResponse;
import com.unicodeacademy.backend.dto.ExerciseHintRequest;
import com.unicodeacademy.backend.dto.PratiqueHintRequest;
import com.unicodeacademy.backend.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private static final String EXERCISE_SYSTEM_PROMPT = """
            Tu es l'assistant pedagogique de UniCode Academy.
            Adapte strictement ta reponse a l'intention de l'etudiant :
            - solution : donne la bonne reponse ou un mini exemple de code utile, de facon directe
            - debug : explique l'erreur ou le raisonnement fautif le plus probable
            - explain : explique le concept clairement et brievement
            - hint : donne un indice progressif sans la solution finale
            Utilise le langage, la lecon, le code et la sortie fournis.
            Reponds toujours en francais.
            Reponses courtes, actionnables et specifiques.
            Si tu donnes du code, utilise un bloc Markdown.
            N'utilise jamais des phrases vagues comme "Relis l'enonce" ou "Essaie encore".""";

    private static final String PRATIQUE_SYSTEM_PROMPT = """
            Tu es l'assistant pedagogique de UniCode Academy.
            Adapte strictement ta reponse a l'intention de l'etudiant :
            - solution : donne une solution minimale valide dans le langage demande
            - debug : pointe la cause la plus probable et la correction immediate
            - explain : explique le concept en 2 ou 3 phrases courtes
            - hint : donne un indice progressif sans solution complete
            Utilise l'objectif, la sortie attendue, le code actuel et la sortie console.
            Reponds toujours en francais.
            Reponses courtes, actionnables et specifiques.
            Si tu donnes du code, utilise un bloc Markdown.
            N'utilise jamais des phrases vagues comme "Relis l'enonce" ou "Essaie encore".""";

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/hint/exercise")
    public AiHintResponse exerciseHint(@RequestBody(required = false) ExerciseHintRequest request) {
        try {
            return aiService.getExerciseHint(EXERCISE_SYSTEM_PROMPT, request);
        } catch (RuntimeException ex) {
            log.warn("Exercise hint request failed in controller, returning local fallback", ex);
            return aiService.buildExerciseFallbackResponse(request);
        }
    }

    @PostMapping("/hint/pratique")
    public AiHintResponse pratiqueHint(@RequestBody(required = false) PratiqueHintRequest request) {
        try {
            return aiService.getPratiqueHint(PRATIQUE_SYSTEM_PROMPT, request);
        } catch (RuntimeException ex) {
            log.warn("Practice hint request failed in controller, returning local fallback", ex);
            return aiService.buildPratiqueFallbackResponse(request);
        }
    }
}
