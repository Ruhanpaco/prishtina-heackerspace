"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PongProps {
    onClose: () => void;
}

export function TerminalPong({ onClose }: PongProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const [score, setScore] = useState({ player: 0, ai: 0 });

    // Game Constants
    const PADDLE_HEIGHT = 4; // in character blocks approx
    const PADDLE_CHAR = "|";
    const BALL_CHAR = "0";
    const WALL_CHAR = "=";
    const NET_CHAR = ":";

    // Game State
    const gameState = useRef({
        ball: { x: 40, y: 15, dx: 0.5, dy: 0.3 },
        playerY: 12,
        aiY: 12,
        width: 80,
        height: 24,
        running: true
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Reset running state for Strict Mode / Remounts
        gameState.current.running = true;

        // Simple text-based renderer on canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set dimensions based on char size
        const CHAR_WIDTH = 10;
        const CHAR_HEIGHT = 18;
        canvas.width = gameState.current.width * CHAR_WIDTH;
        canvas.height = gameState.current.height * CHAR_HEIGHT;

        const render = () => {
            if (!gameState.current.running) return;

            // Draw Background
            ctx.fillStyle = "#0a0a0f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "16px monospace";
            ctx.fillStyle = "#00ff00";
            ctx.textBaseline = "top";

            const { width, height, ball, playerY, aiY } = gameState.current;

            // Draw Walls
            for (let x = 0; x < width; x++) {
                ctx.fillText(WALL_CHAR, x * CHAR_WIDTH, 0);
                ctx.fillText(WALL_CHAR, x * CHAR_WIDTH, (height - 1) * CHAR_HEIGHT);
            }

            // Draw Net
            for (let y = 1; y < height - 1; y += 2) {
                ctx.fillText(NET_CHAR, (width / 2) * CHAR_WIDTH, y * CHAR_HEIGHT);
            }

            // Draw Paddles
            for (let i = 0; i < PADDLE_HEIGHT; i++) {
                ctx.fillText(PADDLE_CHAR, 2 * CHAR_WIDTH, (Math.floor(playerY) + i) * CHAR_HEIGHT);
                ctx.fillText(PADDLE_CHAR, (width - 3) * CHAR_WIDTH, (Math.floor(aiY) + i) * CHAR_HEIGHT);
            }

            // Draw Ball
            ctx.fillText(BALL_CHAR, Math.floor(ball.x) * CHAR_WIDTH, Math.floor(ball.y) * CHAR_HEIGHT);
        };

        const update = () => {
            if (!gameState.current.running) return;

            const state = gameState.current;

            // Move Ball
            state.ball.x += state.ball.dx;
            state.ball.y += state.ball.dy;

            // Collision with Top/Bottom Walls (Simple bounce)
            if (state.ball.y <= 1 || state.ball.y >= state.height - 2) {
                state.ball.dy *= -1;
            }

            // AI Movement (Simple tracking)
            if (state.aiY + PADDLE_HEIGHT / 2 < state.ball.y) {
                state.aiY += 0.2; // Speed
            } else {
                state.aiY -= 0.2;
            }
            // Clamp AI
            state.aiY = Math.max(1, Math.min(state.height - 1 - PADDLE_HEIGHT, state.aiY));


            // Paddle Collision - Player
            if (
                state.ball.x <= 3 &&
                state.ball.x >= 2 &&
                state.ball.y >= state.playerY &&
                state.ball.y <= state.playerY + PADDLE_HEIGHT
            ) {
                state.ball.dx = Math.abs(state.ball.dx) * 1.1; // Speed up and bounce right
                // Add some spin based on where hit
                state.ball.dy += (state.ball.y - (state.playerY + PADDLE_HEIGHT / 2)) * 0.1;
            }

            // Paddle Collision - AI
            if (
                state.ball.x >= state.width - 4 &&
                state.ball.x <= state.width - 3 &&
                state.ball.y >= state.aiY &&
                state.ball.y <= state.aiY + PADDLE_HEIGHT
            ) {
                state.ball.dx = -Math.abs(state.ball.dx) * 1.1; // Speed up and bounce left
                state.ball.dy += (state.ball.y - (state.aiY + PADDLE_HEIGHT / 2)) * 0.1;
            }


            // Scoring / Reset
            if (state.ball.x < 0) {
                // AI scores
                setScore(s => ({ ...s, ai: s.ai + 1 }));
                resetBall(state);
            } else if (state.ball.x > state.width) {
                // Player scores
                setScore(s => ({ ...s, player: s.player + 1 }));
                resetBall(state);
            }
        };

        const resetBall = (state: any) => {
            state.ball.x = state.width / 2;
            state.ball.y = state.height / 2;
            state.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 0.5;
            state.ball.dy = (Math.random() > 0.5 ? 1 : -1) * 0.3;
        };

        const loop = () => {
            update();
            render();
            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);

        // Input Handling
        const handleKeyDown = (e: KeyboardEvent) => {
            const speed = 2;
            if (e.key === "ArrowUp" || e.key === "w") {
                gameState.current.playerY = Math.max(1, gameState.current.playerY - speed);
            }
            if (e.key === "ArrowDown" || e.key === "s") {
                gameState.current.playerY = Math.min(gameState.current.height - 1 - PADDLE_HEIGHT, gameState.current.playerY + speed);
            }
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            gameState.current.running = false;
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="flex flex-col items-center justify-center p-4 border border-[#00ff00]/30 rounded bg-black/90 backdrop-blur-sm max-w-4xl mx-auto my-8 animate-in zoom-in-95 font-mono">
            <div className="flex justify-between w-full mb-2 text-[#00ff00] text-sm font-bold uppercase tracking-widest px-4">
                <span>PLAYER: {score.player}</span>
                <span>TYPE 'ESC' TO EXIT</span>
                <span>CPU: {score.ai}</span>
            </div>
            <canvas ref={canvasRef} className="border border-[#00ff00]/50 shadow-[0_0_15px_rgba(0,255,0,0.2)] max-w-full" />

            <div className="mt-4 text-[#00ff00]/60 text-xs uppercase tracking-wider text-center">
                Controls: [W / ARROW UP] - Up | [S / ARROW DOWN] - Down
            </div>
        </div>
    );
}
