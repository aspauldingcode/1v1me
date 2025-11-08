import React, { useEffect, useState } from 'react';

const API_URL: string = "insert_here" // TODO: REMEMBER TO CHANGE THIS

interface gameState {
    username: string;
    location: number[]; // info[0] is the row, info[1] is the column
}

interface SendMove {
    username: string;
    location: number[];
}

async function getGameState: 

// needs to send username of current player and the movement coordinates
// this function will be called when the user clicks on a tile on the tic tac toe board.
async function sendMove(payload: SendMove): Promise<void> {
    try {
        const response = await fetch(`${API_URL}make_move/tictactoe/${payload.username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Convert the JS object to a JSON string for transport
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('sendMove failed:', response.status, text);
            throw new Error(`sendMove failed: ${response.status}`);
        }
    } catch (err) {
        console.error('Error sending move:', err);
        throw err;
    }
}

export function Board(): JSX.Element {
    return (
        <>
            <div id='column1'>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <div id='column2'>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <div id='column3'>
                <button></button>
                <button></button>
                <button></button>
            </div>
        </>
    )
}

export function Game(): void {
    // while nobody has won
    // make first players turn
    // make second players turn
}