import React, { useRef, useEffect, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const BASE_SPEED = 150;

type Point = { x: number; y: number };

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scoreState, setScoreState] = useState(0);
  const [highScoreState, setHighScoreState] = useState(0);
  const [gameOverState, setGameOverState] = useState(true);

  // Mutable Game State (avoids React re-renders for every frame)
  const snake = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dir = useRef<Point>({ x: 0, y: -1 });
  const nextDir = useRef<Point>({ x: 0, y: -1 });
  const food = useRef<Point>({ x: 5, y: 5 });
  const score = useRef<number>(0);
  const highScore = useRef<number>(0);
  const gameOver = useRef<boolean>(true);
  const lastMoveTime = useRef<number>(0);
  const animationId = useRef<number>(0);

  // ResizeObserver setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: number;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          const size = Math.min(width, height);
          setDimensions({ width: size, height: size });
        }
      }, 100);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const setGameOvers = (isOver: boolean) => {
    gameOver.current = isOver;
    setGameOverState(isOver);
  };
  const setScores = (s: number) => {
    score.current = s;
    setScoreState(s);
  };
  const setHighScores = (s: number) => {
    highScore.current = s;
    setHighScoreState(s);
  };

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        return newFood;
      }
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellSize = w / GRID_SIZE;

    // Draw snake
    snake.current.forEach((segment, idx) => {
      if (idx === 0) {
        ctx.fillStyle = '#f0f';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f0f';
      } else {
        ctx.fillStyle = '#0ff';
        ctx.globalAlpha = 0.8;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#0ff';
      }
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
      ctx.globalAlpha = 1.0;
    });

    // Draw food
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillRect(food.current.x * cellSize + 1, food.current.y * cellSize + 1, cellSize - 2, cellSize - 2);
    ctx.shadowBlur = 0; // reset
  }, []);

  const checkCollision = (head: Point, currentSnake: Point[]) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) return true;
    const body = currentSnake.slice(0, -1);
    if (body.some(segment => segment.x === head.x && segment.y === head.y)) return true;
    return false;
  };

  const gameLoop = useCallback((time: number) => {
    if (gameOver.current) return;

    const currentSpeed = Math.max(50, BASE_SPEED - Math.floor(score.current / 500) * 10);
    
    if (time - lastMoveTime.current >= currentSpeed) {
      lastMoveTime.current = time;
      
      dir.current = nextDir.current;
      const head = snake.current[0];
      const newHead = { x: head.x + dir.current.x, y: head.y + dir.current.y };

      if (checkCollision(newHead, snake.current)) {
        setGameOvers(true);
        if (score.current > highScore.current) {
          setHighScores(score.current);
        }
        return;
      }

      const newSnake = [newHead, ...snake.current];

      if (newHead.x === food.current.x && newHead.y === food.current.y) {
        setScores(score.current + 100);
        food.current = generateFood(newSnake);
      } else {
        newSnake.pop();
      }
      snake.current = newSnake;
    }

    draw();
    animationId.current = requestAnimationFrame(gameLoop);
  }, [draw, generateFood]);

  const startGame = () => {
    snake.current = [{ x: 10, y: 10 }];
    dir.current = { x: 0, y: -1 };
    nextDir.current = { x: 0, y: -1 };
    setScores(0);
    setGameOvers(false);
    food.current = generateFood(snake.current);
    lastMoveTime.current = performance.now();
    if (animationId.current) cancelAnimationFrame(animationId.current);
    animationId.current = requestAnimationFrame(gameLoop);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver.current && e.key === ' ') {
        startGame();
        return;
      }

      const currentDir = dir.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (currentDir.y !== 1) nextDir.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (currentDir.y !== -1) nextDir.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (currentDir.x !== 1) nextDir.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (currentDir.x !== -1) nextDir.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redraw when dimensions change
  useEffect(() => {
    draw();
  }, [dimensions, draw]);

  return (
    <div className="flex flex-col items-center w-full max-w-[500px]">
      <div className="w-full flex justify-between mb-4 px-2 font-mono text-xl tracking-widest text-[#0ff]">
        <div>SCORE:[{scoreState.toString().padStart(5, '0')}]</div>
        <div>HIGH:[{highScoreState.toString().padStart(5, '0')}]</div>
      </div>
      
      <div ref={containerRef} className="relative w-full aspect-square neon-border bg-[#050505] p-1 flex justify-center items-center">
        {dimensions.width > 0 && (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="block w-full h-full"
          />
        )}

        {gameOverState && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center crt-flicker z-20 backdrop-blur-sm">
            <h2 className="text-4xl text-[#f0f] mb-4 glitch-text font-mono" data-text="SYSTEM FAILURE">
              SYSTEM FAILURE
            </h2>
            <p className="text-[#0ff] mb-6 text-lg animate-pulse tracking-widest text-center">
              AWAITING [SPACE] TO INITIALIZE
            </p>
            <button 
              onClick={startGame}
              className="px-6 py-4 min-h-[44px] min-w-[44px] neon-border text-[#0ff] font-mono text-xl hover:bg-[#0ff] hover:text-black transition-colors"
            >
              &gt; REBOOT CORE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
