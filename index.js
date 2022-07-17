let turn = true;
let winner = false;
let winnerPlayer = '';
let draw = false;
let processing = false; // Used to prevent two button events from registering at the same time.
let ai = true;
let aiTurn = false; // Plays second. This variable is ignored if ai is false.
let bot = 0; // 0 = Default Minimax, 1 = Hacker
let peerInit = false; // Check if PeerJs is initiated.

const tiles = [document.getElementById("b1"),document.getElementById("b2"),document.getElementById("b3"),document.getElementById("b4"),document.getElementById("b5"),document.getElementById("b6"),document.getElementById("b7"),document.getElementById("b8"),document.getElementById("b9")];
const turnDisplay = document.getElementById("turnDisplay"); // Get each tile.
const playAgainBtn = document.getElementById("playAgainBtn");
const p1Display = document.getElementById("p1Display");
const p2Display = document.getElementById("p2Display");
const radioInputs = []
const modes = 3;
for (let i = 0; i < modes; i++) {
    radioInputs.push(document.getElementById("radio"+i))
}

radioInputs.forEach(radioInput => {
    processing = true;
    radioInput.addEventListener('click', () => {
        radioInputs.forEach(radioInputF => {
            if (radioInput.id != radioInputF.id){
                radioInputF.checked = false;
            }
            radioInputF.disabled = true;
        })
        
        let id = radioInput.id
        if (id[5] == "0") {
            ai = false
        } else if (id[5] == "1") {
            bot = 0;
            ai = true;
        } else if (id[5] == "2") {
            bot = 1;
            ai = true;
        }processing = false;
    })
})
let moves = [] // Keeps track of every board move (in order)

let turnDisplayText = turn  ? "X" : "O";
turnDisplay.innerHTML = turnDisplayText + "'s Turn.";
// Initialize the turn display
if (ai) {
    p1Display.innerHTML = !aiTurn ? "Player" : "AI"
    p2Display.innerHTML = !aiTurn ? "AI" : "Player"
}

tiles.forEach(tile => {
    tile.addEventListener('click', () => { // Listen for any tile click
        if (!winner && !draw && checkTileAvailable(parseInt(tile.id[1]-1)) && !processing) { // Prevent clicking post-game and clicking a tile that has already been played.
                radioInputs.forEach(radioInput => {
                    radioInput.disabled = true;
                })
                processing = true;
                turnDisplayText = !turn  ? "X" : "O";
                turnDisplay.className = "";
                turnDisplay.innerHTML = turnDisplayText + "'s Turn."; // Display turn
                tile.innerHTML = turn  ? "X" : "O";
                let tmp = turn ? "text-danger" : "text-success";
                tile.className = "boardBlock col text-center " + tmp; // Display X or O on the tile pressed
                turn = !turn // Switch turns
                let tileToTurn;
                tileToTurn = parseInt(tile.id[1]-1); 
                board[tileToTurn] = !turn  ? "X" : "O"; // Reflect tile changes to board list so it can be checked for wins/draws and prevent cheating.
                moves.push(tileToTurn) // Add the move to the list of moves.
                console.log(board)
                checkIfWinner() // Check if there is a winner
                if (winner)  displayWinner() // If there is winner then display it.
                if (draw) displayDraw() // If there is a draw then display it.
                // AI plays.
                if (aiTurn === turn && ai && !winner && !draw) {
                    let tileToMove = getAIMove(aiTurn,bot)
                    console.log(tileToMove)
                    let tileToExecute = tiles[tileToMove];
                    moves.push(tileToMove) // Add the move to the list of moves.
                    turnDisplayText = !turn  ? "X" : "O";
                    turnDisplay.className = "";
                    turnDisplay.innerHTML = turnDisplayText + "'s Turn."; // Display turn
                    tileToExecute.innerHTML = turn  ? "X" : "O";
                    let tmp = turn ? "text-danger" : "text-success";
                    tileToExecute.className = "boardBlock col text-center " + tmp; // Display X or O on the tile pressed
                    turn = !turn // Switch turns
       
                    board[tileToMove] = !turn  ? "X" : "O"; // Reflect tile changes to board list so it can be checked for wins/draws and prevent cheating.
                    checkIfWinner() // Check if there is a winner
                    if (winner)  displayWinner() // If there is winner then display it.
                    if (draw) displayDraw() // If there is a draw then display it.
                }

                processing = false; // Allow buttons to be pressed now (logic is done and visuals are rendered by now.).
                
            
            
        }
        })            
            
})


