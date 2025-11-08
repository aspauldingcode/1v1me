import React, { useEffect, useState } from 'react';

const API_URL: string = "insert_here" // TODO: REMEMBER TO CHANGE THIS

interface GetMove {
    username: string;
    location: number[]; // info[0] is the row, info[1] is the column
}

interface SendMove {
    username: string;
    location: number[];
}

async function getMove(): Promise<GetMove> {
    // This is a utility function (not a React component), so don't use hooks here.
    let player: string = "";
    let moves: number[] = [];

    //fetch logic here
    // Example:
    // const res = await fetch(`${API_URL}get_move/tictactoe`);
    // const data = await res.json();
    // player = data.username;
    // moves = data.info;
    return {
        username: player,
        location: moves
    }
}

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


// Define types for better readability and type safety
type Player = 'X' | 'O' | null;
type BoardState = Player[][]; // A 2D array representing the 3x3 board

// Helper function to create an empty 3x3 board
const createEmptyBoard = (): BoardState => [
    [null, null, null],
    [null, null, null],
    [null, null, null],
];

// Helper function to check for a winner
const checkWinner = (board: BoardState): Player => {
    // Check rows, columns, and diagonals
    const lines = [
        // Rows
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        // Columns
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        // Diagonals
        [board[0][0], board[1][1], board[2][2]],
        [board[0][2], board[1][1], board[2][0]],
    ];

    for (const line of lines) {
        if (line[0] && line[0] === line[1] && line[1] === line[2]) {
            return line[0]; // Return the winning player ('X' or 'O')
        }
    }

    return null; // No winner yet
};

// Helper function to check for a draw
const checkDraw = (board: BoardState): boolean => {
    return board.flat().every(cell => cell !== null);
};


function Board(): JSX.Element {
    // State to manage the board
    const [board, setBoard] = useState<BoardState>(createEmptyBoard());
    // State to manage the current player
    const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
    // State to store the winner
    const [winner, setWinner] = useState<Player>(null);
    // State to check for a draw
    const [isDraw, setIsDraw] = useState<boolean>(false);

    // Effect to check for winner or draw whenever the board changes
    useEffect(() => {
        const currentWinner = checkWinner(board);
        if (currentWinner) {
            setWinner(currentWinner);
        } else if (checkDraw(board)) {
            setIsDraw(true);
        }
    }, [board]); // This effect runs every time 'board' state updates

    // Function to handle a cell click
    const handleCellClick = (row: number, col: number) => {
        // If there's a winner or the cell is already taken, do nothing
        if (winner || isDraw || board[row][col] !== null) {
            return;
        }

        // Create a copy of the board to avoid direct state mutation
        const newBoard = board.map((r, rIdx) =>
            r.map((c, cIdx) => (rIdx === row && cIdx === col ? currentPlayer : c))
        );

        setBoard(newBoard); // Update the board state
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X'); // Switch player
    };

    // Function to reset the game
    const resetGame = () => {
        setBoard(createEmptyBoard());
        setCurrentPlayer('X');
        setWinner(null);
        setIsDraw(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-8 text-blue-700">Tic-Tac-Toe</h1>

            {winner && <h2 className="text-3xl mb-4 text-green-600 font-semibold">Winner: {winner}!</h2>}
            {isDraw && !winner && <h2 className="text-3xl mb-4 text-yellow-600 font-semibold">It&apos;s a Draw!</h2>}
            {!winner && !isDraw && <h2 className="text-2xl mb-4 text-gray-800">Current Player: {currentPlayer}</h2>}

            <div className="grid grid-cols-3 gap-2 p-4 border-4 border-gray-800 bg-gray-900 rounded-lg shadow-xl">
                {board.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                className={`
                                    w-24 h-24 text-5xl font-extrabold flex items-center justify-center
                                    bg-white rounded-md shadow-md transition-all duration-200
                                    ${cell === 'X' ? 'text-red-500' : 'text-blue-500'}
                                    ${!cell && !winner && !isDraw ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-not-allowed opacity-70'}
                                `}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                disabled={!!cell || !!winner || isDraw} // Disable button if cell is taken or game is over
                            >
                                {cell}
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>

            {(winner || isDraw) && (
                <button
                    onClick={resetGame}
                    className="mt-8 px-8 py-3 bg-indigo-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                    Play Again
                </button>
            )}

            {/* Optional: Add some basic styling or use Tailwind CSS as shown below */}
            <style jsx>{`
                /* Basic styles if not using a framework like Tailwind */
                .board-container {
                    display: grid;
                    grid-template-columns: repeat(3, 100px);
                    grid-template-rows: repeat(3, 100px);
                    gap: 5px;
                    border: 2px solid black;
                    width: fit-content;
                    margin-top: 20px;
                }
                .cell {
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3em;
                    border: 1px solid #ccc;
                    cursor: pointer;
                    background-color: white;
                }
                .cell:hover:not(:disabled) {
                    background-color: #f0f0f0;
                }
                .cell:disabled {
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default Board; // Export the component

