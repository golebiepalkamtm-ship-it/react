import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useForumCategories } from "@/hooks/useForum";
import {
  SeamlessSection,
  RevealOnScroll,
  GradientText,
  MagneticElement,
  FloatingElement,
} from "@/components/animations";
import {
  MessageCircle,
  Stethoscope,
  Trophy,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  MessageCircle,
  Stethoscope,
  Trophy,
  ShoppingBag,
};

const ForumMain = () => {
  const { data: categories, isLoading, error } = useForumCategories();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Header />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <SeamlessSection className="mb-16">
          <div className="container mx-auto px-4 text-center">
            <RevealOnScroll direction="up">
              <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
                Społeczność Hodowców
              </span>
              <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
                <GradientText>Forum PZHGP</GradientText>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
                Dołącz do dyskusji, dziel się wiedzą i buduj przyszłość
                polskiego sportu gołębiarskiego.
              </p>
            </RevealOnScroll>
          </div>
        </SeamlessSection>

        {/* Categories Grid */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {categories?.map((category, index) => {
              const Icon = iconMap[category.icon] || MessageCircle;

              return (
                <RevealOnScroll
                  key={category.id}
                  direction="up"
                  delay={index * 0.1}
                >
                  <MagneticElement strength={0.05}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/forum/category/${category.id}`)}
                      className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-300 backdrop-blur-md relative overflow-hidden"
                    >
                      {/* Ambient Glow */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative z-10 flex gap-6 items-start">
                        <div className="p-4 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy transition-colors duration-500 shadow-lg shadow-gold/10">
                          <Icon size={32} />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold font-display mb-2 group-hover:text-gold transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-white/60 mb-6 leading-relaxed">
                            {category.description}
                          </p>

                          <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-white">
                                {category.topics_count || 0}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-white/40">
                                Tematów
                              </span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-white">
                                {category.posts_count || 0}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-white/40">
                                Postów
                              </span>
                            </div>

                            <div className="ml-auto">
                              <motion.div
                                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy transition-all"
                                whileHover={{ x: 5 }}
                              >
                                <ArrowRight size={20} />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </MagneticElement>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForumMain;
