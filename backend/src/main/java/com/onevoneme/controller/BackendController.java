package com.onevoneme.controller;

import com.onevoneme.model.GameUser;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.move.TTTMove;
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

    @PostMapping("/register/{username}")
    public ResponseEntity<String> registerUser(@PathVariable String username) {
        if(gameService.isUserCreated(username)) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }else {
            gameService.registerUser(username);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        }
    }

    @PostMapping("/queue/{username}")
    public Game queueUp(@PathVariable String username) {
        return gameService.queueUp(username);
    }

    @PostMapping("/make_move/tictactoe/{username}")
    public ResponseEntity<String> makeTicTacMove(@PathVariable String username, @RequestBody TTTMove move) {
        boolean success = gameService.makeMove(move);
        return success ? ResponseEntity.ok("success") : ResponseEntity.badRequest().body("unsuccessful");
    }

    @GetMapping("/gamestate/{username}")
    public Game getGameState(@PathVariable String username) {
        return gameService.getGameState(username);
    }

//    @PostMapping("/make_move/rockpaperscissors/{username}")
//    public ResponseEntity<String> makeTicTacMove(@PathVariable String username, @RequestBody TTTMove move) {
//        boolean success = gameService.makeMove(move);
//    }

    @GetMapping("/users")
    public HashMap<String, GameUser> getUsers() {
        return gameService.getUsers();
    }
}

