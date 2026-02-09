import { supabase } from '@/lib/supabase';

export interface ForumCategory {
    id: string;
    name: string;
    description: string;
    slug: string;
    icon: string;
    order: number;
    created_at: string;
    updated_at: string;
    topics_count?: number;
    posts_count?: number;
}

export interface ForumTopic {
    id: string;
    category_id: string;
    author_id: string;
    title: string;
    slug: string;
    is_pinned: boolean;
    is_locked: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    author?: {
        id: string;
        email: string;
        profile?: {
            name: string;
            avatar_url: string;
        }
    };
    posts_count?: number;
    last_post?: ForumPost;
}

export interface ForumPost {
    id: string;
    topic_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    author?: {
        id: string;
        email: string;
        profile?: {
            name: string;
            avatar_url: string;
        }
    };
}

export const forumService = {
    async getCategories() {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('forum_categories')
            .select('*, forum_topics(count), forum_posts:forum_topics(forum_posts(count))')
            .order('order', { ascending: true });

        if (error) throw error;

        // Process counts manually as Supabase nesting might be complex for counts
        return data.map(cat => ({
            ...cat,
            topics_count: cat.forum_topics?.[0]?.count || 0,
            posts_count: 0 // We'll handle this more precisely in a specialized query if needed
        })) as ForumCategory[];
    },

    async getTopics(categoryId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:users(id, email, name, avatar_url),
        posts:forum_posts(count)
      `)
            .eq('category_id', categoryId)
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return data.map(topic => ({
            ...topic,
            posts_count: topic.posts?.[0]?.count || 0
        })) as ForumTopic[];
    },

    async getTopic(topicAdminId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:users(id, email, name, avatar_url)
      `)
            .eq('id', topicAdminId)
            .single();

        if (error) throw error;
        return data as ForumTopic;
    },

    async getPosts(topicId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
        *,
        author:users(id, email, name, avatar_url)
      `)
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ForumPost[];
    },

    async createTopic(categoryId: string, authorId: string, title: string, content: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const { data: topic, error: topicError } = await supabase
            .from('forum_topics')
            .insert({
                category_id: categoryId,
                author_id: authorId,
                title,
                slug,
            })
            .select()
            .single();

        if (topicError) throw topicError;

        const { error: postError } = await supabase
            .from('forum_posts')
            .insert({
                topic_id: topic.id,
                author_id: authorId,
                content,
            });

        if (postError) throw postError;

        return topic;
    },

    async createPost(topicId: string, authorId: string, content: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('forum_posts')
            .insert({
                topic_id: topicId,
                author_id: authorId,
                content,
            })
            .select()
            .single();

        if (error) throw error;

        // Update topic updated_at
        await supabase
            .from('forum_topics')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', topicId);

        return data;
    }
};
