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

    public int getWinner() {
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
        // move already made (cell is not empty - 0 means empty, 1 or 2 means occupied)
        if(totalBoard[moveLocation[0]][moveLocation[1]] != 0) return false;
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
        
        // If no winner and board is full, set won to -1 to indicate cat's game
        if(won == 0 && isBoardFull()) {
            won = -1;
        }

        turn = (turn == 1) ? 2 : 1; // toggle the move
    }

    @Override
    public boolean getWon() {
        return this.won != 0;
    }

    // Returns winner number (1 or 2) if someone won, 0 if no winner yet or cat's game
    public int isBoardWon() {
        // Check rows
        for(int row = 0; row < 3; row++) {
            int val = totalBoard[row][0];
            if(val != 0 && val == totalBoard[row][1] && val == totalBoard[row][2]) {
                return val;
            }
        }

        // Check cols
        for(int col = 0; col < 3; col++) {
            int val = totalBoard[0][col];
            if(val != 0 && val == totalBoard[1][col] && val == totalBoard[2][col]) {
                return val;
            }
        }

        // Check diagonal top-left to bottom-right
        int diag1Val = totalBoard[0][0];
        if(diag1Val != 0 && diag1Val == totalBoard[1][1] && diag1Val == totalBoard[2][2]) {
            return diag1Val;
        }

        // Check diagonal bottom-left to top-right
        int diag2Val = totalBoard[2][0];
        if(diag2Val != 0 && diag2Val == totalBoard[1][1] && diag2Val == totalBoard[0][2]) {
            return diag2Val;
        }

        return 0;
    }
    
    // Check if board is full (cat's game)
    public boolean isBoardFull() {
        for(int row = 0; row < 3; row++) {
            for(int col = 0; col < 3; col++) {
                if(totalBoard[row][col] == 0) {
                    return false;
                }
            }
        }
        return true;
    }
}
