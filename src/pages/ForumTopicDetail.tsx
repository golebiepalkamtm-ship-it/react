import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useForumTopic, useForumPosts, useCreatePost } from '@/hooks/useForum';
import {
    RevealOnScroll,
    GradientText,
    MagneticElement,
} from '@/components/animations';
import { User, Clock, ChevronRight, Send } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ForumTopicDetail = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: topic, isLoading: topicLoading } = useForumTopic(topicId);
    const { data: posts, isLoading: postsLoading } = useForumPosts(topicId);
    const createPostMutation = useCreatePost();

    const [replyContent, setReplyContent] = useState('');

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        await createPostMutation.mutateAsync({
            topicId: topicId!,
            content: replyContent
        });
        setReplyContent('');
    };

    if (topicLoading || postsLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-navy text-white">
            <Header />

            <main className="pt-32 pb-24">
                <section className="container mx-auto px-4 max-w-4xl">
                    <RevealOnScroll direction="up">
                        <button
                            onClick={() => navigate(`/forum/category/${topic?.category_id}`)}
                            className="text-gold hover:text-gold-light transition-colors text-sm mb-4 flex items-center gap-2"
                        >
                            <ChevronRight className="rotate-180" size={16} />
                            Powrót do listy tematów
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">
                            <GradientText>{topic?.title}</GradientText>
                        </h1>
                    </RevealOnScroll>

                    <div className="space-y-6 mb-12">
                        {posts?.map((post, index) => (
                            <RevealOnScroll
                                key={post.id}
                                direction="up"
                                delay={index * 0.05}
                            >
                                <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative transition-all hover:border-white/20">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Author Info */}
                                        <div className="md:w-32 flex-shrink-0 flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold border border-gold/30 mb-3 overflow-hidden">
                                                {post.author?.profile?.avatar_url ? (
                                                    <img src={post.author.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={32} />
                                                )}
                                            </div>
                                            <div className="font-bold text-sm truncate max-w-full">
                                                {post.author?.profile?.name || post.author?.email || 'Anonim'}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-4 text-xs text-white/40 border-b border-white/5 pb-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(post.created_at).toLocaleString()}
                                                </span>
                                                <span>#{index + 1}</span>
                                            </div>
                                            <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>

                    {/* Reply Form */}
                    <RevealOnScroll direction="up">
                        <div className="p-8 rounded-2xl bg-white/5 border border-gold/30 backdrop-blur-md">
                            <h3 className="text-xl font-bold font-display mb-4 text-gold">Odpowiedz w temacie</h3>
                            {!user ? (
                                <div className="text-center py-6">
                                    <p className="text-white/60 mb-4">Musisz być zalogowany, aby dodać odpowiedź.</p>
                                    <Button onClick={() => navigate('/auth')} className="bg-gold text-navy font-bold">Zaloguj się</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Wpisz swoją odpowiedź..."
                                        className="bg-navy/50 border-white/20 focus:border-gold h-32 text-white placeholder:text-white/20"
                                    />
                                    <div className="flex justify-end">
                                        <MagneticElement strength={0.1}>
                                            <Button
                                                onClick={handleReply}
                                                disabled={createPostMutation.isPending || !replyContent.trim()}
                                                className="bg-gold text-navy hover:bg-gold-light font-bold rounded-full px-8 flex items-center gap-2"
                                            >
                                                <Send size={18} />
                                                Wyślij odpowiedź
                                            </Button>
                                        </MagneticElement>
                                    </div>
                                </div>
                            )}
                        </div>
                    </RevealOnScroll>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ForumTopicDetail;
