import { LayoutGroup, motion } from "framer-motion";
import {
  Reveal,
  StaggeredList,
  fadeInUp,
  fadeInLeft,
  scaleIn,
  buttonMicro,
  cardMicro,
} from "./index";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";

/**
 * AnimatedHeroExample Component
 * 
 * A comprehensive example demonstrating the motion system:
 * - RevealOnScroll for scroll-triggered animations
 * - StaggeredList for orchestrated child animations
 * - Micro-interactions on buttons and cards
 * - LayoutGroup for synchronized shared element transitions
 * 
 * This showcases the "Linear-style" high-end feel with:
 * - Fluid spring animations
 * - Perfect synchronization
 * - Subtle 20px Y-axis offsets
 * - Professional micro-interactions
 */
export const AnimatedHeroExample = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Fluid Animations",
      description: "Spring-based physics for natural motion",
    },
    {
      icon: TrendingUp,
      title: "Performance",
      description: "Optimized variants for smooth 60fps",
    },
    {
      icon: Users,
      title: "Accessible",
      description: "Respects prefers-reduced-motion",
    },
  ];

  const stats = [
    { label: "Components", value: "50+" },
    { label: "Variants", value: "15+" },
    { label: "FPS", value: "60" },
  ];

  return (
    <LayoutGroup>
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Title - Reveal on scroll */}
          <Reveal variants={fadeInUp} className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Motion System
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              A professional animation system with Linear-style fluidity and
              perfect synchronization
            </p>
          </Reveal>

          {/* CTA Button with micro-interactions */}
          <Reveal variants={scaleIn} delay={0.2} className="text-center mb-20">
            <motion.button
              variants={buttonMicro}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </motion.button>
          </Reveal>

          {/* Stats Grid - Staggered animation */}
          <Reveal variants={fadeInUp} delay={0.3} className="mb-20">
            <StaggeredList
              staggerDelay={0.15}
              delayChildren={0.1}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardMicro}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                >
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </StaggeredList>
          </Reveal>

          {/* Features Grid - Staggered with custom variants */}
          <Reveal variants={fadeInLeft} delay={0.4}>
            <StaggeredList
              staggerDelay={0.1}
              delayChildren={0.2}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={cardMicro}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </StaggeredList>
          </Reveal>

          {/* Additional Reveal Examples */}
          <div className="mt-32 space-y-12">
            <Reveal variants={fadeInUp} delay={0.5}>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <h2 className="text-3xl font-bold mb-4">
                  Scroll to See More Animations
                </h2>
                <p className="text-slate-300">
                  Each section reveals smoothly as you scroll, creating a
                  professional, synchronized experience.
                </p>
              </div>
            </Reveal>

            <Reveal variants={scaleIn} delay={0.6}>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold mb-4">
                  Scale In Animation
                </h2>
                <p className="text-slate-300">
                  This card uses a scale-in variant for a subtle entrance effect.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </LayoutGroup>
  );
};

