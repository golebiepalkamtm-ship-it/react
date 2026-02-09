/**
 * HIGH-PERFORMANCE ANIMATION CONTROLLER ARCHITECTURE
 * 
 * 1. PhysicsUtils (The Math)
 *    - Pure, static math functions for consistency and performance.
 *    - Pre-allocated objects where possible to avoid garbage collection.
 * 
 * 2. AnimationController (The Loop & The Scroll)
 *    - Singleton pattern or centralized instance to guarantee ONE render loop.
 *    - Wraps Lenis and synchronizes it with GSAP's ticker (priority management).
 *    - Manages subscriptions to prevent layout trashing by batching updates (though GSAP handles much of this, 
 *      we ensure our custom logic hooking into the ticker respects read/write phases if needed).
 */

import gsap from 'gsap';
import Lenis from 'lenis';

// ===================================
// 1. THE MATH: Physics Utility Class
// ===================================
export class PhysicsUtils {
    // Exponential Decay: f(t) = 1 - 2^(-10t)
    // Precise, efficient ease-out for "premium" feel.
    static premiumEase(t: number): number {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    // Spring Solver for Cursor Lag
    // Damped Harmonic Oscillator: F = -kx - cv
    // Solves for the next position given current state.
    // Stateless version allows passing state in, returning new state.
    static solveSpring(
        current: number,
        target: number,
        velocity: number,
        dt: number = 0.016, // Default to ~60fps if not provided
        config: { stiffness: number; damping: number } = { stiffness: 0.1, damping: 0.8 }
    ): { position: number; velocity: number } {
        const displacement = target - current;
        const force = displacement * config.stiffness;
        const dampedForce = force - velocity * config.damping;

        // Euler integration with time step
        const acceleration = dampedForce;
        const newVelocity = velocity + (acceleration * (dt * 60)); // Normalize to 60fps scale for config compatibility
        const newPosition = current + newVelocity * (dt * 60);

        return { position: newPosition, velocity: newVelocity };
    }

    // Linear Interpolation
    static lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * factor;
    }
}

// ========================================
// 2. THE CONTROLLER: Loop & Scroll Manager
// ========================================
export class AnimationController {
    private static instance: AnimationController;
    private lenis: Lenis | null = null;
    private subscribers: Array<(time: number, deltaTime: number) => void> = [];
    private isRunning: boolean = false;

    private constructor() {
        this.initScroll();
        this.startLoop();
    }

    // Singleton access ensures we only ever have ONE scroll/loop manager active.
    static getInstance(): AnimationController {
        if (!AnimationController.instance) {
            AnimationController.instance = new AnimationController();
        }
        return AnimationController.instance;
    }

    // A. THE SCROLL: Luxury Inertia Configuration
    private initScroll() {
        this.lenis = new Lenis({
            duration: 1.2, // Faster response, less floaty
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Standard exponential ease
            smoothWheel: true,
            wheelMultiplier: 1.0,    // Standard speed
            touchMultiplier: 2,
        });
    }

    // B. THE LOOP: Centralized Render Loop synced with GSAP
    private startLoop() {
        if (this.isRunning) return;

        // Add Lenis update to GSAP ticker
        // Priority 0: Standard updates
        gsap.ticker.add(this.update);

        this.isRunning = true;
    }

    // The master update function
    // Using arrow function to preserve 'this' context binding automatically
    private update = (time: number, deltaTime: number, frame: number) => {
        // 1. Update Scroll (Lenis) - Sync with GSAP time
        // converting deltaTime from ms to s for Lenis if needed, or just passing time
        this.lenis?.raf(time * 1000);

        // 2. Notify subscribers (Custom Loops)
        this.subscribers.forEach(cb => cb(time, deltaTime));
    }

    // Public API
    public addSubscriber(callback: (time: number, deltaTime: number) => void) {
        this.subscribers.push(callback);
    }

    public removeSubscriber(callback: (time: number, deltaTime: number) => void) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    public getScrollProgress(): number {
        return this.lenis?.progress ?? 0;
    }

    public destroy() {
        gsap.ticker.remove(this.update);
        this.lenis?.destroy();
        this.lenis = null;
        this.subscribers = [];
        this.isRunning = false;
    }
}

/**
 * ARCHITECTURE EXPLANATION:
 * 
 * 1. Preventing Memory Leaks:
 *    - Singleton Pattern: Ensures we don't accidentally create multiple Lenis instances or event listeners.
 *    - Explicit Destroy: The `destroy` method cleans up GSAP ticker listeners and Lenis instances.
 *    - Subscription Model: Components subscribe/unsubscribe to the central loop. When a component unmounts, 
 *      it unsubscribes, preventing callbacks from running on unmounted components (a common React memory leak).
 * 
 * 2. Preventing Layout Trashing:
 *    - Centralized Ticker (GSAP): By syncing everything (scroll, physics, animations) to `gsap.ticker`, 
 *      we ensure all DOM reads/writes happen in a single coordinated frame.
 *    - GSAP guarantees order of execution. We update scroll state first, then trigger subscribers. 
 *      This allows subscribers to READ the new scroll position and WRITE styles in the same frame without 
 *      forcing reflows mid-frame.
 *    - PhysicsUtils is pure math (no DOM access), so it never causes reflows itself.
 */
