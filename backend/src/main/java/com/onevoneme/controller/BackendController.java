package com.onevoneme.controller;

import com.onevoneme.model.GameUser;
import com.onevoneme.services.ManageGameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BackendController {
    ManageGameService gameService;
    public BackendController(ManageGameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "1v1me backend is running");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody String username) {
        if(gameService.isUserCreated(username)) {
            return new ResponseEntity<>(HttpStatus.IM_USED);
        }else {
            gameService.registerUser(username);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        }
    }

    @GetMapping("/users")
    public HashMap<String, GameUser> getUsers() {
        return gameService.getUsers();
    }
}

