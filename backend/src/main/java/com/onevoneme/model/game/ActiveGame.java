package com.onevoneme.model.game;

import com.onevoneme.model.GameUser;
import java.util.HashSet;
import java.util.Set;

public class ActiveGame {
    private GameUser[] users;
    private Game game;
    private Set<String> usersAcknowledgedEnd = new HashSet<>();
    
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
    
    public void acknowledgeEnd(String username) {
        usersAcknowledgedEnd.add(username);
    }
    
    public boolean bothUsersAcknowledgedEnd() {
        return usersAcknowledgedEnd.size() >= 2;
    }
    
    public Set<String> getUsersAcknowledgedEnd() {
        return usersAcknowledgedEnd;
    }
}
