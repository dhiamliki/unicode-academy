package com.unicodeacademy.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(50)
public class SchemaCompatibilityInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaCompatibilityInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaCompatibilityInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureLessonColumns();
        recoverLegacyLargeObjectValues();
    }

    private void ensureLessonColumns() {
        ensureColumn("lessons", "starter_code", "TEXT");
        ensureColumn("lessons", "editor_language", "VARCHAR(50)");
        ensureColumn("lessons", "execution_type", "VARCHAR(40)");
        ensureColumn("lessons", "sample_output", "TEXT");
    }

    private void recoverLegacyLargeObjectValues() {
        recoverLargeObjectColumn("lessons", "starter_code");
        recoverLargeObjectColumn("lessons", "sample_output");
    }

    private void recoverLargeObjectColumn(String tableName, String columnName) {
        String sql = """
                UPDATE %s t
                SET %s = convert_from(lo_get(CAST(t.%s AS oid)), 'UTF8')
                WHERE t.%s ~ '^[0-9]+$'
                  AND EXISTS (
                      SELECT 1
                      FROM pg_largeobject_metadata m
                      WHERE m.oid = CAST(t.%s AS oid)
                  )
                """.formatted(tableName, columnName, columnName, columnName, columnName);
        try {
            int updated = jdbcTemplate.update(sql);
            if (updated > 0) {
                log.info("Recovered {} legacy large-object value(s) for {}.{}.", updated, tableName, columnName);
            }
        } catch (Exception ex) {
            log.warn("Legacy large-object recovery skipped for {}.{} ({})", tableName, columnName, ex.getMessage());
        }
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        String sql = "ALTER TABLE " + tableName + " ADD COLUMN IF NOT EXISTS " + columnName + " " + definition;
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            log.warn("Schema compatibility step skipped for {}.{} ({})", tableName, columnName, ex.getMessage());
        }
    }
}
