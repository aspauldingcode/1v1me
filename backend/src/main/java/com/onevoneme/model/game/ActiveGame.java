package com.onevoneme.model.game;

import com.onevoneme.model.user.GameUser;

public class ActiveGame {
    private GameUser[] users;
    private Game game;
    
    public ActiveGame(Game game, GameUser user1, GameUser user2) {
        this.game = game;
        users = new GameUser[] {user1, user2};
    }

    public GameUser[] getUsers() {
        return users;
    }

    public Game getGame() {
        return game;
    }
}
