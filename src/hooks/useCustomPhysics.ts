import { useRef, useCallback, useMemo, useState } from 'react';

/**
 * Custom Exponential Decay Easing Function
 * Formula: f(t) = 1 - 2^(-10t)
 * This creates a smooth deceleration curve for natural motion
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export const customExpoEase = (t: number): number => {
    // Mathematical explanation:
    // - 2^(-10t) creates an exponential decay
    // - Subtracting from 1 inverts the curve for ease-out behavior
    // - As t approaches 1, the value approaches 1 smoothly
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

/**
 * Custom Bezier Curve for Non-linear Parallax Depth
 * Implements cubic bezier with control points for smooth parallax motion
 * @param t - Progress value
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @returns Bezier curve value
 */
export const customBezier = (
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
): number => {
    // Cubic Bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const oneMinusT = 1 - t;
    return (
        oneMinusT * oneMinusT * oneMinusT * p0 +
        3 * oneMinusT * oneMinusT * t * p1 +
        3 * oneMinusT * t * t * p2 +
        t * t * t * p3
    );
};

interface Position {
    x: number;
    y: number;
}

interface SpringPhysicsConfig {
    stiffness?: number;
    damping?: number;
}

/**
 * Spring Physics Engine for Magnetic Cursor
 * Implements damped harmonic oscillator for natural spring motion
 */
class SpringPhysicsEngine {
    position: Position;
    velocity: Position;
    target: Position;
    stiffness: number;
    damping: number;

    constructor(stiffness = 0.15, damping = 0.25) {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };

        // Physics constants
        this.stiffness = stiffness; // Spring constant (k)
        this.damping = damping;     // Damping coefficient (c)
    }

    /**
     * Update spring physics simulation
     * Physics equation: F = -kx - cv
     * where k = stiffness, x = displacement, c = damping, v = velocity
     */
    update(): Position {
        // Calculate displacement from target (Hooke's Law)
        const dx = this.target.x - this.position.x;
        const dy = this.target.y - this.position.y;

        // Apply spring force: F = -k * displacement
        const forceX = dx * this.stiffness;
        const forceY = dy * this.stiffness;

        // Update velocity with force and damping
        // Damping force: F_damp = -c * velocity
        this.velocity.x += forceX;
        this.velocity.y += forceY;
        this.velocity.x *= (1 - this.damping);
        this.velocity.y *= (1 - this.damping);

        // Update position with velocity (Euler integration)
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        return this.position;
    }

    setTarget(x: number, y: number): void {
        this.target.x = x;
        this.target.y = y;
    }
}

/**
 * React Hook for Spring Physics
 * Provides a spring physics simulation for smooth animations
 * Returns a stable reference that won't cause re-renders
 */
export const useSpringPhysics = ({ stiffness = 0.15, damping = 0.25 }: SpringPhysicsConfig = {}) => {
    // Stable initialization via useState to avoid accessing ref during render
    const [spring] = useState(() => new SpringPhysicsEngine(stiffness, damping));

    return {
        setTarget: (x: number, y: number) => spring.setTarget(x, y),
        update: () => spring.update() ?? { x: 0, y: 0 },
        spring
    };
};

/**
 * Split text into individual characters for animation
 */
export const splitTextToChars = (text: string): string[] => {
    return text.split('').map(char => char === ' ' ? '\u00A0' : char);
};

/**
 * Split text into individual words for animation
 */
export const splitTextToWords = (text: string): string[] => {
    return text.split(' ');
};
