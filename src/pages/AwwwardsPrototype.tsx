import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSpringPhysics, customExpoEase, customBezier, splitTextToChars, splitTextToWords } from '@/hooks/useCustomPhysics';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import './AwwwardsPrototype.css';

gsap.registerPlugin(ScrollTrigger);

class Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;

    constructor(canvas: HTMLCanvasElement, _mousePos: { x: number, y: number }) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    reset(canvas: HTMLCanvasElement) {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update(canvas: HTMLCanvasElement, mousePos: { x: number, y: number }) {
        this.x += this.speedX;
        this.y += this.speedY;

        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (150 - distance) / 150;
            this.x -= Math.cos(angle) * force * 3;
            this.y -= Math.sin(angle) * force * 3;
        }

        if (this.y > canvas.height) {
            this.reset(canvas);
        }

        if (this.x < 0 || this.x > canvas.width) {
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const AwwwardsPrototype = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const heroTitleRef = useRef<HTMLHeadingElement>(null);
    const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const cursorSpring = useSpringPhysics({ stiffness: 0.15, damping: 0.25 });
    const followerSpring = useSpringPhysics({ stiffness: 0.08, damping: 0.3 });

    // Initialize smooth scroll with custom configuration
    useSmoothScroll({
        enableAnimations: false // We'll handle animations manually
    });

    // Register custom GSAP ease
    useEffect(() => {
        gsap.registerEase("customExpo", customExpoEase);
    }, []);

    // Custom Cursor with Spring Physics
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            cursorSpring.setTarget(e.clientX, e.clientY);
            followerSpring.setTarget(e.clientX, e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop for cursor
        const animateCursor = () => {
            const cursorPos = cursorSpring.update();
            const followerPos = followerSpring.update();

            if (cursorRef.current) {
                gsap.set(cursorRef.current, {
                    x: cursorPos.x,
                    y: cursorPos.y,
                });
            }

            if (followerRef.current) {
                gsap.set(followerRef.current, {
                    x: followerPos.x,
                    y: followerPos.y,
                });
            }

            requestAnimationFrame(animateCursor);
        };

        animateCursor();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [cursorSpring, followerSpring]);

    // Video Scroll Scrubbing
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
                onUpdate: (self) => {
                    if (video.duration) {
                        video.currentTime = video.duration * self.progress;
                    }
                }
            });
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    // Split Text Animations
    useEffect(() => {
        const heroTitle = heroTitleRef.current;
        const heroSubtitle = heroSubtitleRef.current;

        if (heroTitle) {
            const text = heroTitle.textContent || '';
            const chars = splitTextToChars(text);
            heroTitle.innerHTML = chars.map(char =>
                `<span class="char">${char}</span>`
            ).join('');

            gsap.from(heroTitle.querySelectorAll('.char'), {
                y: 100,
                opacity: 0,
                rotation: 10,
                stagger: 0.03,
                duration: 1.2,
                ease: "customExpo",
                scrollTrigger: {
                    trigger: '.hero-content',
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        if (heroSubtitle) {
            const text = heroSubtitle.textContent || '';
            const words = splitTextToWords(text);
            heroSubtitle.innerHTML = words.map(word =>
                `<span class="word">${word}</span>`
            ).join(' ');

            gsap.from(heroSubtitle.querySelectorAll('.word'), {
                y: 50,
                opacity: 0,
                stagger: 0.08,
                duration: 1,
                ease: "customExpo",
                delay: 0.5,
                scrollTrigger: {
                    trigger: '.hero-content',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }, []);

    // Parallax Animations with Custom Bezier
    useEffect(() => {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');

        parallaxLayers.forEach((layer, index) => {
            const speed = parseFloat((layer as HTMLElement).dataset.speed || '0.5');
            const item = layer.querySelector('.parallax-item');

            if (item) {
                ScrollTrigger.create({
                    trigger: '#parallax-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                    onUpdate: (self) => {
                        const bezierProgress = customBezier(self.progress, 0, 0.2, 0.8, 1);
                        const yOffset = bezierProgress * -200 * speed;

                        gsap.set(item, {
                            y: yOffset,
                            rotation: bezierProgress * 15 * (index % 2 === 0 ? 1 : -1)
                        });
                    }
                });
            }
        });

        // Section title animation
        gsap.from('.section-title', {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "customExpo",
            scrollTrigger: {
                trigger: '.section-title',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Feature cards animation
        gsap.from('.feature-card', {
            y: 80,
            opacity: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: "customExpo",
            scrollTrigger: {
                trigger: '.feature-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }, []);

    // Mask-based Section Transition
    useEffect(() => {
        ScrollTrigger.create({
            trigger: '#masked-section',
            start: 'top 60%',
            end: 'center center',
            scrub: 1,
            onUpdate: (self) => {
                const maskSize = self.progress * 150;
                gsap.set('.mask-reveal', {
                    clipPath: `circle(${maskSize}% at 50% 50%)`
                });
            }
        });
    }, []);

    // Canvas Particle System
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particles: Particle[] = [];
        const particleCount = 150;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas, mousePos));
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update(canvas, mousePos);
                particle.draw(ctx);
            });

            requestAnimationFrame(animateParticles);
        };

        animateParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [mousePos]);

    // Magnetic effect for feature cards
    const handleMagneticEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(followerRef.current, {
            width: 80,
            height: 80,
            duration: 0.3,
            ease: "customExpo"
        });
    };

    const handleMagneticLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "customExpo"
        });

        gsap.to(followerRef.current, {
            width: 50,
            height: 50,
            duration: 0.3,
            ease: "customExpo"
        });
    };

    const handleMagneticMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(e.currentTarget, {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.5,
            ease: "customExpo"
        });
    };

    return (
        <div className="awwwards-prototype">
            {/* Custom Cursor */}
            <div ref={cursorRef} className="custom-cursor" />
            <div ref={followerRef} className="cursor-follower" />

            {/* Hero Section with Video Scrubbing */}
            <section id="hero" className="hero-section">
                <div className="video-container">
                    <video
                        ref={videoRef}
                        className="hero-video"
                        muted
                        playsInline
                        preload="auto"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-lightbulb-hanging-in-the-dark-turning-on-and-off-repeatedly-30928-large.mp4" type="video/mp4" />
                    </video>
                    <div className="video-overlay" />
                    <div className="hero-content">
                        <h1 ref={heroTitleRef} className="hero-title">CREATIVE EXCELLENCE</h1>
                        <p ref={heroSubtitleRef} className="hero-subtitle">Where innovation meets artistry</p>
                    </div>
                </div>
            </section>

            {/* Parallax Section */}
            <section id="parallax-section" className="parallax-section">
                <div className="parallax-layer" data-speed="0.3">
                    <div className="parallax-item layer-1" />
                </div>
                <div className="parallax-layer" data-speed="0.5">
                    <div className="parallax-item layer-2" />
                </div>
                <div className="parallax-layer" data-speed="0.7">
                    <div className="parallax-item layer-3" />
                </div>

                <div className="parallax-content">
                    <h2 className="section-title">Pushing Boundaries</h2>
                    <div className="feature-grid">
                        <div
                            className="feature-card magnetic"
                            onMouseEnter={handleMagneticEnter}
                            onMouseLeave={handleMagneticLeave}
                            onMouseMove={handleMagneticMove}
                        >
                            <h3>Performance</h3>
                            <p>Optimized for 60fps with GPU-accelerated animations and efficient rendering pipelines.</p>
                        </div>
                        <div
                            className="feature-card magnetic"
                            onMouseEnter={handleMagneticEnter}
                            onMouseLeave={handleMagneticLeave}
                            onMouseMove={handleMagneticMove}
                        >
                            <h3>Physics</h3>
                            <p>Custom spring dynamics and exponential easing for natural, luxurious motion.</p>
                        </div>
                        <div
                            className="feature-card magnetic"
                            onMouseEnter={handleMagneticEnter}
                            onMouseLeave={handleMagneticLeave}
                            onMouseMove={handleMagneticMove}
                        >
                            <h3>Design</h3>
                            <p>Award-winning aesthetics combining modern minimalism with bold visual statements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Masked Transition Section */}
            <section id="masked-section" className="masked-section">
                <div className="mask-reveal">
                    <div className="mask-content">
                        <h2>Seamless Transitions</h2>
                        <p>Experience fluid, mask-based reveals</p>
                    </div>
                </div>
            </section>

            {/* Canvas Particle Section */}
            <section id="canvas-section" className="canvas-section">
                <canvas ref={canvasRef} id="particle-canvas" />
            </section>

            {/* Footer */}
            <footer className="aww-footer">
                <p>&copy; 2026 Creative Excellence. Site of the Year Candidate.</p>
            </footer>
        </div>
    );
};

export default AwwwardsPrototype;
