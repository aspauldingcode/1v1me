package com.onevoneme.services;

import com.onevoneme.model.GameUser;
import com.onevoneme.model.game.ActiveGame;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.game.UltimateTTT;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;

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

        // create a game and
        String otherUser = usersInQueue.getFirst();
        usersInQueue.removeFirst();

        Game actualGame = new UltimateTTT(username, otherUser);

        ActiveGame game = new ActiveGame(actualGame, users.get(username), users.get(otherUser));
        activeGames.add(game);
        return actualGame;
    }

    public boolean isUserCreated(String username) {
        return users.containsKey(username);
    }

    public void registerUser(String username) {
        users.put(username, new GameUser(username));
    }

    public void removeGameWithUser(String username) {
        for(ActiveGame g : activeGames) {
            if(g.getUsers()[0].getName().equals(username) || g.getUsers()[1].getName().equals(username)) {
                activeGames.remove(g);
                return;
            }
        }
    }
}
