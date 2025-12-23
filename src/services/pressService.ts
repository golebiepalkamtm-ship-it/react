export interface PressArticle {
  id: string;
  title: string;
  subtitle?: string;
  publication: string;
  date: string;
  author?: string;
  category: 'newspaper' | 'magazine' | 'online';
  excerpt: string;
  content: string;
  images: {
    main: string;
    pages?: string[];
  };
  tags?: string[];
  featured?: boolean;
}

export class PressService {
  private static articles: PressArticle[] = [];
  private static loaded = false;

  static async loadArticles(): Promise<PressArticle[]> {
    if (this.loaded) {
      return this.articles;
    }

    // Lista folderów z artykułami (dodawaj nowe tutaj)
    const articleFolders = [
      'older/1', // Dobry Lot - grudzień 2006
      'older/2', // Kolejne artykuły...
      'older/3',
      'older/4',
    ];

    const articles: PressArticle[] = [];

    for (const folder of articleFolders) {
      try {
        const response = await fetch(`/press/articles/${folder}/article.json`);
        if (response.ok) {
          const article = await response.json();
          articles.push(article);
        }
      } catch (error) {
        console.warn(`Failed to load article from ${folder}:`, error);
      }
    }

    // Sortowanie po dacie (najnowsze pierwsze)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.articles = articles;
    this.loaded = true;
    return articles;
  }

  static async getArticleById(id: string): Promise<PressArticle | null> {
    const articles = await this.loadArticles();
    return articles.find(article => article.id === id) || null;
  }

  static async getArticlesByCategory(category: string): Promise<PressArticle[]> {
    const articles = await this.loadArticles();
    if (category === 'all') return articles;
    return articles.filter(article => article.category === category);
  }

  static async getFeaturedArticles(): Promise<PressArticle[]> {
    const articles = await this.loadArticles();
    return articles.filter(article => article.featured);
  }
}