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

        // Computer move (PvE)
        if (vsComputer && currentPlayer === 'O' && gameActive) {
            setTimeout(makeComputerMove, 600);
        }
    }

    // Make a computer move (simple AI)
    function makeComputerMove() {
        if (!gameActive || !vsComputer) return;

        // Try to win first
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return makeMove(c);
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return makeMove(b);
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return makeMove(a);
        }

        // Block player from winning
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return makeMove(c);
            if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return makeMove(b);
            if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return makeMove(a);
        }

        // Take center
        if (board[4] === '') return makeMove(4);

        // Take random corner
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length > 0) return makeMove(corners[Math.floor(Math.random() * corners.length)]);

        // Take any available cell
        const availableCells = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
        if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            makeMove(availableCells[randomIndex]);
        }
    }

    // Helper for computer move
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

    // Render board
    function renderBoard() {
        cells.forEach((cell, i) => {
            if (board[i] !== '') {
                cell.classList.add(board[i].toLowerCase());
            }
        });
    }

    // Check win
    function checkWin() {
        return winningCombinations.some(([a, b, c]) =>
            board[a] !== '' && board[a] === board[b] && board[a] === board[c]
        );
    }

    // Check draw
    function checkDraw() {
        return board.every(cell => cell !== '');
    }

    // Highlight winning cells
    function highlightWinningCells() {
        const winningCombo = winningCombinations.find(([a, b, c]) =>
            board[a] !== '' && board[a] === board[b] && board[a] === board[c]
        );
        if (winningCombo) winningCombo.forEach(i => cells[i].classList.add('winner'));
    }

    // Update scores
    function updateScores() {
        score1Display.textContent = scores['X'];
        score2Display.textContent = scores['O'];
    }

    // Game history
    const gameHistory = [];
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
        gameHistory.push({
            game: gameCount,
            winner: title.includes('Draw') ? 'Draw' : currentPlayer,
            date: new Date().toLocaleString()
        });
        updateHistoryLog();
    }
    function updateHistoryLog() {
        const historyLog = document.getElementById('history-log');
        historyLog.innerHTML = gameHistory.map(entry =>
            `<div class="text-sm">Game ${entry.game}: ${entry.winner} - ${entry.date}</div>`
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
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
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
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // Game mode switch
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

    // Start
    initGame();
});extContent = 'Player 2';
        initGame();
    });
});    // --- Winning Combinations (from script.js) ---
    private final int[][] winningCombinations = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // rows
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // columns
        {0, 4, 8}, {2, 4, 6}             // diagonals
    };

    public TicTacToe() {
        // --- Window Setup ---
        setTitle("VASU TIC TAC TOE - Java Edition");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(600, 700);
        setLocationRelativeTo(null); // Center the window
        setLayout(new BorderLayout(10, 10));
        getContentPane().setBackground(new Color(15, 23, 42)); // Dark background

        // --- Top Panel (Player Info & Scores) ---
        JPanel topPanel = new JPanel(new GridLayout(1, 3, 10, 0));
        topPanel.setOpaque(false);
        topPanel.setBorder(new EmptyBorder(10, 10, 10, 10));

        // Restart and Difficulty Panel
        JPanel restartPanel = new JPanel();
        restartPanel.setOpaque(false);
        JButton restartBtn = new JButton("Restart Game");
        restartBtn.addActionListener(e -> restartGame(false));
        restartPanel.add(restartBtn);

        topPanel.add(player1Card);
        topPanel.add(restartPanel);
        topPanel.add(player2Card);

        add(topPanel, BorderLayout.NORTH);

        // --- Center Panel (Game Board) ---
        JPanel boardPanel = new JPanel(new GridLayout(3, 3, 10, 10));
        boardPanel.setOpaque(false);
        boardPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        for (int i = 0; i < 9; i++) {
            cells[i] = new JButton("");
            cells[i].setFont(new Font("Arial", Font.BOLD, 80));
            cells[i].setBackground(new Color(30, 41, 59));
            cells[i].setForeground(Color.WHITE);
            cells[i].setFocusable(false);
            final int index = i;
            cells[i].addActionListener(e -> handleMove(index));
            boardPanel.add(cells[i]);
        }
        add(boardPanel, BorderLayout.CENTER);


        // --- Bottom Panel (Controls, Status, and History) ---
        JPanel bottomContainer = new JPanel(new BorderLayout(10,10));
        bottomContainer.setOpaque(false);
        bottomContainer.setBorder(new EmptyBorder(10, 10, 10, 10));

        // Status and Game Count
        JPanel statusPanel = new JPanel(new GridLayout(1,2,10,0));
        statusPanel.setOpaque(false);
        statusPanel.add(createStatusCard("TURN", currentTurnLabel));
        statusPanel.add(createStatusCard("GAME", gameCountLabel));
        
        // Game Mode Buttons
        JPanel modePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        modePanel.setOpaque(false);
        JButton pveBtn = new JButton("Player vs Computer");
        pveBtn.addActionListener(e -> setGameMode(true));
        JButton pvpBtn = new JButton("Player vs Player");
        pvpBtn.addActionListener(e -> setGameMode(false));
        modePanel.add(pveBtn);
        modePanel.add(pvpBtn);

        // History Panel
        JPanel historyPanel = new JPanel(new BorderLayout(0, 5));
        historyPanel.setOpaque(false);
        historyPanel.setBorder(BorderFactory.createTitledBorder(
            BorderFactory.createLineBorder(Color.GRAY), "Game History", 0, 0, null, Color.WHITE)
        );
        historyLog.setEditable(false);
        historyLog.setBackground(new Color(30, 41, 59));
        historyLog.setForeground(Color.WHITE);
        JScrollPane scrollPane = new JScrollPane(historyLog);
        JButton clearHistoryBtn = new JButton("Clear History");
        clearHistoryBtn.addActionListener(e -> {
            gameHistory.clear();
            updateHistoryLog();
        });
        historyPanel.add(scrollPane, BorderLayout.CENTER);
        historyPanel.add(clearHistoryBtn, BorderLayout.SOUTH);

        bottomContainer.add(statusPanel, BorderLayout.NORTH);
        bottomContainer.add(historyPanel, BorderLayout.CENTER);
        bottomContainer.add(modePanel, BorderLayout.SOUTH);

        add(bottomContainer, BorderLayout.SOUTH);

        highlightCurrentPlayer();
        setVisible(true);
    }

    // --- Game Logic Methods (from script.js) ---

    private void handleMove(int index) {
        if (!gameActive || board[index] != 0) {
            return;
        }

        board[index] = (currentPlayer.equals("X")) ? 1 : 2;
        cells[index].setText(currentPlayer);
        cells[index].setForeground(currentPlayer.equals("X") ? new Color(79, 70, 229) : new Color(219, 39, 119));

        if (checkWin()) {
            endGame(currentPlayer + " wins!");
            highlightWinningCells();
            return;
        }

        if (checkDraw()) {
            endGame("It's a Draw!");
            return;
        }

        switchPlayer();

        if (vsComputer && currentPlayer.equals("O")) {
            // Delay computer move to feel more natural
            Timer timer = new Timer(500, e -> makeComputerMove());
            timer.setRepeats(false);
            timer.start();
        }
    }

    private void makeComputerMove() {
        if (!gameActive) return;

        // Strategy: 1. Win, 2. Block, 3. Center, 4. Corner, 5. Random
        int move = findWinningMove(2); // Try to win (O is 2)
        if (move == -1) {
            move = findWinningMove(1); // Try to block (X is 1)
        }
        if (move == -1 && board[4] == 0) {
            move = 4; // Take center
        }
        if (move == -1) {
            int[] corners = {0, 2, 6, 8};
            List<Integer> availableCorners = new ArrayList<>();
            for (int c : corners) {
                if (board[c] == 0) {
                    availableCorners.add(c);
                }
            }
            if (!availableCorners.isEmpty()) {
                move = availableCorners.get(new Random().nextInt(availableCorners.size()));
            }
        }
        if (move == -1) {
            List<Integer> available = new ArrayList<>();
            for (int i = 0; i < 9; i++) {
                if (board[i] == 0) {
                    available.add(i);
                }
            }
            if (!available.isEmpty()) {
                move = available.get(new Random().nextInt(available.size()));
            }
        }
        
        if (move != -1) {
            handleMove(move);
        }
    }
    
    private int findWinningMove(int playerValue) {
        for (int[] combo : winningCombinations) {
            int a = combo[0], b = combo[1], c = combo[2];
            if (board[a] == playerValue && board[b] == playerValue && board[c] == 0) return c;
            if (board[a] == playerValue && board[c] == playerValue && board[b] == 0) return b;
            if (board[b] == playerValue && board[c] == playerValue && board[a] == 0) return a;
        }
        return -1;
    }

    private void switchPlayer() {
        currentPlayer = (currentPlayer.equals("X")) ? "O" : "X";
        currentTurnLabel.setText(currentPlayer + "'s Turn");
        highlightCurrentPlayer();
    }
    
    private boolean checkWin() {
        for (int[] combo : winningCombinations) {
            if (board[combo[0]] != 0 &&
                board[combo[0]] == board[combo[1]] &&
                board[combo[1]] == board[combo[2]]) {
                return true;
            }
        }
        return false;
    }

    private boolean checkDraw() {
        for (int cell : board) {
            if (cell == 0) {
                return false;
            }
        }
        return true;
    }

    private void endGame(String message) {
        gameActive = false;
        String winner = "Draw";
        if (message.contains("X wins")) {
            scoreX++;
            winner = "X";
        } else if (message.contains("O wins")) {
            scoreO++;
            winner = "O";
        }
        updateScores();
        logGameResult(winner);
        
        // Show modal dialog (like the web version)
        int choice = JOptionPane.showOptionDialog(this,
            message,
            "Game Over",
            JOptionPane.YES_NO_OPTION,
            JOptionPane.INFORMATION_MESSAGE,
            null,
            new String[]{"New Game", "Close"},
            "New Game");
            
        if (choice == JOptionPane.YES_OPTION) {
            restartGame(true);
        }
    }

    private void restartGame(boolean fromModal) {
        if (!fromModal) { // only increment if restart button is pressed, not from "New Game"
             gameCount++;
        }
        gameActive = true;
        currentPlayer = "X";
        Arrays.fill(board, 0);

        for (int i = 0; i < 9; i++) {
            cells[i].setText("");
            cells[i].setBackground(new Color(30, 41, 59));
        }

        currentTurnLabel.setText("X's Turn");
        gameCountLabel.setText(String.valueOf(gameCount));
        highlightCurrentPlayer();
    }
    
    private void setGameMode(boolean isVsComputer) {
        vsComputer = isVsComputer;
        player2NameLabel.setText(vsComputer ? "Computer" : "Player 2");
        scoreX = 0;
        scoreO = 0;
        gameCount = 1;
        updateScores();
        gameHistory.clear();
        updateHistoryLog();
        restartGame(true);
    }
    
    // --- UI Helper Methods ---

    private void updateScores() {
        scoreLabelX.setText(String.valueOf(scoreX));
        scoreLabelO.setText(String.valueOf(scoreO));
    }

    private void highlightWinningCells() {
        for (int[] combo : winningCombinations) {
            if (board[combo[0]] != 0 &&
                board[combo[0]] == board[combo[1]] &&
                board[combo[1]] == board[combo[2]]) {
                cells[combo[0]].setBackground(Color.GREEN);
                cells[combo[1]].setBackground(Color.GREEN);
                cells[combo[2]].setBackground(Color.GREEN);
                return;
            }
        }
    }
    
    private void highlightCurrentPlayer() {
        if (currentPlayer.equals("X")) {
            player1Card.setBorder(BorderFactory.createLineBorder(new Color(79, 70, 229), 3));
            player2Card.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 1));
        } else {
            player2Card.setBorder(BorderFactory.createLineBorder(new Color(219, 39, 119), 3));
            player1Card.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 1));
        }
    }
    
    private void logGameResult(String winner) {
        String timestamp = new SimpleDateFormat("HH:mm:ss").format(new Date());
        String entry = String.format("Game %d: %s won - %s", gameCount, winner, timestamp);
        gameHistory.add(entry);
        updateHistoryLog();
        gameCount++; // Prepare for the next game
        gameCountLabel.setText(String.valueOf(gameCount));
    }

    private void updateHistoryLog() {
        StringBuilder historyText = new StringBuilder();
        for (String entry : gameHistory) {
            historyText.append(entry).append("\n");
        }
        historyLog.setText(historyText.toString());
    }

    // --- UI Component Factory Methods ---

    private JPanel createPlayerCard(String title, String name, JLabel scoreLabel, String symbol, Color color) {
        JPanel card = new JPanel(new BorderLayout(10, 0));
        card.setBackground(new Color(30, 41, 59));
        card.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 1));
        card.setBorder(new EmptyBorder(10, 10, 10, 10));

        JLabel symbolLabel = new JLabel(symbol);
        symbolLabel.setFont(new Font("Arial", Font.BOLD, 24));
        symbolLabel.setForeground(color);
        symbolLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JPanel namePanel = new JPanel(new GridLayout(2, 1));
        namePanel.setOpaque(false);
        JLabel titleLabel = new JLabel(title);
        titleLabel.setForeground(Color.LIGHT_GRAY);
        titleLabel.setFont(new Font("Arial", Font.PLAIN, 12));
        player2NameLabel.setForeground(Color.WHITE);
        player2NameLabel.setFont(new Font("Arial", Font.BOLD, 16));
        
        namePanel.add(titleLabel);
        namePanel.add( (symbol.equals("X")) ? new JLabel(name) {{setForeground(Color.WHITE); setFont(new Font("Arial", Font.BOLD, 16));}} : player2NameLabel);

        scoreLabel.setFont(new Font("Arial", Font.BOLD, 24));
        scoreLabel.setForeground(Color.WHITE);
        
        card.add(symbolLabel, BorderLayout.WEST);
        card.add(namePanel, BorderLayout.CENTER);
        card.add(scoreLabel, BorderLayout.EAST);
        return card;
    }
    
    private JPanel createStatusCard(String title, JLabel valueLabel) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(new Color(30, 41, 59));
        card.setBorder(new EmptyBorder(5, 10, 5, 10));
        
        JLabel titleLabel = new JLabel(title);
        titleLabel.setForeground(Color.LIGHT_GRAY);
        titleLabel.setFont(new Font("Arial", Font.PLAIN, 12));
        
        valueLabel.setForeground(Color.WHITE);
        valueLabel.setFont(new Font("Arial", Font.BOLD, 16));
        valueLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        card.add(titleLabel, BorderLayout.NORTH);
        card.add(valueLabel, BorderLayout.CENTER);
        return card;
    }

    // --- Main Method to Run the Game ---
    public static void main(String[] args) {
        // Ensures the UI is created on the Event Dispatch Thread
        SwingUtilities.invokeLater(TicTacToe::new);
    }
    }        gameActive = true;
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



