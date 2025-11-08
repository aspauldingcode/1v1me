package com.onevoneme.model.move;

import lombok.AllArgsConstructor;
import lombok.Getter;
@AllArgsConstructor
public class TTTMove {
    @Getter
    int[] location;
    @Getter
    int userNumber; // 1 or 2, represents X or O
}
