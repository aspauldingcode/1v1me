package com.onevoneme.model;

public interface Game {
    boolean validateMove(Move move);
    void makeMove(Move move);
    Move getLastMove();
}
