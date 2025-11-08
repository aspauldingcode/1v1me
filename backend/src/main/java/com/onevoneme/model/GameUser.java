package com.onevoneme.model;

import lombok.Getter;
import lombok.Setter;

public class GameUser {
    @Getter
    private final String name;
    @Getter
    @Setter
    private int gamesWon;
    @Getter
    @Setter
    private int gamesPlayed;

    public GameUser(String username) {
        name = username;
        gamesWon = 0;
        gamesPlayed = 0;
    }
}
