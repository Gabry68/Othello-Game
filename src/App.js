import { useState, useEffect } from 'react';
import { RotateCcw, Home, Trophy } from 'lucide-react';

const App = () => {
  const [gameState, setGameState] = useState('menu'); // menu, colorSelect, playing, gameOver
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [playerColor, setPlayerColor] = useState('');
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [winner, setWinner] = useState(null);

  const checkGameOver = (currentBoard) => {
    const hasBlackMoves = getValidMoves(currentBoard, 'black').length > 0;
    const hasWhiteMoves = getValidMoves(currentBoard, 'white').length > 0;

    if (!hasBlackMoves && !hasWhiteMoves) {
      const { black, white } = calculateScores(currentBoard);
      if (black > white) setWinner('black');
      else if (white > black) setWinner('white');
      else setWinner('draw');
      setGameState('gameOver');
      return true;
    }
    return false;
  };

  const getValidMoves = (currentBoard, player) => {
    const moves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMove(i, j, player, currentBoard)) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  };

  const calculateScores = (currentBoard) => {
    return currentBoard.reduce((acc, row) => {
      row.forEach(cell => {
        if (cell === 'black') acc.black++;
        if (cell === 'white') acc.white++;
      });
      return acc;
    }, { black: 0, white: 0 });
  };

  const initializeBoard = () => {
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    newBoard[3][3] = newBoard[4][4] = 'white';
    newBoard[3][4] = newBoard[4][3] = 'black';
    setBoard(newBoard);
    setCurrentPlayer('black');
    updateScores(newBoard);
    setWinner(null);
  };

  const restartGame = () => {
    setGameState('colorSelect');
    setBoard(Array(8).fill().map(() => Array(8).fill(null)));
    setCurrentPlayer('black');
    setScores({ black: 2, white: 2 });
    setWinner(null);
  };

  const returnToMenu = () => {
    setGameState('menu');
    setBoard(Array(8).fill().map(() => Array(8).fill(null)));
    setCurrentPlayer('black');
    setScores({ black: 2, white: 2 });
    setPlayerColor('');
    setWinner(null);
  };

  const updateScores = (currentBoard) => {
    const newScores = calculateScores(currentBoard);
    setScores(newScores);
  };

  const isValidMove = (row, col, player, currentBoard = board) => {
    if (currentBoard[row][col]) return false;
    
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],          [0,1],
      [1,-1],  [1,0],  [1,1]
    ];
    
    return directions.some(([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;
      let hasOpponent = false;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!currentBoard[r][c]) return false;
        if (currentBoard[r][c] === opponent) hasOpponent = true;
        if (currentBoard[r][c] === player) return hasOpponent;
        r += dr;
        c += dc;
      }
      return false;
    });
  };

  const flipDiscs = (row, col, player) => {
    const newBoard = board.map(row => [...row]);
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],          [0,1],
      [1,-1],  [1,0],  [1,1]
    ];
    
    newBoard[row][col] = player;
    
    directions.forEach(([dr, dc]) => {
      const toFlip = [];
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!newBoard[r][c]) break;
        if (newBoard[r][c] === opponent) {
          toFlip.push([r, c]);
        } else if (newBoard[r][c] === player) {
          toFlip.forEach(([fr, fc]) => {
            newBoard[fr][fc] = player;
          });
          break;
        }
        r += dr;
        c += dc;
      }
    });
    
    return newBoard;
  };

  const makeMove = (row, col) => {
    if (currentPlayer !== playerColor) return;
    if (!isValidMove(row, col, currentPlayer)) return;

    const newBoard = flipDiscs(row, col, currentPlayer);
    setBoard(newBoard);
    updateScores(newBoard);
    
    if (!checkGameOver(newBoard)) {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  const makeComputerMove = () => {
    const validMoves = getValidMoves(board, currentPlayer);
    
    if (validMoves.length > 0) {
      const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
      const newBoard = flipDiscs(row, col, currentPlayer);
      setBoard(newBoard);
      updateScores(newBoard);
      
      if (!checkGameOver(newBoard)) {
        setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
      }
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer !== playerColor) {
      const timer = setTimeout(makeComputerMove, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameState]);

  const selectColor = (color) => {
    setPlayerColor(color);
    setGameState('playing');
    initializeBoard();
    
    if (color === 'white') {
      setTimeout(() => {
        makeComputerMove();
      }, 500);
    }
  };

  const GameOverModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <div className="mb-6">
          {winner === 'draw' ? (
            <p>It's a draw!</p>
          ) : (
            <p>
              {winner === playerColor ? "You won!" : "Computer won!"}
              <br />
              <span className="text-sm text-gray-400">
                Black: {scores.black} - White: {scores.white}
              </span>
            </p>
          )}
        </div>
        <div className="space-y-2">
          <button 
            onClick={restartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button 
            onClick={returnToMenu}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {gameState === 'menu' && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Othello</h1>
          <p className="text-gray-400 italic mb-8">A minute to learn... a lifetime to master.</p>
          <button 
            onClick={() => setGameState('colorSelect')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition-colors"
          >
            New Game
          </button>
        </div>
      )}

      {gameState === 'colorSelect' && (
        <div className="text-center mb-8">
          <h2 className="text-2xl mb-4">Choose your color:</h2>
          <div className="space-x-4">
            <button 
              onClick={() => selectColor('black')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Black
            </button>
            <button 
              onClick={() => selectColor('white')}
              className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg transition-colors"
            >
              White
            </button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'gameOver') && (
        <>
          <div className="flex justify-between items-center w-full max-w-2xl mb-4">
            <div className="flex space-x-4">
              <button 
                onClick={restartGame}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw size={20} />
                <span>Restart</span>
              </button>
              <button 
                onClick={returnToMenu}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Home size={20} />
                <span>Menu</span>
              </button>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
                <span>{scores.black}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <span>{scores.white}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-lg max-w-2xl w-full">
            {board.map((row, i) => (
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => makeMove(i, j)}
                  className="aspect-square bg-green-600 rounded cursor-pointer relative hover:bg-green-500 transition-colors"
                >
                  {cell && (
                    <div className={`
                      absolute inset-2 rounded-full transition-all transform
                      ${cell === 'black' ? 'bg-gray-900' : 'bg-white'}
                      ${isValidMove(i, j, currentPlayer) ? 'scale-95' : 'scale-100'}
                    `} />
                  )}
                </div>
              ))
            ))}
          </div>
          
          {gameState === 'playing' && (
            <div className="mt-4 text-lg">
              {currentPlayer === playerColor ? 
                "Your turn" : 
                "Computer is thinking..."
              }
            </div>
          )}
          
          {gameState === 'gameOver' && <GameOverModal />}
        </>
      )}
    </div>
  );
};

export default App;