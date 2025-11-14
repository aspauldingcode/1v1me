package com.onevoneme.services;

import com.onevoneme.model.user.GameUser;
import com.onevoneme.model.game.ActiveGame;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.game.UltimateTTT;
import com.onevoneme.model.move.Move;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

@Service
public class ManageGameService {
    private final HashMap<String, GameUser> users = new HashMap<>();

    private final ArrayList<String> usersInQueue = new ArrayList<>();

    private final ArrayList<ActiveGame> activeGames = new ArrayList<>();
    
    private final Random random = new Random();

    public Game queueUp(String username) {
        // Require registration; avoid creating games with null users
        if (!isUserCreated(username)) {
            return null;
        }

        // Clean queue front if it contains unregistered users (legacy entries)
        while (!usersInQueue.isEmpty() && !isUserCreated(usersInQueue.getFirst())) {
            usersInQueue.removeFirst();
        }

        // search active games and make sure that the user isn't already in one
        for (ActiveGame g : activeGames) {
            GameUser u0 = (g.getUsers().length > 0) ? g.getUsers()[0] : null;
            GameUser u1 = (g.getUsers().length > 1) ? g.getUsers()[1] : null;
            String n0 = (u0 != null) ? u0.getName() : null;
            String n1 = (u1 != null) ? u1.getName() : null;
            if (username.equals(n0) || username.equals(n1)) return null;
        }

        // user is already waiting in queue
        if(usersInQueue.contains(username)) return null;

        // no one is in queue, add this user and get outta here
        if(usersInQueue.isEmpty()) {
            usersInQueue.add(username);
            return null;
        }

        String otherUser = usersInQueue.get(0);
        usersInQueue.remove(0);

        // Ensure the other user is registered; if not, re-queue current user and wait
        if (!isUserCreated(otherUser)) {
            usersInQueue.add(username);
            return null;
        }

        // Randomly choose between tictactoe and rockpaperscissors
        Game newGame;
        if (random.nextBoolean()) {
            newGame = new UltimateTTT(otherUser, username);
        } else {
            newGame = new UltimateTTT(otherUser, username);
            //newGame = new RockPaperScissors(otherUser, username);
        }
        
        ActiveGame game = new ActiveGame(newGame, users.get(username), users.get(otherUser));

        activeGames.add(game);

        return newGame;
    }

    public boolean isUserCreated(String username) {
        return users.containsKey(username);
    }

    public Game makeMove(Move move) {
        String user = move.getUsername();
        for(ActiveGame g : activeGames) {
            if(!(g.getUsers()[0].getName().equals(user) || g.getUsers()[1].getName().equals(user))) continue;
            g.getGame().makeMove(move);
            return g.getGame();
        }
        return null;
    }

    public Game getGameState(String username) {
        for(ActiveGame g : activeGames) {
            GameUser u0 = (g.getUsers().length > 0) ? g.getUsers()[0] : null;
            GameUser u1 = (g.getUsers().length > 1) ? g.getUsers()[1] : null;
            String n0 = (u0 != null) ? u0.getName() : null;
            String n1 = (u1 != null) ? u1.getName() : null;
            
            if (!username.equals(n0) && !username.equals(n1)) continue;

            return g.getGame();
        }
        return null;
    }
    
    private void updateUserStats(ActiveGame game, int winner) {
        GameUser[] gameUsers = game.getUsers();
        if (gameUsers.length < 2) return;
        
        GameUser user1 = gameUsers[0];
        GameUser user2 = gameUsers[1];
        
        // Increment games played for both users
        user1.setGamesPlayed(user1.getGamesPlayed() + 1);
        user2.setGamesPlayed(user2.getGamesPlayed() + 1);
        
        // Determine winner based on usernameToTacNumber
        Game gameObj = game.getGame();

    }

    public void registerUser(String username) {
        users.put(username, new GameUser(username));
    }

    public HashMap<String, GameUser> getUsers() {
        return users;
    }
}
