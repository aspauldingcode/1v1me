package com.onevoneme.model.game;

import com.onevoneme.model.GameUser;

public class ActiveGame {
    public GameUser[] users;
    public Game game;
    public ActiveGame(GameUser user1, GameUser user2) {
        users = new GameUser[] {user1, user2};
    }
}
