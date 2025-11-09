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

    // Explicit getters/setters to avoid reliance on Lombok processing
    public String getName() { return name; }
    public int getGamesWon() { return gamesWon; }
    public void setGamesWon(int gamesWon) { this.gamesWon = gamesWon; }
    public int getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(int gamesPlayed) { this.gamesPlayed = gamesPlayed; }
}