// AI STUFF

const checkWinnerAI = (boardToCheck) => {
    let winnerAi;
    let winnerPlayerAI;
    let drawAI;
    let tmp;

    if (boardToCheck[0] === boardToCheck[1] && boardToCheck[0] == boardToCheck[2]) {
        winnerPlayerAI = boardToCheck[0];
        winnerAi = true;
    } else if (boardToCheck[3] === boardToCheck[4] && boardToCheck[3] == boardToCheck[5]) {
        winnerPlayerAI = boardToCheck[3];
        winnerAi = true;
    } else if (boardToCheck[6] === boardToCheck[7] && boardToCheck[6] == boardToCheck[8]) {
        winnerPlayerAI = boardToCheck[6];
        winnerAi = true;
    } else if (boardToCheck[0] === boardToCheck[4] && boardToCheck[0] == boardToCheck[8]) {
        winnerPlayerAI = boardToCheck[0];
        winnerAi = true;
    } else if (boardToCheck[2] === boardToCheck[4] && boardToCheck[2] == boardToCheck[6]) {
        winnerPlayerAI = boardToCheck[2];
        winnerAi = true;
    } else if (boardToCheck[0] === boardToCheck[3] && boardToCheck[0] == boardToCheck[6]) {
        winnerPlayerAI = boardToCheck[0];
        winnerAi = true;
    } else if (boardToCheck[1] === boardToCheck[4] && boardToCheck[1] == boardToCheck[7]) {
        winnerPlayerAI = boardToCheck[1];
        winnerAi = true;
    } else if (boardToCheck[2] === boardToCheck[5] && boardToCheck[2] == boardToCheck[8]) {
        winnerPlayerAI = boardToCheck[2];
        winnerAi = true;
    } 
    
    // Check if Draw
    if (!winnerAi) {
        let full = true; // Assume board is full.
        boardToCheck.forEach(tileAI => {
            if (tileAI != "X" && tileAI != "O") { // If a number is present, not all tiles have been played 
                full = false; // The board is not full.
            }
        })
        if (full) drawAI = true;
    }
    if(drawAI) return 0
    if (winnerPlayerAI == "X") return 1
    else if (winnerPlayerAI == "O") return -1
    return null
} 

