package com.onevoneme.model.game;

import com.onevoneme.model.move.Move;

public class UltimateTTT implements Game {
    private int turn = 1;
    private int[] curBoard = new int[] {0, 0};
    private int[][] board = new int[9][9];
    private int[][] totalBoard = new int[3][3];

    private Move lastMove;

    @Override
    public boolean validateMove(Move move) {
//        if(!(move instanceof TTTMove)) return false;
//        TTTMove tictacMove = (TTTMove) move;
//
//        // wrong turn
//        if(tictacMove.getUserNumber() != turn) return false;
//
//        int[] moveLocation = tictacMove.getLocation();
//        // move already made
//        if(board[moveLocation[0]][moveLocation[1]] == 0) return false;
//        // move is outside the current board
//        if(Math.abs(moveLocation[0] - curBoard[0]) >= 3 || Math.abs(moveLocation[1] - curBoard[1]) >= 3) return false;

        return true;
    }

    @Override
    public void makeMove(Move move) {
//        if(!(move instanceof TTTMove)) return;
//        TTTMove tictacMove = (TTTMove) move;
//
//        int[] moveLoc = tictacMove.getLocation();
//
//        board[moveLoc[0]][moveLoc[1]] = tictacMove.getUserNumber();
//
//        turn = (turn == 1) ? 2 : 1; // toggle the move
    }

    @Override
    public Move getLastMove() {
        return null;
    }


    // if won will return number if false will return null
    public Integer isBoardWon(int[] boardLoc) {
        // boardLoc is outside bounds of board
        if(boardLoc[0] < 0 || boardLoc[1] < 0 || boardLoc[0] > board.length-3 || boardLoc[1] > board.length-3) return null;

        // Check rows
        for(int row = 0; row < 3; row++) {
            if((board[boardLoc[0]+row][boardLoc[1]] == board[boardLoc[0]+row][boardLoc[1]+1]) &&
                    (board[boardLoc[0]+row][boardLoc[1]+1] == board[boardLoc[0]+row][boardLoc[1]+2])) {
                return board[boardLoc[0]+row][boardLoc[1]];
            }
        }

        // Check cols
        for(int col = 0; col < 3; col++) {
            if((board[boardLoc[0]][boardLoc[1]+col] == board[boardLoc[0]+1][boardLoc[1]+col]) &&
                    (board[boardLoc[0]+1][boardLoc[1]+col] == board[boardLoc[0]+2][boardLoc[1]+col])) {
                return board[boardLoc[0]][boardLoc[1]+col];
            }
        }

        // Check diagonals
        if((board[boardLoc[0]][boardLoc[1]] == board[boardLoc[0]+1][boardLoc[1]+1]) &&
                (board[boardLoc[0]+1][boardLoc[1]+1] == board[boardLoc[0]+2][boardLoc[1]+2])) {
            return board[boardLoc[0]+1][boardLoc[1]+1];
        }

        if((board[boardLoc[0]+2][boardLoc[1]] == board[boardLoc[0]+1][boardLoc[1]+1]) &&
                (board[boardLoc[0]+1][boardLoc[1]+1] == board[boardLoc[0]][boardLoc[1]+2])) {
            return board[boardLoc[0]+1][boardLoc[1]+1];
        }

        return null;
    }
}
