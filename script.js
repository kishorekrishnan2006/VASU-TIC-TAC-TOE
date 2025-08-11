document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0 };
    let gameCount = 1;
    let vsComputer = true;
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const currentTurnDisplay = document.getElementById('current-turn');
    const score1Display = document.getElementById('score1');
    const score2Display = document.getElementById('score2');
    const gameCountDisplay = document.getElementById('game-count');
    const restartBtn = document.getElementById('restart-btn');
    const modal = document.getElementById('game-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const newGameBtn = document.getElementById('new-game-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const player1Card = document.getElementById('player1');
    const player2Card = document.getElementById('player2');
    // Audio elements
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');
    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    // Initialize game
    function initGame() {
        board.fill('');
        currentPlayer = 'X';
        gameActive = true;
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winner');
            cell.textContent = '';
        });
        updateTurnDisplay();
        highlightCurrentPlayer();
    }
    // Update whose turn it is
    function updateTurnDisplay() {
        currentTurnDisplay.textContent = `${currentPlayer}'s Turn`;
    }
    // Highlight current player's card
    function highlightCurrentPlayer() {
        if (currentPlayer === 'X') {
            player1Card.classList.add('glow');
            player2Card.classList.remove('glow');
        } else {
            player1Card.classList.remove('glow');
            player2Card.classList.add('glow');
        }
    }
    // Handle cell click
    function handleCellClick(e) {
        if (!gameActive) return;
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        if (board[index] !== '') return;
        // Make move
        board[index] = currentPlayer;
        playSound(clickSound);
        renderBoard();
        // Check for win or draw
        if (checkWin()) {
            gameActive = false;
            scores[currentPlayer]++;
            updateScores();
            highlightWinningCells();
            playSound(winSound);
            showModal(`${currentPlayer} wins!`, `Player ${currentPlayer} has won the game!`);
            return;
        }
        if (checkDraw()) {
            gameActive = false;
            playSound(drawSound);
            showModal("Draw!", "The game ended in a draw!");
            return;
        }
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnDisplay();
        highlightCurrentPlayer();
        // Computer move only in PvE mode
        if (vsComputer && currentPlayer === 'O' && gameActive) {
            setTimeout(makeComputerMove, 600);
        }
    }
    // Make a computer move (simple AI)
    function makeComputerMove() {
        if (!gameActive || !vsComputer) return;
        const difficulty = document.getElementById('difficulty').value;
        // Try to win first
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
                makeMove(c);
                return;
            }
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') {
                makeMove(b);
                return;
            }
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') {
                makeMove(a);
                return;
            }
        }
        // Block player from winning
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'X' && board[b] === 'X' && board[c] === '') {
                makeMove(c);
                return;
            }
            if (board[a] === 'X' && board[c] === 'X' && board[b] === '') {
                makeMove(b);
                return;
            }
            if (board[b] === 'X' && board[c] === 'X' && board[a] === '') {
                makeMove(a);
                return;
            }
        }
        // Take center if available
        if (board[4] === '') {
            makeMove(4);
            return;
        }
        // Take a random available corner
        const corners = [0, 2, 6, 8].filter(index => board[index] === '');
        if (corners.length > 0) {
            const randomCorner = corners[Math.floor(Math.random() * corners.length)];
            makeMove(randomCorner);
            return;
        }
        // Take any available cell
        const availableCells = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') availableCells.push(i);
        }
        if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            makeMove(availableCells[randomIndex]);
        }
    }
    // Helper function for computer move
    function makeMove(index) {
        board[index] = currentPlayer;
        playSound(clickSound);
        renderBoard();
        if (checkWin()) {
            gameActive = false;
            scores[currentPlayer]++;
            updateScores();
            highlightWinningCells();
            playSound(winSound);
            showModal(`${currentPlayer} wins!`, `Player ${currentPlayer} has won the game!`);
            return;
        }
        if (checkDraw()) {
            gameActive = false;
            playSound(drawSound);
            showModal("Draw!", "The game ended in a draw!");
            return;
        }
        currentPlayer = 'X';
        updateTurnDisplay();
        highlightCurrentPlayer();
    }
    // Render the board
    function renderBoard() {
        cells.forEach((cell, index) => {
            if (board[index] !== '') {
                cell.classList.add(board[index].toLowerCase());
            }
        });
    }
    // Check for a win
    function checkWin() {
        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
        });
    }
    // Check for a draw
    function checkDraw() {
        return board.every(cell => cell !== '');
    }
    // Highlight the winning cells
    function highlightWinningCells() {
        const winningCombo = winningCombinations.find(combination => {
            const [a, b, c] = combination;
            return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
        });
        if (winningCombo) {
            winningCombo.forEach(index => {
                cells[index].classList.add('winner');
            });
        }
    }
    // Update scores
    function updateScores() {
        score1Display.textContent = scores['X'];
        score2Display.textContent = scores['O'];
    }
    // Game history
    const gameHistory = [];
    // Show modal
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
        // Add to history
        const historyEntry = {
            game: gameCount,
            winner: title.includes('Draw') ? 'Draw' : currentPlayer,
            date: new Date().toLocaleString()
        };
        gameHistory.push(historyEntry);
        updateHistoryLog();
    }
    function updateHistoryLog() {
        const historyLog = document.getElementById('history-log');
        historyLog.innerHTML = gameHistory.map(entry => 
            `<div class="text-sm">
                Game ${entry.game}: ${entry.winner} - ${entry.date}
            </div>`
        ).join('');
    }
    document.getElementById('clear-history').addEventListener('click', () => {
        gameHistory.length = 0;
        updateHistoryLog();
    });
    // Sound control
    let soundEnabled = true;
    function playSound(audio) {
        if (soundEnabled) {
            audio.currentTime = 0;
            audio.play();
        }
    }
    document.getElementById('toggle-sound').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const soundBtn = document.getElementById('toggle-sound');
        soundBtn.textContent = soundEnabled ? '🔈 Sound On' : '🔇 Sound Off';
    });
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    restartBtn.addEventListener('click', () => {
        gameCount++;
        gameCountDisplay.textContent = gameCount;
        initGame();
    });
    newGameBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        gameCount++;
        gameCountDisplay.textContent = gameCount;
        initGame();
    });
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    // Initialize the game
    initGame();
    // Game mode handling
    document.getElementById('pve-mode').addEventListener('click', () => {
        vsComputer = true;
        document.getElementById('player2-name').textContent = 'Computer';
        initGame();
    });
    document.getElementById('pvp-mode').addEventListener('click', () => {
        vsComputer = false;
        document.getElementById('player2-name').textContent = 'Player 2';
        initGame();
    });
});
