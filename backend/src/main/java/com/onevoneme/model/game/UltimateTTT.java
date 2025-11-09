package com.onevoneme.model.game;

import com.onevoneme.model.GameUser;
import com.onevoneme.model.move.Move;
import com.onevoneme.model.move.TTTMove;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class UltimateTTT implements Game {
    private int turn = 1;
    private int[][] totalBoard = new int[3][3];
    private final Map<String, Integer> usernameToTacNumber;
    private final String[] users;
    private int won = 0;
    private final String type = "tictactoe";

    public String getType() {
        return type;
    }

    public int getTurn() {
        return turn;
    }

    public int[][] getTotalBoard() {
        return totalBoard;
    }

    public Map<String, Integer> getUsernameToTacNumber() {
        return usernameToTacNumber;
    }

    public int getWon() {
        return won;
    }

    public UltimateTTT(String user1, String user2) {
        this.usernameToTacNumber = new HashMap<>();
        usernameToTacNumber.put(user1, 1);
        usernameToTacNumber.put(user2, 2);
        users = new String[2];
        users[0] = user1;
        users[1] = user2;
    }

    @Override
    public boolean validateMove(Move move) {
        if(!(move instanceof TTTMove)) return false;
        TTTMove tictacMove = (TTTMove) move;

        // wrong turn
        if(usernameToTacNumber.get(tictacMove.getUsername()) != turn) return false;

        int[] moveLocation = tictacMove.getLocation();
        // move already made
        if(totalBoard[moveLocation[0]][moveLocation[1]] == 0) return false;
        // move is outside the current board
        //if(Math.abs(moveLocation[0] - curBoard[0]) >= 3 || Math.abs(moveLocation[1] - curBoard[1]) >= 3) return false;

        return true;
    }

    @Override
    public void makeMove(Move move) {
        if(!(move instanceof TTTMove)) return;
        TTTMove tictacMove = (TTTMove) move;

        int[] moveLoc = tictacMove.getLocation();

        //update the board at the move
        totalBoard[moveLoc[0]][moveLoc[1]] = usernameToTacNumber.get(tictacMove.getUsername());

        won = isBoardWon();

        turn = (turn == 1) ? 2 : 1; // toggle the move
    }

    @Override
    public boolean getWon() {
        return this.won != 0;
    }

    // if won will return number if false will return null
    public int isBoardWon() {

        // Check rows
        for(int row = 0; row < 3; row++) {
            if((totalBoard[row][0] == totalBoard[row][1]) && (totalBoard[row][1] == totalBoard[row][2])) {
                return totalBoard[row][0];
            }
        }

        // Check cols
        for(int col = 0; col < 3; col++) {
            if((totalBoard[0][col] == totalBoard[1][col]) && (totalBoard[1][col] == totalBoard[2][col])) {
                return totalBoard[col][0];
            }
        }

        // Check diagonals
        if((totalBoard[0][0] == totalBoard[1][1]) == (totalBoard[1][1] == totalBoard[2][2])) {
            return totalBoard[1][1];
        }
        if((totalBoard[2][0] == totalBoard[1][1]) == (totalBoard[1][1] == totalBoard[0][2])) {
            return totalBoard[1][1];
        }

        return 0;
    }
}
