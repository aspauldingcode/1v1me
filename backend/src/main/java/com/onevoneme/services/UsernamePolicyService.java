package com.onevoneme.services;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class UsernamePolicyService {
    private final Set<String> blockedWords = new HashSet<>();
    private final Set<String> reservedNames = new HashSet<>();
    private final List<Pattern> blockPatterns = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadList("username-blocklist.txt", blockedWords);
        loadList("username-reserved.txt", reservedNames);
        loadPatterns("username-patterns.txt", blockPatterns);
    }

    private void loadList(String resourceName, Set<String> target) {
        try {
            ClassPathResource res = new ClassPathResource(resourceName);
            if (!res.exists()) return;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String v = line.trim().toLowerCase(Locale.ROOT);
                    if (!v.isEmpty() && !v.startsWith("#")) {
                        target.add(v);
                    }
                }
            }
        } catch (Exception ignored) { }
    }

    private void loadPatterns(String resourceName, List<Pattern> target) {
        try {
            ClassPathResource res = new ClassPathResource(resourceName);
            if (!res.exists()) return;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String v = line.trim();
                    if (!v.isEmpty() && !v.startsWith("#")) {
                        target.add(Pattern.compile(v));
                    }
                }
            }
        } catch (Exception ignored) { }
    }

    /**
     * Validate a username against policy.
     * @return null if valid; otherwise a human-readable reason.
     */
    public String validateUsername(String username) {
        if (username == null) return "Username is required";

        // basic length limits (keep consistent with UI expectations)
        if (username.length() < 3) return "Username too short";
        if (username.length() > 24) return "Username too long";

        // allowed characters only
        if (!username.matches("[A-Za-z0-9_-]+")) {
            return "Only letters, digits, '_' and '-' allowed";
        }

        String lower = username.toLowerCase(Locale.ROOT);
        String normalized = normalize(lower);

        // exact reserved names
        if (reservedNames.contains(normalized)) {
            return "Reserved name not allowed";
        }

        // blocklist substring match on normalized input
        for (String bad : blockedWords) {
            if (normalized.contains(bad)) {
                return "Username contains prohibited term";
            }
        }

        // regex patterns
        for (Pattern p : blockPatterns) {
            if (p.matcher(lower).matches() || p.matcher(lower).find()) {
                return "Username matches a prohibited pattern";
            }
        }

        return null;
    }

    private String normalize(String s) {
        // map common leetspeak and remove separators so substring checks catch obfuscations
        String replaced = s
                .replace('4', 'a')
                .replace('@', 'a')
                .replace('1', 'i')
                .replace('!', 'i')
                .replace('0', 'o')
                .replace('3', 'e')
                .replace('5', 's')
                .replace('$', 's')
                .replace('7', 't');
        // strip common separators used to obfuscate words
        return replaced.replace(".", "")
                .replace("_", "")
                .replace("-", "")
                .replace(" ", "");
    }
}