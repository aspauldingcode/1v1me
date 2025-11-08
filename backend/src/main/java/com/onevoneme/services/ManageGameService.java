package com.onevoneme.services;

import com.onevoneme.model.GameUser;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;

@Service
public class ManageGameService {
    @Getter
    private final HashMap<String, GameUser> users = new HashMap<>();

    private final HashSet<String> usersInQueue = new HashSet<>();

    public boolean isUserCreated(String username) {
        return users.containsKey(username);
    }

    public void registerUser(String username) {
        users.put(username, new GameUser(username));
    }
}
