package com.onevoneme.model;

public class ActiveGame {
    public GameUser[] users;
    public
    public ActiveGame(GameUser user1, GameUser user2) {
        users = new GameUser[] {user1, user2};
    }
}
