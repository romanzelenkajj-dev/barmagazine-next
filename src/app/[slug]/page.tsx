import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getPostBySlug, getPosts, getFeaturedImageUrl, getPostCategories, getPostAuthor, stripHtml, estimateReadTime } from '@/lib/wordpress';
import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${stripHtml(post.title.rendered)} | Bar Magazine`,
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
    openGraph: {
      title: stripHtml(post.title.rendered),
      description: stripHtml(post.excerpt.rendered).slice(0, 160),
      type: 'article',
      publishedTime: post.date,
      images: getFeaturedImageUrl(post, 'full') ? [{ url: getFeaturedImageUrl(post, 'full')! }] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const categories = getPostCategories(post);
  const author = getPostAuthor(post);
  const heroImage = getFeaturedImageUrl(post, 'full');
  const readTime = estimateReadTime(post.content.rendered);

  // Get related posts from the same category
  const relatedResult = await getPosts(1, 5, categories[0]?.id);
  const relatedPosts = relatedResult.data.filter(p => p.id !== post.id).slice(0, 4);

  return (
    <>
      {/* ARTICLE HERO */}
      <div
        className="article-hero"
        style={{
          backgroundImage: heroImage ? `url('${heroImage}')` : undefined,
          marginTop: 'var(--gap)',
        }}
      >
        <div className="article-hero-overlay" />
        <div className="article-hero-content">
          {categories[0] && (
            <span className="article-hero-cat">{categories[0].name}</span>
          )}
          <h1
            className="article-hero-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="article-hero-meta">
            <span>By {author?.name || 'BarMagazine'}</span>
            <span className="dot" />
            <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
            <span className="dot" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* ARTICLE + SIDEBAR */}
      <div className="article-layout">
        <article className="article-body">
          <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

          {/* Author box */}
          <div className="author-box">
            <div className="author-avatar">
              {author?.avatar_urls?.['96'] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar_urls['96']}
                  alt={author.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                'BM'
              )}
            </div>
            <div className="author-info">
              <h4>{author?.name || 'BarMagazine'}</h4>
              <p>Our editorial team covers the latest in cocktail culture, bar design, and spirits worldwide.</p>
            </div>
          </div>

          {/* Share bar */}
          <div className="share-bar">
            <span>Share</span>
            <button className="share-btn" title="Facebook" aria-label="Share on Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button className="share-btn" title="LinkedIn" aria-label="Share on LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
            <button className="share-btn" title="Copy link" aria-label="Copy link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
          </div>
        </article>

        <Sidebar relatedPosts={relatedPosts} />
      </div>
    </>
  );
}
