package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.CodeRunRequest;
import com.unicodeacademy.backend.dto.CodeRunResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.SQLTimeoutException;
import java.sql.Statement;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

 @Service
 public class CodeExecutionService {

     /**
      * Local code execution engine for the UniCode Academy practice module.
      *
      * <p><strong>Scope (student demo):</strong>
      * This service runs user code directly on the server JVM in a best-effort sandbox.
      * It is designed for educational demonstrations on a local machine, not for multi-tenant
      * production use. It supports a limited set of languages and applies basic safety checks.
      *
      * <p><strong>Supported languages:</strong> Python, Java, C, C++, C#, SQL. HTML/CSS/JavaScript
      * are handled via client-side iframe preview and are not executed server-side.
      *
      * <p><strong>Safety controls:</strong>
      * <ul>
      *   <li>Process timeout (configurable, default 6s)</li>
      *   <li>Output capture limit (default 64 KiB)</li>
      *   <li>Code length limit (default 20 000 chars)</li>
      *   <li>SQL statement allow-list (prefixes) and forbidden-pattern block-list</li>
      *   <li>Working directory isolated per execution and deleted afterwards</li>
      * </ul>
      *
      * <p><strong>Limitations (honest for defense):</strong>
      * <ul>
      *   <li>No containerization or OS-level sandbox (code runs as the server process user).</li>
      *   <li>No resource quotas beyond timeout and output size (CPU/memory uncontrolled).</li>
      *   <li>SQL uses an in-memory H2 database in MySQL mode; not a full RDBMS.</li>
      *   <li>Web languages execute client-side only; server does not render them.</li>
      *   <li>File system access is not permitted (code cannot read/write outside its temp dir).</li>
      * </ul>
      *
      * <p>Any execution error returns a structured {@link CodeRunResponse} with error details.
      */
     private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);

    private static final Set<String> SUPPORTED_LANGUAGES = Set.of(
            "python", "java", "c", "cpp", "csharp", "sql", "html", "css", "javascript"
    );
    private static final Set<String> WEB_LANGUAGES = Set.of("html", "css", "javascript");
    private static final Set<String> ALLOWED_SQL_PREFIXES = Set.of(
            "select", "insert", "update", "delete", "create", "alter", "drop", "truncate",
            "with", "show", "describe", "desc", "set"
    );
    private static final Pattern FORBIDDEN_SQL_PATTERN = Pattern.compile(
            "(?i)\\b(create\\s+alias|runscript|script|csvread|csvwrite|file_read|file_write|link_schema|drop\\s+all\\s+objects)\\b"
    );
    private static final Pattern ANY_MAIN_PATTERN = Pattern.compile("(?i)\\bmain\\s*\\(");
    private static final Pattern JAVA_PUBLIC_MAIN_PATTERN = Pattern.compile("(?i)\\bpublic\\s+static\\s+void\\s+main\\s*\\(");
    private static final Pattern CSHARP_MAIN_PATTERN = Pattern.compile("(?i)\\bstatic\\s+void\\s+Main\\s*\\(");
    private static final Pattern JAVA_CLASS_PATTERN = Pattern.compile("\\bpublic\\s+class\\s+([A-Za-z_][A-Za-z0-9_]*)");
    private static final Pattern JAVA_FALLBACK_CLASS_PATTERN = Pattern.compile("\\bclass\\s+([A-Za-z_][A-Za-z0-9_]*)");

    private final Duration executionTimeout;
    private final int maxOutputBytes;
    private final int maxCodeLength;
    private final int maxSqlRows;
    private final boolean isWindows;

    public CodeExecutionService(
            @Value("${app.code.execution.timeout-ms:6000}") long timeoutMs,
            @Value("${app.code.execution.max-output-bytes:65536}") int maxOutputBytes,
            @Value("${app.code.execution.max-code-length:20000}") int maxCodeLength,
            @Value("${app.code.execution.max-sql-rows:60}") int maxSqlRows
    ) {
        this.executionTimeout = Duration.ofMillis(Math.max(1000, timeoutMs));
        this.maxOutputBytes = Math.max(4096, maxOutputBytes);
        this.maxCodeLength = Math.max(1000, maxCodeLength);
        this.maxSqlRows = Math.max(10, maxSqlRows);
        this.isWindows = System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win");
    }

    public CodeRunResponse execute(CodeRunRequest request) {
        String language = normalizeLanguage(request.getLanguage());
        String code = request.getCode() == null ? "" : request.getCode();
        String stdin = safeNullable(request.getStdin());

        if (!SUPPORTED_LANGUAGES.contains(language)) {
            throw new IllegalArgumentException("Langage non supporte: " + language);
        }

        if (code.length() > maxCodeLength) {
            throw new IllegalArgumentException("Le code depasse la taille maximale autorisee (" + maxCodeLength + " caracteres)");
        }

        if (WEB_LANGUAGES.contains(language)) {
            throw new IllegalArgumentException("HTML/CSS/JavaScript sont executes cote client avec l'aperçu iframe sandbox");
        }

        if ("sql".equals(language)) {
            return executeSql(code);
        }

        Path workspace = null;
        try {
            workspace = Files.createTempDirectory("unicode-exec-");

            return switch (language) {
                case "python" -> executePython(workspace, code, stdin);
                case "java" -> executeJava(workspace, code, stdin);
                case "c" -> executeC(workspace, code, stdin);
                case "cpp" -> executeCpp(workspace, code, stdin);
                case "csharp" -> executeCsharp(workspace, code, stdin);
                default -> throw new IllegalArgumentException("Langage non supporte: " + language);
            };
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Execution interrompue", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Erreur lors de l'execution du code", ex);
        } finally {
            deleteDirectoryQuietly(workspace);
        }
    }

    private CodeRunResponse executePython(Path workspace, String code, String stdin) throws IOException, InterruptedException {
        Files.writeString(workspace.resolve("main.py"), code, StandardCharsets.UTF_8);

        CommandResult runResult = runFirstAvailable(
                workspace,
                List.of(
                        List.of("python3", "main.py"),
                        List.of("python", "main.py"),
                        List.of("py", "-3", "main.py")
                ),
                stdin,
                executionTimeout,
                "Python introuvable. Installez Python 3 et ajoutez python/python3 au PATH."
        );

        return buildRuntimeResponse("python", "", runResult);
    }

    private CodeRunResponse executeJava(Path workspace, String code, String stdin) throws IOException, InterruptedException {
        PreparedJavaSource preparedJavaSource = prepareJavaSource(code);
        String className = preparedJavaSource.className();
        Path sourceFile = workspace.resolve(className + ".java");
        Files.writeString(sourceFile, preparedJavaSource.code(), StandardCharsets.UTF_8);

        CommandResult compileResult = runFirstAvailable(
                workspace,
                List.of(List.of("javac", sourceFile.getFileName().toString())),
                null,
                executionTimeout,
                "JDK introuvable. Installez Java JDK (javac + java) et ajoutez-le au PATH."
        );
        String compileOutput = mergeStreams(compileResult);

        if (!compileResult.successful()) {
            return buildFailureFromCompile("java", compileResult, compileOutput);
        }

        CommandResult runResult = runFirstAvailable(
                workspace,
                List.of(List.of("java", "-Xmx128m", "-cp", workspace.toAbsolutePath().toString(), className)),
                stdin,
                executionTimeout,
                "Runtime Java introuvable. Verifiez que `java` est accessible dans le PATH."
        );

        return buildRuntimeResponse("java", compileOutput, runResult);
    }

    private CodeRunResponse executeC(Path workspace, String code, String stdin) throws IOException, InterruptedException {
        String sourceName = "main.c";
        String binaryName = isWindows ? "main.exe" : "main";
        String preparedCode = prepareCSource(code);
        Files.writeString(workspace.resolve(sourceName), preparedCode, StandardCharsets.UTF_8);

        CommandResult compileResult = runFirstAvailable(
                workspace,
                List.of(
                        List.of("gcc", sourceName, "-O0", "-std=c11", "-o", binaryName),
                        List.of("clang", sourceName, "-O0", "-std=c11", "-o", binaryName)
                ),
                null,
                executionTimeout,
                "Compilateur C introuvable. Installez gcc ou clang et ajoutez-le au PATH."
        );
        String compileOutput = mergeStreams(compileResult);

        if (!compileResult.successful()) {
            return buildFailureFromCompile("c", compileResult, compileOutput);
        }

        CommandResult runResult = runCommand(
                workspace,
                List.of(workspace.resolve(binaryName).toString()),
                stdin,
                executionTimeout
        );
        return buildRuntimeResponse("c", compileOutput, runResult);
    }

    private CodeRunResponse executeCpp(Path workspace, String code, String stdin) throws IOException, InterruptedException {
        String sourceName = "main.cpp";
        String binaryName = isWindows ? "main.exe" : "main";
        String preparedCode = prepareCppSource(code);
        Files.writeString(workspace.resolve(sourceName), preparedCode, StandardCharsets.UTF_8);

        CommandResult compileResult = runFirstAvailable(
                workspace,
                List.of(
                        List.of("g++", sourceName, "-O0", "-std=c++17", "-o", binaryName),
                        List.of("clang++", sourceName, "-O0", "-std=c++17", "-o", binaryName)
                ),
                null,
                executionTimeout,
                "Compilateur C++ introuvable. Installez g++ ou clang++ et ajoutez-le au PATH."
        );
        String compileOutput = mergeStreams(compileResult);

        if (!compileResult.successful()) {
            return buildFailureFromCompile("cpp", compileResult, compileOutput);
        }

        CommandResult runResult = runCommand(
                workspace,
                List.of(workspace.resolve(binaryName).toString()),
                stdin,
                executionTimeout
        );
        return buildRuntimeResponse("cpp", compileOutput, runResult);
    }

    private CodeRunResponse executeCsharp(Path workspace, String code, String stdin) throws IOException, InterruptedException {
        String preparedCode = prepareCsharpSource(code);
        Files.writeString(workspace.resolve("Program.cs"), preparedCode, StandardCharsets.UTF_8);

        // Option 1: dotnet SDK build + run
        Files.writeString(workspace.resolve("Runner.csproj"), """
                <Project Sdk="Microsoft.NET.Sdk">
                  <PropertyGroup>
                    <OutputType>Exe</OutputType>
                    <TargetFramework>net8.0</TargetFramework>
                    <ImplicitUsings>enable</ImplicitUsings>
                    <Nullable>disable</Nullable>
                  </PropertyGroup>
                </Project>
                """, StandardCharsets.UTF_8);

        CommandResult dotnetCompileResult = runFirstAvailable(
                workspace,
                List.of(List.of("dotnet", "build", "Runner.csproj", "-c", "Release", "-nologo", "-v", "q")),
                null,
                executionTimeout,
                ""
        );

        if (!dotnetCompileResult.missingExecutable()) {
            String compileOutput = mergeStreams(dotnetCompileResult);

            if (!dotnetCompileResult.successful()) {
                return buildFailureFromCompile("csharp", dotnetCompileResult, compileOutput);
            }

            Path builtDll = findBuiltDotnetDll(workspace);
            if (builtDll == null) {
                return new CodeRunResponse(
                        false,
                        "csharp",
                        "",
                        "Compilation C# terminee mais assembly introuvable (Runner.dll).",
                        compileOutput,
                        false,
                        1
                );
            }

            CommandResult runResult = runFirstAvailable(
                    workspace,
                    List.of(List.of("dotnet", builtDll.toString())),
                    stdin,
                    executionTimeout,
                    "Runtime dotnet introuvable. Installez le runtime .NET."
            );
            return buildRuntimeResponse("csharp", compileOutput, runResult);
        }

        // Option 2: csc / mcs fallback
        CommandResult compileResult = runFirstAvailable(
                workspace,
                List.of(
                        List.of("csc", "/nologo", "Program.cs", "/out:Program.exe"),
                        List.of("mcs", "-out:Program.exe", "Program.cs")
                ),
                null,
                executionTimeout,
                "C# non disponible. Installez .NET SDK (dotnet) ou csc/mcs."
        );
        String compileOutput = mergeStreams(compileResult);

        if (!compileResult.successful()) {
            return buildFailureFromCompile("csharp", compileResult, compileOutput);
        }

        List<List<String>> runCommands = new ArrayList<>();
        if (isWindows) {
            runCommands.add(List.of(workspace.resolve("Program.exe").toString()));
        } else {
            runCommands.add(List.of("mono", workspace.resolve("Program.exe").toString()));
        }

        CommandResult runResult = runFirstAvailable(
                workspace,
                runCommands,
                stdin,
                executionTimeout,
                isWindows
                        ? "Execution C# impossible (Program.exe non executable)."
                        : "Execution C# necessite mono (ou utilisez dotnet SDK)."
        );
        return buildRuntimeResponse("csharp", compileOutput, runResult);
    }

    private CodeRunResponse executeSql(String code) {
        List<String> statements = splitSqlStatements(code);
        if (statements.isEmpty()) {
            throw new IllegalArgumentException("Aucune requete SQL detectee");
        }
        if (statements.size() > 25) {
            throw new IllegalArgumentException("Trop de requetes SQL dans une seule execution (max 25)");
        }

        String dbName = "unicode_run_" + UUID.randomUUID().toString().replace("-", "");
        String jdbcUrl = "jdbc:h2:mem:" + dbName + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";

        StringBuilder stdout = new StringBuilder();

        try (Connection connection = DriverManager.getConnection(jdbcUrl, "sa", "")) {
            connection.setAutoCommit(true);

            for (int index = 0; index < statements.size(); index++) {
                String statementText = statements.get(index).trim();
                ensureSafeSql(statementText);

                try (Statement statement = connection.createStatement()) {
                    statement.setQueryTimeout((int) Math.max(1, executionTimeout.toSeconds()));

                    boolean hasResultSet = statement.execute(statementText);
                    if (hasResultSet) {
                        try (ResultSet resultSet = statement.getResultSet()) {
                            appendResultSet(stdout, index + 1, resultSet);
                        }
                    } else {
                        stdout.append("Statement #")
                                .append(index + 1)
                                .append(": ")
                                .append(Math.max(statement.getUpdateCount(), 0))
                                .append(" row(s) affected")
                                .append(System.lineSeparator())
                                .append(System.lineSeparator());
                    }
                }
            }

            return new CodeRunResponse(
                    true,
                    "sql",
                    stdout.toString(),
                    "",
                    "",
                    false,
                    0
            );
        } catch (SQLTimeoutException timeoutException) {
            return new CodeRunResponse(
                    false,
                    "sql",
                    stdout.toString(),
                    "Execution SQL interrompue (timeout).",
                    "",
                    true,
                    124
            );
        } catch (SQLException sqlException) {
            String errorMessage = sqlException.getMessage() != null
                    ? sqlException.getMessage()
                    : "Erreur SQL";
            return new CodeRunResponse(
                    false,
                    "sql",
                    stdout.toString(),
                    errorMessage,
                    "",
                    false,
                    1
            );
        }
    }

    private CommandResult runFirstAvailable(Path workspace,
                                            List<List<String>> commands,
                                            String stdin,
                                            Duration timeout,
                                            String missingExecutableMessage) throws IOException, InterruptedException {
        IOException lastMissingExecutableError = null;

        for (List<String> command : commands) {
            try {
                return runCommand(workspace, command, stdin, timeout);
            } catch (IOException ioException) {
                if (isMissingExecutable(ioException)) {
                    lastMissingExecutableError = ioException;
                    continue;
                }
                throw ioException;
            }
        }

        String message = missingExecutableMessage;
        if ((message == null || message.isBlank()) && lastMissingExecutableError != null) {
            message = "Executable introuvable: " + lastMissingExecutableError.getMessage();
        }
        if (message == null || message.isBlank()) {
            message = "Executable introuvable.";
        }

        return CommandResult.missingExecutable(message);
    }

    private CommandResult runCommand(Path workspace,
                                     List<String> command,
                                     String stdin,
                                     Duration timeout) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(workspace.toFile());
        processBuilder.redirectErrorStream(false);
        processBuilder.environment().put("PYTHONUNBUFFERED", "1");
        processBuilder.environment().put("DOTNET_CLI_TELEMETRY_OPTOUT", "1");
        processBuilder.environment().put("DOTNET_NOLOGO", "1");

        Process process = processBuilder.start();

        try (var stdinStream = process.getOutputStream()) {
            if (stdin != null && !stdin.isBlank()) {
                stdinStream.write(stdin.getBytes(StandardCharsets.UTF_8));
            }
        }

        StreamCollector stdoutCollector = new StreamCollector(process.getInputStream(), maxOutputBytes);
        StreamCollector stderrCollector = new StreamCollector(process.getErrorStream(), maxOutputBytes);

        Thread stdoutThread = new Thread(stdoutCollector, "code-run-stdout");
        Thread stderrThread = new Thread(stderrCollector, "code-run-stderr");
        stdoutThread.start();
        stderrThread.start();

        boolean finished = process.waitFor(timeout.toMillis(), java.util.concurrent.TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
            process.waitFor(500, java.util.concurrent.TimeUnit.MILLISECONDS);
        }

        stdoutThread.join(500);
        stderrThread.join(500);

        int exitCode = finished ? process.exitValue() : 124;
        return new CommandResult(
                stdoutCollector.content(),
                stderrCollector.content(),
                exitCode,
                !finished,
                false
        );
    }

    private CodeRunResponse buildFailureFromCompile(String language, CommandResult compileResult, String compileOutput) {
        String stderr = compileResult.missingExecutable()
                ? compileResult.stderr()
                : "";

        if (compileResult.timedOut()) {
            stderr = appendLine(stderr, "Compilation interrompue (timeout).");
        }

        return new CodeRunResponse(
                false,
                language,
                "",
                stderr,
                compileOutput,
                compileResult.timedOut(),
                compileResult.exitCode()
        );
    }

    private CodeRunResponse buildRuntimeResponse(String language, String compileOutput, CommandResult runResult) {
        String stderr = runResult.stderr();
        if (runResult.timedOut()) {
            stderr = appendLine(stderr, "Execution interrompue (timeout).");
        }

        boolean success = runResult.successful() && !runResult.missingExecutable();
        if (runResult.missingExecutable()) {
            success = false;
        }

        return new CodeRunResponse(
                success,
                language,
                runResult.stdout(),
                stderr,
                compileOutput,
                runResult.timedOut(),
                runResult.exitCode()
        );
    }

    private void ensureSafeSql(String statement) {
        String trimmed = statement.trim();
        if (trimmed.isBlank()) {
            throw new IllegalArgumentException("Requete SQL vide");
        }

        Matcher forbiddenMatcher = FORBIDDEN_SQL_PATTERN.matcher(trimmed);
        if (forbiddenMatcher.find()) {
            throw new IllegalArgumentException("Instruction SQL non autorisee dans le sandbox");
        }

        String firstToken = trimmed.split("\\s+", 2)[0].toLowerCase(Locale.ROOT);
        if (!ALLOWED_SQL_PREFIXES.contains(firstToken)) {
            throw new IllegalArgumentException("Type de requete SQL non autorise: " + firstToken);
        }
    }

    private List<String> splitSqlStatements(String sql) {
        List<String> statements = new ArrayList<>();
        if (sql == null || sql.isBlank()) {
            return statements;
        }

        StringBuilder current = new StringBuilder();
        boolean inSingleQuote = false;
        boolean inDoubleQuote = false;

        for (int i = 0; i < sql.length(); i++) {
            char ch = sql.charAt(i);

            if (ch == '\'' && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
            } else if (ch == '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
            }

            if (ch == ';' && !inSingleQuote && !inDoubleQuote) {
                addSqlStatement(statements, current.toString());
                current.setLength(0);
                continue;
            }

            current.append(ch);
        }

        addSqlStatement(statements, current.toString());
        return statements;
    }

    private void addSqlStatement(List<String> statements, String statement) {
        String trimmed = statement.trim();
        if (!trimmed.isBlank()) {
            statements.add(trimmed);
        }
    }

    private void appendResultSet(StringBuilder out, int index, ResultSet resultSet) throws SQLException {
        ResultSetMetaData metadata = resultSet.getMetaData();
        int columnCount = metadata.getColumnCount();

        out.append("Result #").append(index).append(System.lineSeparator());

        List<String> headers = new ArrayList<>();
        for (int col = 1; col <= columnCount; col++) {
            headers.add(metadata.getColumnLabel(col));
        }
        out.append(String.join(" | ", headers)).append(System.lineSeparator());

        int rowCount = 0;
        while (resultSet.next()) {
            if (rowCount >= maxSqlRows) {
                out.append("... output truncated after ").append(maxSqlRows).append(" rows")
                        .append(System.lineSeparator());
                break;
            }

            List<String> values = new ArrayList<>();
            for (int col = 1; col <= columnCount; col++) {
                Object value = resultSet.getObject(col);
                values.add(formatCell(value));
            }
            out.append(String.join(" | ", values)).append(System.lineSeparator());
            rowCount++;
        }

        if (rowCount == 0) {
            out.append("(no rows)").append(System.lineSeparator());
        }

        out.append(System.lineSeparator());
    }

    private String formatCell(Object value) {
        if (value == null) {
            return "NULL";
        }

        String text = String.valueOf(value).replace('\n', ' ').replace('\r', ' ');
        if (text.length() > 120) {
            return text.substring(0, 117) + "...";
        }
        return text;
    }

    private String prepareCSource(String code) {
        if (containsMainEntryPoint(code)) {
            return code;
        }

        logWrapperApplied("c");
        String userCode = indentCodeInsideBlock(code, 4);
        StringBuilder wrapped = new StringBuilder();
        wrapped.append("#include <stdio.h>").append(System.lineSeparator())
                .append(System.lineSeparator())
                .append("int main() {").append(System.lineSeparator());
        if (!userCode.isBlank()) {
            wrapped.append(userCode).append(System.lineSeparator());
        }
        wrapped.append("    return 0;").append(System.lineSeparator())
                .append("}").append(System.lineSeparator());
        return wrapped.toString();
    }

    private String prepareCppSource(String code) {
        if (containsMainEntryPoint(code)) {
            return code;
        }

        logWrapperApplied("cpp");
        String userCode = indentCodeInsideBlock(code, 4);
        StringBuilder wrapped = new StringBuilder();
        wrapped.append("#include <iostream>").append(System.lineSeparator())
                .append("using namespace std;").append(System.lineSeparator())
                .append(System.lineSeparator())
                .append("int main() {").append(System.lineSeparator());
        if (!userCode.isBlank()) {
            wrapped.append(userCode).append(System.lineSeparator());
        }
        wrapped.append("    return 0;").append(System.lineSeparator())
                .append("}").append(System.lineSeparator());
        return wrapped.toString();
    }

    private PreparedJavaSource prepareJavaSource(String code) {
        if (hasJavaClassDefinition(code) || hasJavaMainEntryPoint(code) || containsMainEntryPoint(code)) {
            return new PreparedJavaSource(resolveJavaClassName(code), code);
        }

        logWrapperApplied("java");
        String userCode = indentCodeInsideBlock(code, 8);
        StringBuilder wrapped = new StringBuilder();
        wrapped.append("public class Main {").append(System.lineSeparator())
                .append("    public static void main(String[] args) {").append(System.lineSeparator())
                .append(System.lineSeparator());
        if (!userCode.isBlank()) {
            wrapped.append(userCode).append(System.lineSeparator())
                    .append(System.lineSeparator());
        }
        wrapped.append("    }").append(System.lineSeparator())
                .append("}").append(System.lineSeparator());
        return new PreparedJavaSource("Main", wrapped.toString());
    }

    private String prepareCsharpSource(String code) {
        if (hasCsharpMainEntryPoint(code) || containsMainEntryPoint(code)) {
            return code;
        }

        logWrapperApplied("csharp");
        String userCode = indentCodeInsideBlock(code, 8);
        StringBuilder wrapped = new StringBuilder();
        wrapped.append("using System;").append(System.lineSeparator())
                .append(System.lineSeparator())
                .append("class Program {").append(System.lineSeparator())
                .append("    static void Main() {").append(System.lineSeparator())
                .append(System.lineSeparator());
        if (!userCode.isBlank()) {
            wrapped.append(userCode).append(System.lineSeparator())
                    .append(System.lineSeparator());
        }
        wrapped.append("    }").append(System.lineSeparator())
                .append("}").append(System.lineSeparator());
        return wrapped.toString();
    }

    private boolean containsMainEntryPoint(String code) {
        return code != null && ANY_MAIN_PATTERN.matcher(code).find();
    }

    private boolean hasJavaMainEntryPoint(String code) {
        return code != null && JAVA_PUBLIC_MAIN_PATTERN.matcher(code).find();
    }

    private boolean hasCsharpMainEntryPoint(String code) {
        return code != null && CSHARP_MAIN_PATTERN.matcher(code).find();
    }

    private boolean hasJavaClassDefinition(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        return JAVA_CLASS_PATTERN.matcher(code).find() || JAVA_FALLBACK_CLASS_PATTERN.matcher(code).find();
    }

    private String indentCodeInsideBlock(String code, int spaces) {
        if (code == null || code.isBlank()) {
            return "";
        }

        String indent = " ".repeat(Math.max(0, spaces));
        String[] lines = code.strip().split("\\R", -1);
        StringBuilder indented = new StringBuilder();

        for (int i = 0; i < lines.length; i++) {
            indented.append(indent).append(lines[i]);
            if (i < lines.length - 1) {
                indented.append(System.lineSeparator());
            }
        }
        return indented.toString();
    }

    private void logWrapperApplied(String language) {
        log.info("Execution wrapper applied for language: {}", language);
    }

    private String resolveJavaClassName(String code) {
        Matcher matcher = JAVA_CLASS_PATTERN.matcher(code);
        if (matcher.find()) {
            return matcher.group(1);
        }

        Matcher fallbackMatcher = JAVA_FALLBACK_CLASS_PATTERN.matcher(code);
        if (fallbackMatcher.find()) {
            return fallbackMatcher.group(1);
        }

        return "Main";
    }

    private Path findBuiltDotnetDll(Path workspace) throws IOException {
        Path releaseDir = workspace.resolve("bin").resolve("Release");
        if (!Files.exists(releaseDir)) {
            return null;
        }

        try (var paths = Files.walk(releaseDir, 4)) {
            return paths
                    .filter(path -> Files.isRegularFile(path) && path.getFileName().toString().equals("Runner.dll"))
                    .findFirst()
                    .orElse(null);
        }
    }

    private String mergeStreams(CommandResult commandResult) {
        Set<String> parts = new LinkedHashSet<>();
        if (commandResult.stdout() != null && !commandResult.stdout().isBlank()) {
            parts.add(commandResult.stdout().trim());
        }
        if (commandResult.stderr() != null && !commandResult.stderr().isBlank()) {
            parts.add(commandResult.stderr().trim());
        }
        return String.join(System.lineSeparator(), parts);
    }

    private String appendLine(String original, String line) {
        if (original == null || original.isBlank()) {
            return line;
        }
        return original + System.lineSeparator() + line;
    }

    private void deleteDirectoryQuietly(Path directory) {
        if (directory == null || !Files.exists(directory)) {
            return;
        }

        try {
            Files.walkFileTree(directory, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.deleteIfExists(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException ignored) {
            // Cleanup best effort.
        }
    }

    private String normalizeLanguage(String language) {
        String normalized = safe(language).toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "js" -> "javascript";
            case "py" -> "python";
            case "c++" -> "cpp";
            case "cs", "c#" -> "csharp";
            case "mysql" -> "sql";
            default -> normalized;
        };
    }

    private String safe(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String safeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private boolean isMissingExecutable(IOException exception) {
        String message = exception.getMessage();
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase(Locale.ROOT);
        return lower.contains("createprocess error=2")
                || lower.contains("cannot run program")
                || lower.contains("no such file")
                || lower.contains("error=2");
    }

    private record PreparedJavaSource(
            String className,
            String code
    ) {
    }

    private record CommandResult(
            String stdout,
            String stderr,
            int exitCode,
            boolean timedOut,
            boolean missingExecutable
    ) {
        boolean successful() {
            return !timedOut && !missingExecutable && exitCode == 0;
        }

        static CommandResult missingExecutable(String message) {
            return new CommandResult("", message, 127, false, true);
        }
    }

    private static final class StreamCollector implements Runnable {
        private final InputStream stream;
        private final int maxBytes;
        private final ByteArrayOutputStream output = new ByteArrayOutputStream();
        private boolean truncated;

        private StreamCollector(InputStream stream, int maxBytes) {
            this.stream = stream;
            this.maxBytes = maxBytes;
        }

        @Override
        public void run() {
            byte[] buffer = new byte[1024];
            try {
                int read;
                while ((read = stream.read(buffer)) != -1) {
                    int remaining = maxBytes - output.size();
                    if (remaining > 0) {
                        int toWrite = Math.min(remaining, read);
                        output.write(buffer, 0, toWrite);
                        if (toWrite < read) {
                            truncated = true;
                        }
                    } else {
                        truncated = true;
                    }
                }
            } catch (IOException ignored) {
                // Stream read failure should not crash the request.
            }
        }

        private String content() {
            String text = output.toString(StandardCharsets.UTF_8);
            if (truncated) {
                return text + System.lineSeparator() + "[output truncated]";
            }
            return text;
        }
    }
}
