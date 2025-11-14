package com.onevoneme.controller;
import com.onevoneme.model.user.GameUser;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.move.TTTMove;
import com.onevoneme.services.ManageGameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;

@Controller
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ManageGameService gameService;
    public SocketController(ManageGameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/make_move/tictactoe/{username}")
    public Game makeTicTacMove(@PathVariable String username, @RequestBody TTTMove move) {
        return gameService.makeMove(move);
    }

    @MessageMapping("/gamestate/{username}")
    @SendTo("/topic/gamestate/{gamecode}")
    public Game getGameState(@PathVariable String username) {
        return gameService.getGameState(username);
    }

    @MessageMapping("/users")
    @SendTo("/topic/users")
    public HashMap<String, GameUser> getUsers() {
        return gameService.getUsers();
    }

}