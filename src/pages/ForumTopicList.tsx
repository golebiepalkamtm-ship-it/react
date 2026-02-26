import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useForumTopics, useForumCategories } from "@/hooks/useForum";
import {
  RevealOnScroll,
  GradientText,
  MagneticElement,
} from "@/components/animations";
import {
  MessageSquare,
  User,
  Clock,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NewTopicModal } from "@/components/forum/NewTopicModal";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const ForumTopicList = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  const { data: topics, isLoading: topicsLoading } = useForumTopics(categoryId);
  const { data: categories } = useForumCategories();

  const category = categories?.find((c) => c.id === categoryId);

  if (topicsLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Header />

      <main className="pt-32 pb-24">
        <section className="container mx-auto px-4">
          <RevealOnScroll direction="up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <button
                  onClick={() => navigate("/forum")}
                  className="text-gold hover:text-gold-light transition-colors text-sm mb-4 flex items-center gap-2"
                >
                  <ChevronRight className="rotate-180" size={16} />
                  Powrót do kategorii
                </button>
                <h1 className="text-3xl md:text-5xl font-bold font-display">
                  <GradientText>{category?.name || "Tematy"}</GradientText>
                </h1>
                <p className="text-white/60 mt-2">{category?.description}</p>
              </div>

              <MagneticElement strength={0.1}>
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                      return;
                    }
                    setIsNewTopicModalOpen(true);
                  }}
                  className="bg-gold text-navy hover:bg-gold-light font-bold rounded-full px-8 py-6 h-auto transition-all shadow-lg shadow-gold/20 flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Nowy Temat
                </Button>
              </MagneticElement>
            </div>
          </RevealOnScroll>

          <NewTopicModal
            isOpen={isNewTopicModalOpen}
            onClose={() => setIsNewTopicModalOpen(false)}
            categoryId={categoryId!}
          />

          <div className="space-y-4">
            {topics?.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <MessageSquare
                  size={48}
                  className="mx-auto mb-4 text-white/20"
                />
                <p className="text-white/40">
                  Brak tematów w tej kategorii. Bądź pierwszym, który go
                  utworzy!
                </p>
              </div>
            ) : (
              topics?.map((topic, index) => (
                <RevealOnScroll
                  key={topic.id}
                  direction="up"
                  delay={index * 0.05}
                >
                  <motion.div
                    whileHover={{
                      x: 10,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    }}
                    onClick={() => navigate(`/forum/topic/${topic.id}`)}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-gold transition-colors">
                          {topic.is_pinned && (
                            <span className="text-gold mr-2 text-sm uppercase">
                              Pinned
                            </span>
                          )}
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-white/40">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {topic.author?.profile?.name ||
                              topic.author?.email ||
                              "Anonim"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(topic.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 pr-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {topic.posts_count || 0}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">
                          Odpowiedzi
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {topic.views_count || 0}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">
                          Wyświetleń
                        </div>
                      </div>
                      <ChevronRight className="text-gold/50" />
                    </div>
                  </motion.div>
                </RevealOnScroll>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForumTopicList;
