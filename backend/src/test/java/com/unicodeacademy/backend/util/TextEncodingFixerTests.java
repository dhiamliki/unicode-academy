package com.unicodeacademy.backend.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TextEncodingFixerTests {

    @Test
    void keepsNormalUtf8TextUnchanged() {
        String input = "Quel mot-cl\u00E9 cr\u00E9e un objet ?";
        assertEquals(input, TextEncodingFixer.fix(input));
    }

    @Test
    void repairsSingleLevelMojibake() {
        String input = "Quel mot-cl\u00C3\u00A9 cr\u00C3\u00A9e un objet ?";
        String expected = "Quel mot-cl\u00E9 cr\u00E9e un objet ?";
        assertEquals(expected, TextEncodingFixer.fix(input));
    }

    @Test
    void repairsDoubleEncodedMojibake() {
        String input = "Quel mot-cl\u00C3\u0192\u00C2\u00A9 cr\u00C3\u0192\u00C2\u00A9e un objet ?";
        String expected = "Quel mot-cl\u00E9 cr\u00E9e un objet ?";
        assertEquals(expected, TextEncodingFixer.fix(input));
    }
}