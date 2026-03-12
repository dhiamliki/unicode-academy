package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CodeRunRequest;
import com.unicodeacademy.backend.dto.CodeRunResponse;
import com.unicodeacademy.backend.service.CodeExecutionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    public CodeExecutionController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/run")
    public CodeRunResponse runCode(@Valid @RequestBody CodeRunRequest request) {
        return codeExecutionService.execute(request);
    }
}