function getAIMove(max, bot) {
    
    let availableTiles = [];
    for(let i = 0; i < board.length; i++) { // Get available tiles
        if (checkTileAvailableAI(i,board)) availableTiles.push(i)
    }
    let bestScore = !max ? 999 : -999
    let bestMove = 0;

    let scores = [];

    availableTiles.forEach(tile => {
 
        board[tile] = max ? "X" : "O"
        let score = minimax(board,!max)
        let tmp = tile + 1
        board[tile] = tmp.toString()
        scores.push(score)
        if (max) {
            let choice = Math.floor(Math.random() * 2) // 0 or 1
            let choice2 = Math.floor(Math.random() * 2) // 0 or 1
            if (score > bestScore) {
                bestScore = score
                bestMove = tile
            } if (score == bestScore && choice == 1) { // If score is equal and random is 1 then choose this tile.
                bestScore = score
                bestMove = tile
            } if (score == 0 && choice2 == 1 && bot == 1) { // If score is 0 and random is 1 and bot is 1 then choose this tile.
                bestScore = score
                bestMove = tile
            }
        } else {
            let choice = Math.floor(Math.random() * 2) // 0 or 1
            let choice2 = Math.floor(Math.random() * 2) // 0 or 1
            if (score < bestScore) {
                bestScore = score
                bestMove = tile
            } if (score == bestScore && choice == 1) { // If score is equal and random is 1 then choose this tile.
                bestScore = score
                bestMove = tile
            }if (score == 0 && choice2 == 1 && bot == 1) { // If score is 0 and random is 1 and bot is 1 then choose this tile.
                bestScore = score
                bestMove = tile
            }
        }
    })
    console.log("SCORES" + scores)
    if (bot == 1) {
        if (bestScore == 0) {
            
            // Check if one more tile spot (two if X)
            let availableTiles = 0;
            for(let i = 0; i < board.length; i++) { 
                if (checkTileAvailableAI(i,board)) availableTiles+=1
            } 
            
            if ((availableTiles == 2 && !max) || (availableTiles == 1 && max)) {
                
                // Get Pairs
                let pairs = []
                let symbol = max ? "X" : "O"
                
                
                for(let i = 0; i < board.length; i++) { 
                    // Check for horizontal pairs.
                    try {
                        if (board[i] == board[i+1]) {
                            console.log('f')
                            if (board[i] == symbol){
                                if (i != 2 && i != 5 && i != 8) pairs.push([i,i+1,'h'])
                            }
                        }
                    }catch { }     
                        // Check for vertical pairs.
                    try {
                        if (board[i] == board[i+3]) {
                            if (board[i] == symbol) {
                                if (i != 6 && i != 7 && i != 8) pairs.push([i,i+3,'v'])
                            }
                        }
                    } catch{ }
                   
                }
                // Check for diagonal Pairs.
                if (board[0] == board[4]) if(board[0] == symbol) pairs.push([0,4,'d'])
                if (board[2] == board[4]) if(board[2] == symbol) pairs.push([2,4,'d'])
                if (board[4] == board[6]) if(board[4] == symbol) pairs.push([4,6,'d'])
                if (board[4] == board[8]) if(board[4] == symbol) pairs.push([4,8,'d'])
                
            console.log("PAIRS:")
            console.log(pairs)

                // Find where to place extra tile
                if (pairs.length > 0) {
                    let tmp = Math.floor(Math.random() * pairs.length)
                    console.log("USING PAIR" + tmp) 
                    let pair = pairs[tmp]
                    // TODO: Figure out where to place the extra tile.
                    if (pair[2] == 'h') {
                        if (pair[0] == 0 || pair[0] == 3 || pair[0] == 6) {
                            return pair[1] + 1
                        } return pair[0] - 1 
                    }
                    if(pair[2] == 'v') {
                        if (pair[0] == 0 || pair[0] == 1 || pair[0] == 2) {
                            return pair[1] + 3
                        } return pair[0] - 3
                    }
                    if(pair[2] == 'd') {
                        if (pair[0] == 0 && pair[1] == 4) return 8
                        if (pair[0] == 2 && pair[1] == 4) return 6
                        if (pair[0] == 4 && pair[1] == 6) return 2
                        if (pair[0] == 4 && pair[1] == 8) return 0
                    }
                    
                    
                }
            }
                
        }
            
    // Return position of new tile.
    } 
    return bestMove // Default: play best move
    
}

function minimax(newBoardAI,maxAI) {

    let res = checkWinnerAI(newBoardAI)
 
    if (res !== null) {
        return res
    }

    let availableTilesAI = [];
    for(let j = 0; j < newBoardAI.length; j++) { // Get available tiles
        if (checkTileAvailableAI(j,newBoardAI)) availableTilesAI.push(j)
    }

    let bestScoreAI = !maxAI ? 999 : -999
    let scoresAI = []

    availableTilesAI.forEach(tileAI => {
       
        newBoardAI[tileAI] = maxAI ? "X" : "O"
        let scoreAI = minimax(newBoardAI,!maxAI)
        let tmp = tileAI + 1
        newBoardAI[tileAI] = tmp.toString()
        scoresAI.push(scoreAI)
        if (maxAI) {
           //if (scoreAI == 1) return tileAI
           bestScoreAI = Math.max(bestScoreAI,scoreAI)
        } else {
            //if (scoreAI == -1) return tileAI
            bestScoreAI = Math.min(bestScoreAI,scoreAI)
        }
    })


    
    return bestScoreAI

}

let board = [
    '1','2','3',
    '4','5','6',
    '7','8','9',
]

const checkTileAvailable = (id) => {
    if (board[id] == "X" || board[id] == "O") return false;
    return true;
}


const checkTileAvailableAI = (id,boardAII) => {
    if (boardAII[id] == "X" || boardAII[id] == "O") return false;
    return true;
}

