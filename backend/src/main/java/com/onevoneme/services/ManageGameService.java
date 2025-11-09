package com.onevoneme.services;

import com.onevoneme.model.GameUser;
import com.onevoneme.model.game.ActiveGame;
import com.onevoneme.model.game.Game;
import com.onevoneme.model.game.RockPaperScissors;
import com.onevoneme.model.game.UltimateTTT;
import com.onevoneme.model.move.Move;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
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
        while (!usersInQueue.isEmpty() && !isUserCreated(usersInQueue.get(0))) {
            usersInQueue.remove(0);
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
            GameUser u0 = (g.getUsers().length > 0) ? g.getUsers()[0] : null;
            GameUser u1 = (g.getUsers().length > 1) ? g.getUsers()[1] : null;
            String n0 = (u0 != null) ? u0.getName() : null;
            String n1 = (u1 != null) ? u1.getName() : null;
            
            if (!username.equals(n0) && !username.equals(n1)) continue;
            
            Game game = g.getGame();
            
            // Check if game has ended (winner is not 0)
            if (game instanceof UltimateTTT) {
                UltimateTTT tttGame = (UltimateTTT) game;
                int winner = tttGame.getWinner();
                if (winner != 0) {
                    // Game has ended, mark this user as having acknowledged
                    g.acknowledgeEnd(username);
                    
                    // If both users have acknowledged, update stats and remove game
                    if (g.bothUsersAcknowledgedEnd()) {
                        updateUserStats(g, winner);
                        activeGames.remove(g);
                        return null; // Return null to indicate game is over and removed
                    }
                    // Otherwise, return the game state so user can see the result
                    return game;
                }
            }
            
            return game;
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
        if (gameObj instanceof UltimateTTT) {
            UltimateTTT tttGame = (UltimateTTT) gameObj;
            var usernameToTacNumber = tttGame.getUsernameToTacNumber();
            
            String user1Name = user1.getName();
            String user2Name = user2.getName();
            
            Integer user1TacNumber = usernameToTacNumber.get(user1Name);
            Integer user2TacNumber = usernameToTacNumber.get(user2Name);
            
            // winner is 1 or 2 (tac number), increment games won for the winner
            if (user1TacNumber != null && user1TacNumber == winner) {
                user1.setGamesWon(user1.getGamesWon() + 1);
            } else if (user2TacNumber != null && user2TacNumber == winner) {
                user2.setGamesWon(user2.getGamesWon() + 1);
            }
        }
    }

    public void registerUser(String username) {
        users.put(username, new GameUser(username));
    }

    // Explicit accessor to avoid reliance on Lombok-generated getter
    public HashMap<String, GameUser> getUsers() {
        return users;
    }
}
