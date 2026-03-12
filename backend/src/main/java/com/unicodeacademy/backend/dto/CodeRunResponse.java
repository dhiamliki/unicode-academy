package com.unicodeacademy.backend.dto;

public class CodeRunResponse {

    private boolean success;
    private String language;
    private String stdout;
    private String stderr;
    private String compileOutput;
    private boolean timedOut;
    private Integer exitCode;

    public CodeRunResponse() {
    }

    public CodeRunResponse(boolean success,
                           String language,
                           String stdout,
                           String stderr,
                           String compileOutput,
                           boolean timedOut,
                           Integer exitCode) {
        this.success = success;
        this.language = language;
        this.stdout = stdout;
        this.stderr = stderr;
        this.compileOutput = compileOutput;
        this.timedOut = timedOut;
        this.exitCode = exitCode;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public String getCompileOutput() {
        return compileOutput;
    }

    public void setCompileOutput(String compileOutput) {
        this.compileOutput = compileOutput;
    }

    public boolean isTimedOut() {
        return timedOut;
    }

    public void setTimedOut(boolean timedOut) {
        this.timedOut = timedOut;
    }

    public Integer getExitCode() {
        return exitCode;
    }

    public void setExitCode(Integer exitCode) {
        this.exitCode = exitCode;
    }
}