const checkIfWinner = () => {
    if (board[0] === board[1] && board[0] == board[2]) {
        winnerPlayer = board[0];
        winner = true;
    } else if (board[3] === board[4] && board[3] == board[5]) {
        winnerPlayer = board[3];
        winner = true;
    } else if (board[6] === board[7] && board[6] == board[8]) {
        winnerPlayer = board[6];
        winner = true;
    } else if (board[0] === board[4] && board[0] == board[8]) {
        winnerPlayer = board[0];
        winner = true;
    } else if (board[2] === board[4] && board[2] == board[6]) {
        winnerPlayer = board[2];
        winner = true;
    } else if (board[0] === board[3] && board[0] == board[6]) {
        winnerPlayer = board[0];
        winner = true;
    } else if (board[1] === board[4] && board[1] == board[7]) {
        winnerPlayer = board[1];
        winner = true;
    } else if (board[2] === board[5] && board[2] == board[8]) {
        winnerPlayer = board[2];
        winner = true;
    } 
    
    // Check if Draw
    if (!winner) {
        let full = true; // Assume board is full.
        board.forEach(tile => {
            if (tile != "X" && tile != "O") { // If a number is present, not all tiles have been played 
                full = false; // The board is not full.
            }
        })
        if (full) draw = true;
    }
}

const resetBoard = () => {
    // Reset all the variables.
    
    winnerPlayer = '';
    
    turn = true;
    board = [
        '1','2','3',
        '4','5','6',
        '7','8','9',
    ]

    tiles.forEach(tile => {
        tile.innerHTML = "&#8205;";
    })
    turnDisplayText = turn  ? "X" : "O";
    turnDisplay.className = "";
    turnDisplay.innerHTML = turnDisplayText + "'s Turn.";
    draw = false;
    winner = false;
}

playAgainBtn.addEventListener('click', () => {
    radioInputs.forEach(radioInput => {
        radioInput.disabled = true;
    })
    resetBoard();
    // Hide Button.
    playAgainBtn.style = "visibility:hidden;";
    playAgainBtn.disabled = true;
    aiStart()
})

const displayWinner = () => {
    turnDisplay.innerHTML = winnerPlayer + " wins!";
    turnDisplay.className = "text-warning"; // Show winner
    console.log("Winning Board"+  board)
    // After a couple seconds, reset the visuals.
    setTimeout(() => {
        radioInputs.forEach(radioInput => {
            radioInput.disabled = false;
        })
        // Show play again button.
        
        playAgainBtn.style = "visibility:visible;";
        playAgainBtn.disabled = false;
    },2000)
}

const displayDraw = () => {
    turnDisplay.innerHTML = "Stalemate!";
    turnDisplay.className = "text-secondary"; // Show winner

    // After a couple seconds, reset the visuals.
    setTimeout(() => {
        radioInputs.forEach(radioInput => {
            radioInput.disabled = false;
        })
        // show play again button.
        playAgainBtn.style = "visibility:visible;";
        playAgainBtn.disabled = false;
    },2000)
}


//If AI is X then play first
function aiStart(){
    if (aiTurn === turn && ai) {
        console.log('hi')
        let tileToMove = getAIMove(aiTurn)
        console.log(tileToMove)
        // tileToExecute = tiles[((y*3) + (x))];
        let tileToExecute = tiles[tileToMove];
        turnDisplayText = !turn  ? "X" : "O";
        turnDisplay.className = "";
        turnDisplay.innerHTML = turnDisplayText + "'s Turn."; // Display turn
        tileToExecute.innerHTML = turn  ? "X" : "O";
        let tmp = turn ? "text-danger" : "text-success";
        tileToExecute.className = "boardBlock col text-center " + tmp; // Display X or O on the tile pressed
        turn = !turn // Switch turns

        board[tileToMove] = !turn  ? "X" : "O"; // Reflect tile changes to board list so it can be checked for wins/draws and prevent cheating.
        checkIfWinner() // Check if there is a winner
        if (winner)  displayWinner() // If there is winner then display it.
        if (draw) displayDraw() // If there is a draw then display it.
    }
} aiStart()
