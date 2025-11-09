package com.onevoneme.model.game;

import com.onevoneme.model.GameUser;
import lombok.Getter;

public class ActiveGame {
    @Getter
    private GameUser[] users;
    @Getter
    private Game game;
    public ActiveGame(Game game, GameUser user1, GameUser user2) {
        this.game = game;
        users = new GameUser[] {user1, user2};
    }

    // Explicit getters to avoid reliance on Lombok annotation processing in build environments
    public GameUser[] getUsers() {
        return users;
    }

    public Game getGame() {
        return game;
    }
}
