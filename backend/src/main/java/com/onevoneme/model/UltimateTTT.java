package com.onevoneme.model;

public class UltimateTTT implements Game {
    private int turn = 1;
    private int[] curBoard = new int[] {0, 0};
    private int[][] board = new int[9][9];

            
    @Override
    public boolean validateMove(Move move) {
        return false;
    }

    @Override
    public void makeMove(Move move) {

    }

    @Override
    public Move getLastMove() {
        return null;
    }
}
