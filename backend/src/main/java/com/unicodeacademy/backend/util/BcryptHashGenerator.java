package com.unicodeacademy.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate bcrypt hashes for local seed users.
 * Usage: run main with an optional password argument.
 */
public final class BcryptHashGenerator {

    private BcryptHashGenerator() {
    }

    public static void main(String[] args) {
        String rawPassword = args.length > 0 ? args[0] : "Admin@123";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Raw password: " + rawPassword);
        System.out.println("BCrypt hash : " + encoder.encode(rawPassword));
    }
}