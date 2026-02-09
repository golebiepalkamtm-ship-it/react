import React, { useState } from 'react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTopic } from '@/hooks/useForum';
import { MessageSquare, Send } from 'lucide-react';

interface NewTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
}

export const NewTopicModal = ({ isOpen, onClose, categoryId }: NewTopicModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const createTopicMutation = useCreateTopic();

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;

        await createTopicMutation.mutateAsync({
            categoryId,
            title,
            content
        });

        setTitle('');
        setContent('');
        onClose();
    };

    return (
        <UnifiedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Utwórz Nowy Temat"
            message="Podziel się swoją wiedzą lub zadaj pytanie społeczności."
            icon={MessageSquare}
            size="lg"
        >
            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Tytuł tematu</label>
                    <Input
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="np. Jak przygotować gołębie do pierwszego lotu?"
                        className="bg-navy/50 border-white/20 focus:border-gold text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Treść wiadomości</label>
                    <Textarea
                        value={content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        placeholder="Opisz swój temat szczegółowo..."
                        className="bg-navy/50 border-white/20 focus:border-gold text-white h-48"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createTopicMutation.isPending || !title.trim() || !content.trim()}
                        className="bg-gold text-navy hover:bg-gold-light font-bold px-8 flex items-center gap-2"
                    >
                        <Send size={18} />
                        Utwórz Temat
                    </Button>
                </div>
            </div>
        </UnifiedModal>
    );
};
