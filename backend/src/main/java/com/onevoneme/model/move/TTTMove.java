package com.onevoneme.model.move;

import lombok.AllArgsConstructor;
import lombok.Getter;
@AllArgsConstructor
public class TTTMove implements Move{
    @Getter
    int[] location;

    @Getter
    String username; // 1 or 2, represents X or O
}
