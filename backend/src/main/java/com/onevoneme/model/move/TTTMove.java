package com.onevoneme.model.move;

import lombok.AllArgsConstructor;
@AllArgsConstructor
public class TTTMove implements Move{
    int[] location;

    String username; // 1 or 2, represents X or O

    // Explicit getters to avoid reliance on Lombok during compilation
    public int[] getLocation() { return location; }
    public String getUsername() { return username; }
}
