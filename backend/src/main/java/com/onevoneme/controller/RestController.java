package com.onevoneme.controller;

import com.onevoneme.services.ManageGameService;
import com.onevoneme.services.UsernamePolicyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api")
public class RestController {
    private final ManageGameService gameService;
    private final UsernamePolicyService usernamePolicyService;

    public RestController(ManageGameService gameService, UsernamePolicyService usernamePolicyService) {
        this.gameService = gameService;
        this.usernamePolicyService = usernamePolicyService;
    }

    @GetMapping("/backend-health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "1v1me backend is running");
        return ResponseEntity.ok(response);
    }


    @PostMapping("/queue/{username}")
    public ResponseEntity<String> queueUp(@PathVariable String username) {
        if (!gameService.isUserCreated(username)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(gameService.queueUp(username).toString());
    }

    @PostMapping("/register/{username}")
    public ResponseEntity<String> registerUser(@PathVariable String username) {
        String policyError = usernamePolicyService.validateUsername(username);
        if (policyError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(policyError);
        }
        if(gameService.isUserCreated(username)) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }else {
            gameService.registerUser(username);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        }
    }
}

