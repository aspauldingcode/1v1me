package com.onevoneme.model.game;

import com.onevoneme.model.move.Move;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class RockPaperScissors implements Game {

    private final String[] users;

    private Map<String, Integer> usernameToCode;

    private final ArrayList<Move[]> moveHistory;

    public RockPaperScissors(String user1, String user2) {
        users = new String[2];
        users[0] = user1;
        users[1] = user2;
        usernameToCode = new HashMap<>();
        usernameToCode.put(user1, 0);
        usernameToCode.put(user2, 1);
        moveHistory = new ArrayList<>();
        moveHistory.add(null);
    }

    @Override
    public boolean validateMove(Move move) {
        return false;
    }

    @Override
    public void makeMove(Move move) {
        if(moveHistory.getLast() == null) {
            //moveHistory.
        }
    }

    @Override
    public boolean getWon() {
        return false;
    }
}
