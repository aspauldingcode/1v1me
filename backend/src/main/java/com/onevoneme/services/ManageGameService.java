package com.onevoneme.services;

import com.onevoneme.model.GameUser;
import com.onevoneme.model.game.ActiveGame;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.game.UltimateTTT;
import com.onevoneme.model.move.Move;
import lombok.Getter;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

@Service
public class ManageGameService {
    @Getter
    private final HashMap<String, GameUser> users = new HashMap<>();

    private final ArrayList<String> usersInQueue = new ArrayList<>();

    private final ArrayList<ActiveGame> activeGames = new ArrayList<>();

    public Game queueUp(String username) {
        // search active games and make sure that the user isn't already in one
        for(ActiveGame g : activeGames) {
            if(g.getUsers()[0].getName().equals(username) ||
                    g.getUsers()[1].getName().equals(username)) return null;
        }

        // user is already waiting in queue
        if(usersInQueue.contains(username)) return null;

        // no one is in queue, add this user and get outta here
        if(usersInQueue.isEmpty()) {
            usersInQueue.add(username);
            return null;
        }

        String otherUser = usersInQueue.getFirst();
        usersInQueue.removeFirst();

        Game newGame = new UltimateTTT(otherUser, username);
        ActiveGame game = new ActiveGame(newGame, users.get(username), users.get(otherUser));

        activeGames.add(game);

        return newGame;
    }

    public boolean isUserCreated(String username) {
        return users.containsKey(username);
    }

    public boolean makeMove(Move move) {
        String user = move.getUsername();
        for(ActiveGame g : activeGames) {
            if(!(g.getUsers()[0].getName().equals(user) || g.getUsers()[1].getName().equals(user))) continue;
            g.getGame().makeMove(move);
            return true;
        }
        return false;
    }

    public Game getGameState(String username) {
        for(ActiveGame g : activeGames) {
            if(!(g.getUsers()[0].getName().equals(username) || g.getUsers()[1].getName().equals(username))) continue;
            return g.getGame();
        }
        return null;
    }

    public void registerUser(String username) {
        users.put(username, new GameUser(username));
    }
}
