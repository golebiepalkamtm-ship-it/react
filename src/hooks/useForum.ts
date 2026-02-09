import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumService } from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useForumCategories = () => {
    return useQuery({
        queryKey: ['forum', 'categories'],
        queryFn: () => forumService.getCategories(),
    });
};

export const useForumTopics = (categoryId?: string) => {
    return useQuery({
        queryKey: ['forum', 'topics', categoryId],
        queryFn: () => forumService.getTopics(categoryId!),
        enabled: !!categoryId,
    });
};

export const useForumTopic = (topicId?: string) => {
    return useQuery({
        queryKey: ['forum', 'topic', topicId],
        queryFn: () => forumService.getTopic(topicId!),
        enabled: !!topicId,
    });
};

export const useForumPosts = (topicId?: string) => {
    return useQuery({
        queryKey: ['forum', 'posts', topicId],
        queryFn: () => forumService.getPosts(topicId!),
        enabled: !!topicId,
    });
};

export const useCreateTopic = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ categoryId, title, content }: { categoryId: string, title: string, content: string }) => {
            if (!user) throw new Error('You must be logged in to create a topic');
            return forumService.createTopic(categoryId, user.id, title, content);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['forum', 'topics', variables.categoryId] });
            toast({
                title: "Sukces",
                description: "Temat został utworzony pomyślnie.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Błąd",
                description: error.message || "Nie udało się utworzyć tematu.",
                variant: "destructive",
            });
        }
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ topicId, content }: { topicId: string, content: string }) => {
            if (!user) throw new Error('You must be logged in to reply');
            return forumService.createPost(topicId, user.id, content);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['forum', 'posts', variables.topicId] });
            queryClient.invalidateQueries({ queryKey: ['forum', 'topic', variables.topicId] });
            toast({
                title: "Sukces",
                description: "Odpowiedź została dodana.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Błąd",
                description: error.message || "Nie udało się dodać odpowiedzi.",
                variant: "destructive",
            });
        }
    });
};
