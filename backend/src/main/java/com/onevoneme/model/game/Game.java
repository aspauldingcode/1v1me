package com.onevoneme.model.game;

import com.onevoneme.model.move.Move;

public interface Game {
    boolean validateMove(Move move);
    void makeMove(Move move);
    Move getLastMove();
}
