package com.unicodeacademy.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.unicodeacademy.backend.dto.AiHintResponse;
import com.unicodeacademy.backend.dto.ExerciseHintRequest;
import com.unicodeacademy.backend.dto.PratiqueHintRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.StringJoiner;
import java.util.function.Function;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-3-5-haiku-20241022";
    private static final String FALLBACK_REASON_NOT_CONFIGURED = "configuration_absente";
    private static final String FALLBACK_REASON_PROVIDER_UNAVAILABLE = "service_indisponible";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public AiService(RestTemplateBuilder restTemplateBuilder,
                     @Value("${app.anthropic.api-key:}") String apiKey) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(12))
                .build();
        this.apiKey = apiKey != null ? apiKey.trim() : "";
    }

    public AiHintResponse getExerciseHint(String systemPrompt, ExerciseHintRequest request) {
        ExerciseHintRequest safeRequest = normalizeExerciseRequest(request);
        try {
            return completeHint(
                    systemPrompt,
                    buildExerciseUserMessage(safeRequest),
                    reason -> safeExerciseFallback(safeRequest, reason)
            );
        } catch (Exception ex) {
            log.warn("Exercise hint generation failed before provider completion", ex);
            return safeExerciseFallback(safeRequest, FALLBACK_REASON_PROVIDER_UNAVAILABLE);
        }
    }

    public AiHintResponse buildExerciseFallbackResponse(ExerciseHintRequest request) {
        return safeExerciseFallback(normalizeExerciseRequest(request), FALLBACK_REASON_PROVIDER_UNAVAILABLE);
    }

    public AiHintResponse getPratiqueHint(String systemPrompt, PratiqueHintRequest request) {
        PratiqueHintRequest safeRequest = normalizePratiqueRequest(request);
        try {
            return completeHint(
                    systemPrompt,
                    buildPratiqueUserMessage(safeRequest),
                    reason -> safePratiqueFallback(safeRequest, reason)
            );
        } catch (Exception ex) {
            log.warn("Practice hint generation failed before provider completion", ex);
            return safePratiqueFallback(safeRequest, FALLBACK_REASON_PROVIDER_UNAVAILABLE);
        }
    }

    public AiHintResponse buildPratiqueFallbackResponse(PratiqueHintRequest request) {
        return safePratiqueFallback(normalizePratiqueRequest(request), FALLBACK_REASON_PROVIDER_UNAVAILABLE);
    }

    private AiHintResponse completeHint(String systemPrompt,
                                        String userMessage,
                                        Function<String, AiHintResponse> fallbackFactory) {
        if (apiKey.isBlank()) {
            return fallbackFactory.apply(FALLBACK_REASON_NOT_CONFIGURED);
        }

        Map<String, Object> payload = Map.of(
                "model", MODEL,
                "max_tokens", 500,
                "system", safe(systemPrompt),
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", safe(userMessage)
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    API_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    JsonNode.class
            );

            JsonNode body = response.getBody();
            String text = body != null ? body.path("content").path(0).path("text").asText("") : "";
            if (hasText(text)) {
                return new AiHintResponse(text.trim(), false, null);
            }
        } catch (Exception ex) {
            log.warn("Anthropic hint request failed", ex);
        }

        return fallbackFactory.apply(FALLBACK_REASON_PROVIDER_UNAVAILABLE);
    }

    private ExerciseHintRequest normalizeExerciseRequest(ExerciseHintRequest request) {
        ExerciseHintRequest safeRequest = request != null ? request : new ExerciseHintRequest();
        safeRequest.setQuestion(safe(safeRequest.getQuestion()));
        safeRequest.setOptions(safeRequest.getOptions());
        safeRequest.setUserMessage(safe(safeRequest.getUserMessage()));
        safeRequest.setIntent(safe(safeRequest.getIntent()));
        safeRequest.setLanguage(safe(safeRequest.getLanguage()));
        safeRequest.setLessonTitle(safe(safeRequest.getLessonTitle()));
        safeRequest.setObjective(safe(safeRequest.getObjective()));
        safeRequest.setExpectedOutput(safe(safeRequest.getExpectedOutput()));
        safeRequest.setUserCode(safe(safeRequest.getUserCode()));
        safeRequest.setConsoleOutput(safe(safeRequest.getConsoleOutput()));
        safeRequest.setExplanation(safe(safeRequest.getExplanation()));
        safeRequest.setSelectedAnswer(safe(safeRequest.getSelectedAnswer()));
        return safeRequest;
    }

    private PratiqueHintRequest normalizePratiqueRequest(PratiqueHintRequest request) {
        PratiqueHintRequest safeRequest = request != null ? request : new PratiqueHintRequest();
        safeRequest.setInstructions(safe(safeRequest.getInstructions()));
        safeRequest.setIntent(safe(safeRequest.getIntent()));
        safeRequest.setLanguage(safe(safeRequest.getLanguage()));
        safeRequest.setLessonTitle(safe(safeRequest.getLessonTitle()));
        safeRequest.setObjective(safe(safeRequest.getObjective()));
        safeRequest.setExpectedOutput(safe(safeRequest.getExpectedOutput()));
        safeRequest.setCurrentCode(safe(safeRequest.getCurrentCode()));
        safeRequest.setUserCode(safe(safeRequest.getUserCode()));
        safeRequest.setConsoleOutput(safe(safeRequest.getConsoleOutput()));
        safeRequest.setCurrentError(safe(safeRequest.getCurrentError()));
        safeRequest.setUserMessage(safe(safeRequest.getUserMessage()));
        return safeRequest;
    }

    private AiHintResponse safeExerciseFallback(ExerciseHintRequest request, String reason) {
        try {
            return buildExerciseFallback(request, reason);
        } catch (Exception ex) {
            log.warn("Exercise fallback generation failed", ex);
            return fallbackResponse(
                    "Je ne peux pas utiliser l'assistant distant pour l'instant. " +
                            "Retiens d'abord l'objectif principal de la question, puis compare chaque option a ce comportement exact.",
                    reason
            );
        }
    }

    private AiHintResponse safePratiqueFallback(PratiqueHintRequest request, String reason) {
        try {
            return buildPratiqueFallback(request, reason);
        } catch (Exception ex) {
            log.warn("Practice fallback generation failed", ex);
            return fallbackResponse(
                    "Je ne peux pas utiliser l'assistant distant pour l'instant. " +
                            "Commence par relire l'objectif, corrige un seul point dans ton code, puis relance pour verifier ce qui change.",
                    reason
            );
        }
    }

    private String buildExerciseUserMessage(ExerciseHintRequest request) {
        return """
                Langage : %s
                Lecon : %s
                Objectif : %s
                Question : %s
                Options : %s
                Sortie attendue : %s
                Code actuel :
                %s
                Sortie console :
                %s
                Reponse selectionnee : %s
                Intent de l'etudiant : %s
                Contexte pedagogique : %s
                Message de l'etudiant : %s
                Regles de reponse :
                - solution : reponds directement, avec un mini exemple ou un bloc de code si utile
                - debug : donne la cause probable puis la correction immediate
                - explain : explique simplement le concept en 2 ou 3 phrases
                - hint : donne un indice progressif sans la solution finale
                Evite absolument les phrases vagues.""".formatted(
                defaultIfBlank(request.getLanguage(), "non precise"),
                defaultIfBlank(request.getLessonTitle(), "non precisee"),
                defaultIfBlank(request.getObjective(), "non precise"),
                sanitizeInline(request.getQuestion()),
                formatOptions(request.getOptions()),
                defaultIfBlank(request.getExpectedOutput(), "non precisee"),
                sanitizeMultiline(extractUserCode(request)),
                defaultIfBlank(request.getConsoleOutput(), "Aucune sortie"),
                defaultIfBlank(request.getSelectedAnswer(), "aucune"),
                resolveIntent(request.getIntent(), request.getUserMessage(), "hint"),
                defaultIfBlank(request.getExplanation(), "aucun"),
                fallbackStudentMessage(request.getUserMessage())
        );
    }

    private String buildPratiqueUserMessage(PratiqueHintRequest request) {
        return """
                Langage : %s
                Lecon : %s
                Objectif : %s
                Instructions : %s
                Sortie attendue : %s
                Intent de l'etudiant : %s
                Code actuel :
                %s
                Sortie console :
                %s
                Erreurs :
                %s
                Message de l'etudiant : %s
                Regles de reponse :
                - solution : donne une solution minimale valide dans un bloc de code adapte au langage
                - debug : pointe le probleme le plus probable puis la correction immediate
                - explain : explique le concept en 2 ou 3 phrases maximum
                - hint : donne un indice progressif sans ecrire toute la solution
                Evite absolument les phrases vagues.""".formatted(
                defaultIfBlank(request.getLanguage(), "non precise"),
                defaultIfBlank(request.getLessonTitle(), "non precisee"),
                sanitizeMultiline(firstNonEmpty(request.getObjective(), request.getInstructions())),
                sanitizeMultiline(request.getInstructions()),
                defaultIfBlank(request.getExpectedOutput(), "non precisee"),
                resolveIntent(request.getIntent(), request.getUserMessage(), "hint"),
                sanitizeMultiline(extractUserCode(request)),
                defaultIfBlank(request.getConsoleOutput(), "Aucune sortie"),
                defaultIfBlank(request.getCurrentError(), "Aucune erreur visible"),
                fallbackStudentMessage(request.getUserMessage())
        );
    }

    private AiHintResponse buildExerciseFallback(ExerciseHintRequest request, String reason) {
        String intent = resolveIntent(request.getIntent(), request.getUserMessage(), "hint");
        String topic = detectTopic(request.getLessonTitle(), request.getQuestion(), request.getExplanation());
        String language = defaultIfBlank(request.getLanguage(), "ce langage");

        switch (intent) {
            case "solution" -> {
                return fallbackResponse(buildExerciseSolution(request, topic, language), reason);
            }
            case "explain" -> {
                List<String> lines = new ArrayList<>();
                if (hasText(request.getSelectedAnswer())) {
                    lines.add("L'option " + quoteInline(request.getSelectedAnswer()) + " correspond a " +
                            describeOptionMeaning(request.getSelectedAnswer(), language) + ".");
                } else {
                    lines.add(buildConceptExplanation(topic, language));
                }
                lines.add("Dans ce type de question, distingue bien le role du symbole ou du mot-cle avant de choisir.");
                return fallbackResponse(joinAdvice(lines), reason);
            }
            case "debug" -> {
                List<String> lines = new ArrayList<>();
                if (hasText(request.getSelectedAnswer())) {
                    lines.add("Si ton choix te semble correct, demande-toi d'abord quel comportement exact represente l'option " +
                            quoteInline(request.getSelectedAnswer()) + ".");
                    lines.add(describeSelectionCheck(request.getSelectedAnswer(), language));
                } else {
                    lines.add("Commence par eliminer les options qui ne correspondent pas a l'action demandee dans la question.");
                }
                lines.add(buildTopicHint(topic, language));
                return fallbackResponse(joinAdvice(lines), reason);
            }
            default -> {
                List<String> lines = new ArrayList<>();
                lines.add(buildTopicHint(topic, language));
                String likelyAnswer = detectLikelyExerciseAnswer(request);
                if (hasText(likelyAnswer)) {
                    lines.add("Cherche l'option qui sert a " + describeOptionMeaning(likelyAnswer, language) + ".");
                }
                lines.add("Valide ton choix avec un mini exemple ou un test mental tres court.");
                return fallbackResponse(joinAdvice(lines), reason);
            }
        }
    }

    private AiHintResponse buildPratiqueFallback(PratiqueHintRequest request, String reason) {
        String intent = resolveIntent(request.getIntent(), request.getUserMessage(), "hint");
        String topic = detectTopic(request.getLessonTitle(), request.getObjective(), request.getInstructions());
        String language = defaultIfBlank(request.getLanguage(), "ce langage");
        List<String> lines = new ArrayList<>();

        switch (intent) {
            case "solution" -> {
                return fallbackResponse(buildPracticeSolution(request, topic, language), reason);
            }
            case "explain" -> {
                lines.add(buildConceptExplanation(topic, language));
                lines.add("Appuie-toi ensuite sur le code de depart pour appliquer cette idee sans tout reecrire.");
                if (hasText(request.getExpectedOutput())) {
                    lines.add("Le bon repere est le resultat attendu " + quoteInline(compactInline(request.getExpectedOutput(), 80)) + ".");
                }
            }
            case "debug" -> {
                lines.add(buildPracticeDebugObservation(request, language));
                if (hasText(request.getExpectedOutput())) {
                    lines.add("Compare ta sortie actuelle avec l'attendu, ligne par ligne et caractere par caractere si besoin.");
                }
                lines.add(buildPracticeNextStep(request, language));
            }
            default -> {
                lines.add("Voici l'etape la plus utile maintenant : " +
                        compactInline(firstNonEmpty(request.getObjective(), request.getInstructions()), 120) + ".");
                lines.add(buildTopicHint(topic, language));
                if (hasText(request.getExpectedOutput())) {
                    lines.add("Vise une sortie ou un rendu proche de " +
                            quoteInline(compactInline(request.getExpectedOutput(), 80)) + ".");
                }
            }
        }

        return fallbackResponse(joinAdvice(lines), reason);
    }

    private String buildExerciseSolution(ExerciseHintRequest request, String topic, String language) {
        String likelyAnswer = detectLikelyExerciseAnswer(request);
        String objective = firstNonEmpty(request.getObjective(), request.getQuestion());
        String solutionCode = buildSolutionCode(
                language,
                topic,
                objective,
                request.getExpectedOutput(),
                request.getQuestion(),
                request.getUserMessage()
        );

        List<String> sections = new ArrayList<>();
        if (hasText(likelyAnswer)) {
            sections.add("La reponse attendue ici est `" + likelyAnswer + "`.");
        } else {
            sections.add("Voici un exemple minimal qui montre la bonne idee.");
        }
        sections.add(markdownCodeBlock(codeFenceLanguage(language), solutionCode));
        return String.join("\n\n", sections);
    }

    private String buildPracticeSolution(PratiqueHintRequest request, String topic, String language) {
        String objective = firstNonEmpty(request.getObjective(), request.getInstructions());
        String solutionCode = buildSolutionCode(
                language,
                topic,
                objective,
                request.getExpectedOutput(),
                request.getInstructions(),
                request.getUserMessage()
        );
        return "Voici une solution simple en " + humanLanguage(language) + " :\n\n" +
                markdownCodeBlock(codeFenceLanguage(language), solutionCode);
    }

    private String buildSolutionCode(String language,
                                     String topic,
                                     String objective,
                                     String expectedOutput,
                                     String instructions,
                                     String userMessage) {
        String normalizedLanguage = normalizeLanguage(language);
        String objectiveText = joinContext(objective, instructions, userMessage);
        String desiredOutput = resolveDesiredOutput(expectedOutput, normalizedLanguage);
        boolean equalityExample = shouldUseEqualityExample(topic, objectiveText);

        if (equalityExample) {
            return buildEqualitySolutionCode(normalizedLanguage, desiredOutput, objectiveText);
        }

        return buildOutputSolutionCode(normalizedLanguage, desiredOutput, objectiveText);
    }

    private String buildEqualitySolutionCode(String language, String desiredOutput, String objectiveText) {
        String fallbackOutput = hasText(desiredOutput) ? desiredOutput : defaultSolutionOutput(language);
        String strictComparisonToken = normalizeLanguage(language).equals("javascript") &&
                containsAny(objectiveText.toLowerCase(Locale.ROOT), "strict", "type") ? "===" : "==";

        return switch (normalizeLanguage(language)) {
            case "python" -> """
                    a = 5
                    b = 5

                    if a == b:
                        print("%s")
                    """.formatted(escapeCodeString(fallbackOutput));
            case "java" -> """
                    public class Main {
                        public static void main(String[] args) {
                            int a = 5;
                            int b = 5;

                            if (a == b) {
                                System.out.println("%s");
                            }
                        }
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "c" -> """
                    #include <stdio.h>

                    int main(void) {
                        int a = 5;
                        int b = 5;

                        if (a == b) {
                            printf("%s\\n");
                        }

                        return 0;
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "cpp" -> """
                    #include <iostream>

                    int main() {
                        int a = 5;
                        int b = 5;

                        if (a == b) {
                            std::cout << "%s" << std::endl;
                        }

                        return 0;
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "csharp" -> """
                    using System;

                    class Program {
                        static void Main() {
                            int a = 5;
                            int b = 5;

                            if (a == b) {
                                Console.WriteLine("%s");
                            }
                        }
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "javascript" -> """
                    const a = 5;
                    const b = 5;

                    if (a %s b) {
                      console.log("%s");
                    }
                    """.formatted(strictComparisonToken, escapeCodeString(fallbackOutput));
            case "sql" -> """
                    SELECT CASE
                             WHEN 5 = 5 THEN '%s'
                             ELSE 'Different'
                           END AS resultat;
                    """.formatted(escapeSqlString(fallbackOutput));
            case "html" -> """
                    <!DOCTYPE html>
                    <html lang="fr">
                      <head>
                        <meta charset="UTF-8" />
                        <title>Solution</title>
                      </head>
                      <body>
                        <p>%s</p>
                      </body>
                    </html>
                    """.formatted(escapeHtml(fallbackOutput));
            case "css" -> buildCssSolution(objectiveText);
            default -> buildOutputSolutionCode(language, fallbackOutput, objectiveText);
        };
    }

    private String buildOutputSolutionCode(String language, String desiredOutput, String objectiveText) {
        String normalizedLanguage = normalizeLanguage(language);
        String fallbackOutput = hasText(desiredOutput) ? desiredOutput : defaultSolutionOutput(normalizedLanguage);

        return switch (normalizedLanguage) {
            case "python" -> """
                    print("%s")
                    """.formatted(escapeCodeString(fallbackOutput));
            case "java" -> """
                    public class Main {
                        public static void main(String[] args) {
                            System.out.println("%s");
                        }
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "c" -> """
                    #include <stdio.h>

                    int main(void) {
                        printf("%s\\n");
                        return 0;
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "cpp" -> """
                    #include <iostream>

                    int main() {
                        std::cout << "%s" << std::endl;
                        return 0;
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "csharp" -> """
                    using System;

                    class Program {
                        static void Main() {
                            Console.WriteLine("%s");
                        }
                    }
                    """.formatted(escapeCodeString(fallbackOutput));
            case "javascript" -> """
                    console.log("%s");
                    """.formatted(escapeCodeString(fallbackOutput));
            case "sql" -> """
                    SELECT '%s' AS resultat;
                    """.formatted(escapeSqlString(fallbackOutput));
            case "html" -> """
                    <!DOCTYPE html>
                    <html lang="fr">
                      <head>
                        <meta charset="UTF-8" />
                        <title>Solution</title>
                      </head>
                      <body>
                        <h1>%s</h1>
                      </body>
                    </html>
                    """.formatted(escapeHtml(fallbackOutput));
            case "css" -> buildCssSolution(objectiveText);
            default -> """
                    // Solution simple
                    // Adapte ensuite les noms ou les valeurs a ton exercice.
                    """;
        };
    }

    private String buildCssSolution(String objectiveText) {
        String normalizedObjective = safe(objectiveText).toLowerCase(Locale.ROOT);

        if (containsAny(normalizedObjective, "center", "centre", "centrer", "align", "flex")) {
            return """
                    .card {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 160px;
                    }
                    """;
        }

        if (containsAny(normalizedObjective, "couleur", "color", "background", "fond")) {
            return """
                    .card {
                      color: #0f172a;
                      background: #e2e8f0;
                      padding: 16px;
                      border-radius: 12px;
                    }
                    """;
        }

        return """
                .card {
                  padding: 16px;
                  border-radius: 12px;
                  background: #e2e8f0;
                  color: #0f172a;
                }
                """;
    }

    private String detectLikelyExerciseAnswer(ExerciseHintRequest request) {
        String text = joinContext(request.getQuestion(), request.getExplanation(), request.getObjective()).toLowerCase(Locale.ROOT);
        List<String> options = request.getOptions();

        if (containsAny(text, "egalit", "equal", "meme valeur", "compare")) {
            if (containsAny(text, "strict", "type") && hasOption(options, "===")) {
                return "===";
            }
            return firstMatchingOption(options, "==");
        }
        if (containsAny(text, "affect", "assign")) {
            return firstMatchingOption(options, "=");
        }
        if (containsAny(text, "different", "not equal", "inegal", "difference")) {
            return firstMatchingOption(options, "!=", "<>");
        }
        if (containsAny(text, "et logique", "and", "toutes vraies")) {
            return firstMatchingOption(options, "&&", "and");
        }
        if (containsAny(text, "ou logique", "or", "au moins une")) {
            return firstMatchingOption(options, "||", "or");
        }
        if (containsAny(text, "reste", "modulo")) {
            return firstMatchingOption(options, "%");
        }
        if (containsAny(text, "increment")) {
            return firstMatchingOption(options, "++");
        }

        return "";
    }

    private String detectCodeSpecificIssue(String code, String language, String objective, String instructions) {
        String normalizedCode = safe(code);
        String normalizedLanguage = normalizeLanguage(language);
        String objectiveText = joinContext(objective, instructions).toLowerCase(Locale.ROOT);

        if (looksLikeAssignmentInCondition(normalizedCode, normalizedLanguage)) {
            return switch (normalizedLanguage) {
                case "javascript" ->
                        "Dans ta condition, tu sembles affecter une valeur avec `=` au lieu de comparer. Utilise `==` ou `===` selon la consigne.";
                case "python" ->
                        "Dans une condition Python, utilise `==` pour comparer deux valeurs. Un simple `=` sert a l'affectation.";
                default ->
                        "Dans ta condition, tu sembles utiliser `=` au lieu de `==` pour comparer deux valeurs.";
            };
        }

        if (normalizedLanguage.equals("javascript") && containsAny(objectiveText, "strict", "type") &&
                normalizedCode.contains("==") && !normalizedCode.contains("===")) {
            return "Si la consigne attend une comparaison stricte en JavaScript, remplace `==` par `===`.";
        }

        return "";
    }

    private boolean looksLikeAssignmentInCondition(String code, String language) {
        String normalizedLanguage = normalizeLanguage(language);
        String trimmedCode = safe(code);

        if (normalizedLanguage.equals("python")) {
            return trimmedCode.matches("(?s).*\\bif\\s+[^\\n]*\\b[a-zA-Z_][a-zA-Z0-9_]*\\s*=\\s*[^=].*");
        }

        if (containsAny(normalizedLanguage, "c", "cpp", "java", "csharp", "javascript")) {
            return trimmedCode.matches("(?s).*\\bif\\s*\\([^\\)]*\\b[a-zA-Z_][a-zA-Z0-9_]*\\s*=\\s*[^=].*");
        }

        return false;
    }

    private String extractUserCode(PratiqueHintRequest request) {
        return firstNonEmpty(request.getUserCode(), request.getCurrentCode());
    }

    private String extractUserCode(ExerciseHintRequest request) {
        return safe(request.getUserCode());
    }

    private boolean hasOption(List<String> options, String target) {
        String normalizedTarget = safe(target).toLowerCase(Locale.ROOT);
        for (String option : options != null ? options : List.<String>of()) {
            if (safe(option).trim().toLowerCase(Locale.ROOT).equals(normalizedTarget)) {
                return true;
            }
        }
        return false;
    }

    private String firstMatchingOption(List<String> options, String... candidates) {
        for (String candidate : candidates) {
            for (String option : options != null ? options : List.<String>of()) {
                if (safe(option).trim().equalsIgnoreCase(candidate)) {
                    return option.trim();
                }
            }
        }
        return "";
    }

    private boolean shouldUseEqualityExample(String topic, String context) {
        return "operators".equals(topic) ||
                containsAny(safe(context).toLowerCase(Locale.ROOT), "egalit", "equal", "compare", "==");
    }

    private String resolveDesiredOutput(String expectedOutput, String language) {
        String firstLine = compactInline(firstMeaningfulLine(expectedOutput), 80);
        return hasText(firstLine) ? firstLine : defaultSolutionOutput(language);
    }

    private String defaultSolutionOutput(String language) {
        return switch (normalizeLanguage(language)) {
            case "python" -> "Hello, Python!";
            case "java" -> "Hello, Java!";
            case "c" -> "Hello, C!";
            case "cpp" -> "Hello, C++!";
            case "csharp" -> "Hello, C#!";
            case "sql" -> "Hello, SQL!";
            case "html" -> "Hello, HTML!";
            case "css" -> "Style applique";
            case "javascript" -> "Hello, JavaScript!";
            default -> "Resultat OK";
        };
    }

    private String markdownCodeBlock(String language, String code) {
        return "```" + safe(language) + "\n" + safe(code) + "\n```";
    }

    private String codeFenceLanguage(String language) {
        return switch (normalizeLanguage(language)) {
            case "csharp" -> "csharp";
            case "cpp" -> "cpp";
            case "sql" -> "sql";
            case "html" -> "html";
            case "css" -> "css";
            case "javascript" -> "javascript";
            case "java" -> "java";
            case "python" -> "python";
            case "c" -> "c";
            default -> "";
        };
    }

    private String escapeCodeString(String value) {
        return safe(value)
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "\\n");
    }

    private String escapeSqlString(String value) {
        return safe(value).replace("'", "''");
    }

    private String escapeHtml(String value) {
        return safe(value)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String joinContext(String... values) {
        StringJoiner joiner = new StringJoiner(" ");
        for (String value : values) {
            if (hasText(value)) {
                joiner.add(value.trim());
            }
        }
        return joiner.toString();
    }

    private AiHintResponse fallbackResponse(String hint, String reason) {
        return new AiHintResponse(hint, true, reason);
    }

    private String buildPracticeDebugObservation(PratiqueHintRequest request, String language) {
        String code = extractUserCode(request);
        if (!hasText(code)) {
            return "Je n'ai pas encore de code a analyser. Envoie ton code actuel ou relance une execution pour obtenir un diagnostic precis.";
        }

        String codeSpecificIssue = detectCodeSpecificIssue(code, language, request.getObjective(), request.getInstructions());
        if (hasText(codeSpecificIssue)) {
            return codeSpecificIssue;
        }

        String currentError = safe(request.getCurrentError());
        if (hasText(currentError)) {
            String firstErrorLine = compactInline(firstMeaningfulLine(currentError), 120);
            String normalizedError = currentError.toLowerCase(Locale.ROOT);

            if (containsAny(normalizedError, "syntax", "unexpected", "expected", "indent")) {
                return "Le premier blocage est une erreur de syntaxe : " + quoteInline(firstErrorLine) +
                        ". Verifie d'abord les parentheses, accolades, points-virgules ou l'indentation.";
            }

            if (containsAny(normalizedError, "not defined", "undefined", "cannot find symbol", "undeclared", "unknown")) {
                return "Ton code reference probablement un nom ou un identifiant incorrect : " +
                        quoteInline(firstErrorLine) + ". Verifie les noms de variables, fonctions et imports.";
            }

            return "L'execution signale d'abord ceci : " + quoteInline(firstErrorLine) +
                    ". Corrige ce premier message avant d'ajuster le reste.";
        }

        String output = safe(request.getConsoleOutput());
        if (!hasText(output)) {
            return buildMissingOutputGuidance(language, code);
        }

        if (hasText(request.getExpectedOutput())) {
            return "Ton code produit deja une sortie, mais elle ne correspond pas encore completement au resultat attendu.";
        }

        return "Ton code s'execute, donc le prochain gain vient surtout de l'alignement entre ton objectif et ce que le programme affiche vraiment.";
    }

    private String buildPracticeNextStep(PratiqueHintRequest request, String language) {
        if (hasText(request.getCurrentError())) {
            return "Une fois cette erreur corrigee, relance le code puis observe uniquement le premier message qui reste.";
        }

        if (!hasText(request.getConsoleOutput())) {
            return switch (normalizeLanguage(language)) {
                case "html", "css", "javascript" ->
                        "Relance l'apercu puis verifie le rendu visuel avant de modifier une seule chose a la fois.";
                case "sql" ->
                        "Relance la requete finale et verifie qu'elle affiche bien les colonnes et les lignes attendues.";
                default ->
                        "Ajoute ou corrige l'instruction qui affiche le resultat, puis relance avant de valider.";
            };
        }

        return "Modifie une seule partie du code, relance, puis verifie si la sortie se rapproche reellement de l'attendu.";
    }

    private String buildMissingOutputGuidance(String language, String currentCode) {
        String normalizedLanguage = normalizeLanguage(language);
        String code = safe(currentCode).toLowerCase(Locale.ROOT);

        return switch (normalizedLanguage) {
            case "python" -> code.contains("print(")
                    ? "Ton script contient deja print(), donc verifie plutot si la condition ou les valeurs calculees sont correctes."
                    : "Si rien ne s'affiche encore, commence par verifier que tu utilises bien print() pour montrer le resultat.";
            case "java" -> code.contains("system.out.print")
                    ? "Java execute sans afficher le resultat attendu pour l'instant. Revois la logique ou la valeur envoyee a System.out.println."
                    : "Si rien ne s'affiche, verifie d'abord que ton programme passe par main et utilise System.out.println().";
            case "c" -> code.contains("printf(")
                    ? "Ton programme contient deja printf(), donc le probleme vient peut-etre du texte affiche ou des retours a la ligne."
                    : "Si rien ne s'affiche, pense a utiliser printf() dans main pour produire la sortie attendue.";
            case "cpp" -> code.contains("cout")
                    ? "Le code utilise deja cout, donc compare maintenant la valeur affichee avec ce qui est demande."
                    : "Si rien ne s'affiche, verifie que tu envoies bien le resultat vers std::cout.";
            case "csharp" -> code.contains("console.write")
                    ? "Le code ecrit deja dans la console, donc verifie maintenant la logique et le texte reellement envoye."
                    : "Si rien ne s'affiche, verifie que tu utilises Console.WriteLine() ou Console.Write().";
            case "sql" -> containsAny(code, "select ", "show ", "with ")
                    ? "La requete existe deja, donc verifie surtout le filtre, l'ordre ou les colonnes retournees."
                    : "Si aucun resultat n'apparait, assure-toi que ta derniere instruction est bien une requete SELECT exploitable.";
            case "html", "css", "javascript" ->
                    "Le rendu depend du HTML, du CSS et du JavaScript actifs au moment ou tu relances l'apercu. Verifie d'abord la partie que tu modifies.";
            default -> "Si rien ne s'affiche, commence par verifier l'instruction qui doit produire la sortie ou le rendu.";
        };
    }

    private String buildTopicHint(String topic, String language) {
        return switch (topic) {
            case "operators" ->
                    "Distingue bien les symboles qui calculent, ceux qui comparent et ceux qui combinent plusieurs conditions.";
            case "conditions" ->
                    "Commence par identifier la condition exacte a tester, puis verifie quel bloc doit s'executer quand elle est vraie ou fausse.";
            case "loops" ->
                    "Repere d'abord combien de tours la boucle doit faire et a quel moment elle doit s'arreter.";
            case "functions" ->
                    "Verifie le nom de la fonction, ses parametres et surtout ce qu'elle doit renvoyer ou afficher.";
            case "variables" ->
                    "Controle le type utilise, la valeur stockee et le moment ou cette valeur est modifiee dans le code.";
            case "collections" ->
                    "Repere la structure de donnees adaptee, puis verifie comment tu parcours ou recuperes chaque element.";
            case "strings" ->
                    "Observe bien les caracteres exacts, les espaces et les retours a la ligne : une petite difference suffit a fausser le resultat.";
            case "memory" ->
                    "Verifie toujours si tu manipules une valeur, une adresse ou une reference avant de modifier le code.";
            case "oop" ->
                    "Demande-toi d'abord quel objet porte la responsabilite du comportement attendu et quelle methode doit etre appelee.";
            case "exceptions" ->
                    "Lis le premier message d'erreur avant tout : il pointe souvent la vraie cause a corriger en premier.";
            case "files" ->
                    "Verifie d'abord si la ressource est bien ouverte ou lue, puis controle ce qui est ecrit ou retourne.";
            case "sql" ->
                    "Isole la clause qui change vraiment le resultat, par exemple SELECT, WHERE, JOIN, GROUP BY ou ORDER BY.";
            case "html" ->
                    "Observe la structure du document avant le style : les bonnes balises facilitent ensuite tout le reste.";
            case "css" ->
                    "Regarde d'abord quel selecteur cible l'element puis quelle propriete visuelle doit changer.";
            case "javascript" ->
                    "Verifie d'abord l'element, la valeur ou l'evenement que ton script manipule reellement.";
            default ->
                    "Fais une seule modification a la fois, puis relance pour voir exactement ce qui change.";
        };
    }

    private String buildConceptExplanation(String topic, String language) {
        return switch (topic) {
            case "operators" ->
                    "En " + humanLanguage(language) + ", les operateurs servent soit a calculer, soit a comparer, soit a combiner des conditions logiques.";
            case "conditions" ->
                    "Une condition sert a choisir quel chemin d'execution suivre selon qu'un test est vrai ou faux.";
            case "loops" ->
                    "Une boucle repete un bloc de code tant qu'une condition reste valide ou pendant un nombre de tours defini.";
            case "functions" ->
                    "Une fonction encapsule une action reusable avec des parametres d'entree et parfois une valeur de retour.";
            case "variables" ->
                    "Une variable associe un nom a une valeur, et son type ou sa forme determine comment elle peut etre utilisee.";
            case "collections" ->
                    "Les collections servent a stocker plusieurs valeurs puis a les parcourir, filtrer ou modifier selon leur structure.";
            case "strings" ->
                    "Une chaine de caracteres est une sequence de texte : la moindre difference de casse, d'espace ou de ponctuation compte.";
            case "memory" ->
                    "Les pointeurs, references ou adresses servent a manipuler l'emplacement d'une valeur, pas seulement son contenu.";
            case "oop" ->
                    "La programmation objet organise le code autour d'objets, de responsabilites et de comportements exposes par des methodes.";
            case "exceptions" ->
                    "Une exception signale qu'un traitement n'a pas pu aller jusqu'au bout normalement et doit etre gere ou remonte.";
            case "files" ->
                    "Les operations sur fichier suivent souvent trois etapes : ouvrir la ressource, lire ou ecrire, puis fermer proprement.";
            case "sql" ->
                    "En SQL, chaque clause a un role precis : selectionner, filtrer, joindre, regrouper ou trier les donnees.";
            case "html" ->
                    "HTML decrit la structure et le sens du contenu affiche dans la page.";
            case "css" ->
                    "CSS controle la presentation visuelle des elements deja presents dans le document.";
            case "javascript" ->
                    "JavaScript ajoute de la logique, manipule le DOM et reagit aux evenements ou aux donnees.";
            default ->
                    "Le plus important ici est de relier l'objectif de la lecon a ce que ton code affiche ou modifie vraiment.";
        };
    }

    private String describeSelectionCheck(String selectedAnswer, String language) {
        String meaning = describeOptionMeaning(selectedAnswer, language);
        return "Demande-toi si cette option sert vraiment a " + meaning +
                " ou si elle correspond plutot a une autre operation.";
    }

    private String describeOptionMeaning(String option, String language) {
        String normalized = safe(option).trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "=" -> normalizeLanguage(language).equals("sql")
                    ? "tester l'egalite dans une condition SQL"
                    : "affecter une valeur";
            case "==" -> "comparer deux valeurs pour tester leur egalite";
            case "===" -> "comparer la valeur et le type";
            case "!=" -> "tester une difference";
            case "<", ">", "<=", ">=" -> "comparer un ordre entre deux valeurs";
            case "&&", "and" -> "combiner deux conditions avec un ET logique";
            case "||", "or" -> "combiner deux conditions avec un OU logique";
            case "!" -> "nier une condition";
            case "++" -> "incrementer une valeur";
            case "%" -> "calculer le reste d'une division";
            case "like" -> "tester un motif de texte";
            default -> "un comportement precis qu'il faut relier a l'enonce";
        };
    }

    private String detectTopic(String... values) {
        StringJoiner joiner = new StringJoiner(" ");
        for (String value : values) {
            if (hasText(value)) {
                joiner.add(value.toLowerCase(Locale.ROOT));
            }
        }
        String text = joiner.toString();

        if (containsAny(text, "operateur", "operator", "egalit", "comparison", "arithmet", "logique")) {
            return "operators";
        }
        if (containsAny(text, "condition", "if", "switch", "case", "ternaire", "elif", "else")) {
            return "conditions";
        }
        if (containsAny(text, "boucle", "loop", "for", "while", "iteration", "range")) {
            return "loops";
        }
        if (containsAny(text, "fonction", "function", "method", "methode", "param", "return")) {
            return "functions";
        }
        if (containsAny(text, "variable", "type", "declar", "cast", "affect")) {
            return "variables";
        }
        if (containsAny(text, "tableau", "array", "liste", "list", "vector", "tuple", "set", "dict", "collection")) {
            return "collections";
        }
        if (containsAny(text, "chaine", "string", "texte", "caract")) {
            return "strings";
        }
        if (containsAny(text, "pointeur", "pointer", "reference", "memoire", "memory")) {
            return "memory";
        }
        if (containsAny(text, "classe", "class", "objet", "object", "herit", "interface", "polymorph", "encapsulation", "oop")) {
            return "oop";
        }
        if (containsAny(text, "exception", "erreur", "debug", "try", "catch", "finally")) {
            return "exceptions";
        }
        if (containsAny(text, "fichier", "file", "read", "write", "io")) {
            return "files";
        }
        if (containsAny(text, "sql", "mysql", "select", "where", "join", "group by", "having", "database", "requete")) {
            return "sql";
        }
        if (containsAny(text, "html", "balise", "formulaire", "semant", "accessibil")) {
            return "html";
        }
        if (containsAny(text, "css", "flex", "grid", "selecteur", "style", "layout")) {
            return "css";
        }
        if (containsAny(text, "javascript", "dom", "event", "async", "fetch", "json")) {
            return "javascript";
        }
        return "generic";
    }

    private String resolveIntent(String explicitIntent, String userMessage, String fallbackIntent) {
        String normalizedIntent = safe(explicitIntent).toLowerCase(Locale.ROOT);
        if (normalizedIntent.equals("hint") || normalizedIntent.equals("explain") ||
                normalizedIntent.equals("debug") || normalizedIntent.equals("solution")) {
            return normalizedIntent;
        }

        String normalizedMessage = safe(userMessage).toLowerCase(Locale.ROOT);
        if (containsAny(normalizedMessage, "pourquoi", "debug", "erreur", "marche pas", "corrige", "bug")) {
            return "debug";
        }
        if (containsAny(normalizedMessage, "explique", "concept", "signifie", "pourquoi on utilise")) {
            return "explain";
        }
        if (containsAny(normalizedMessage, "indice", "hint")) {
            return "hint";
        }
        if (containsAny(normalizedMessage, "code", "solution", "donne moi", "donne-moi", "montre moi", "montre-moi")) {
            return "solution";
        }
        return fallbackIntent;
    }

    private String formatOptions(List<String> options) {
        List<String> safeOptions = options != null ? options : List.of();
        StringJoiner joiner = new StringJoiner(", ");
        for (int index = 0; index < safeOptions.size(); index++) {
            char label = (char) ('A' + index);
            joiner.add(label + ": " + sanitizeInline(safeOptions.get(index)));
        }
        return joiner.toString();
    }

    private String joinAdvice(List<String> lines) {
        LinkedHashSet<String> unique = new LinkedHashSet<>();
        for (String line : lines) {
            String cleaned = safe(line);
            if (hasText(cleaned)) {
                unique.add(cleaned);
            }
            if (unique.size() >= 3) {
                break;
            }
        }
        return String.join(" ", unique);
    }

    private String humanLanguage(String language) {
        return switch (normalizeLanguage(language)) {
            case "python" -> "Python";
            case "java" -> "Java";
            case "c" -> "C";
            case "cpp" -> "C++";
            case "csharp" -> "C#";
            case "sql" -> "SQL";
            case "html" -> "HTML";
            case "css" -> "CSS";
            case "javascript" -> "JavaScript";
            default -> "ce langage";
        };
    }

    private String normalizeLanguage(String language) {
        String normalized = safe(language).toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "js" -> "javascript";
            case "mysql" -> "sql";
            case "c#" -> "csharp";
            case "c++" -> "cpp";
            default -> normalized;
        };
    }

    private String compactInline(String value, int maxLength) {
        String compact = sanitizeInline(value);
        if (compact.length() <= maxLength) {
            return compact;
        }
        return compact.substring(0, Math.max(0, maxLength - 3)).trim() + "...";
    }

    private String firstMeaningfulLine(String value) {
        for (String line : safe(value).split("\\R")) {
            if (hasText(line)) {
                return line.trim();
            }
        }
        return "";
    }

    private String firstNonEmpty(String first, String second) {
        return hasText(first) ? first.trim() : safe(second);
    }

    private String fallbackStudentMessage(String userMessage) {
        return defaultIfBlank(userMessage, "Je suis bloque");
    }

    private String defaultIfBlank(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String sanitizeInline(String value) {
        return safe(value).replace("\r", " ").replace("\n", " ").replaceAll("\\s+", " ").trim();
    }

    private String sanitizeMultiline(String value) {
        return value == null ? "" : value.trim();
    }

    private String quoteInline(String value) {
        return "\"" + sanitizeInline(value) + "\"";
    }

    private boolean containsAny(String value, String... needles) {
        String haystack = safe(value);
        for (String needle : needles) {
            if (haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
