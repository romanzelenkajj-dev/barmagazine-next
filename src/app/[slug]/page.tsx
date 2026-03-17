import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getPostBySlug, getPosts, getFeaturedImageUrl, getPostCategories, getPostAuthor, stripHtml, truncateAtWord, estimateReadTime, rewriteContentImageUrls } from '@/lib/wordpress';
import { Sidebar } from '@/components/Sidebar';
import { upgradeGalleryImages, cleanTitle } from '@/lib/utils';
import type { Metadata } from 'next';

const SITE_URL = 'https://barmagazine.com';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  const title = stripHtml(post.title.rendered).replace(/\|/g, '').trim();
  const description = truncateAtWord(stripHtml(post.excerpt.rendered), 160);
  const heroImage = getFeaturedImageUrl(post, 'full');

  return {
    title: title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      url: `${SITE_URL}/${params.slug}`,
      siteName: 'Bar Magazine',
      images: heroImage ? [{ url: heroImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : [],
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
  const authorName = author?.name && author.name !== 'BarMagazine' ? author.name : null;

  // Get related posts from the same category, fall back to recent posts
  const relatedResult = await getPosts(1, 5, categories[0]?.id);
  let relatedPosts = relatedResult.data.filter(p => p.id !== post.id).slice(0, 4);
  if (relatedPosts.length < 2) {
    const recentResult = await getPosts(1, 6);
    relatedPosts = recentResult.data.filter(p => p.id !== post.id).slice(0, 4);
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: stripHtml(post.title.rendered).replace(/\|/g, '').trim(),
    description: truncateAtWord(stripHtml(post.excerpt.rendered), 160),
    image: heroImage || undefined,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/${params.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Bar Magazine',
      url: SITE_URL,
    },
    ...(authorName && {
      author: {
        '@type': 'Person',
        name: authorName,
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${params.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ARTICLE HERO */}
      <div className="article-hero" style={{ marginTop: 'var(--gap)' }}>
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={stripHtml(post.title.rendered)}
            className="article-hero-img"
          />
        )}
        <div className="article-hero-overlay" />
        <div className="article-hero-content">
          {categories[0] && (
            <span className="article-hero-cat">{categories[0].name}</span>
          )}
          <h1
            className="article-hero-title"
            dangerouslySetInnerHTML={{ __html: cleanTitle(post.title.rendered) }}
          />
          <div className="article-hero-meta">
            {authorName && (
              <>
                <span>By {authorName}</span>
                <span className="dot" />
              </>
            )}
            <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
            <span className="dot" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* ARTICLE + SIDEBAR */}
      <div className="article-layout">
        <article className="article-body">
          <div dangerouslySetInnerHTML={{ __html: upgradeGalleryImages(rewriteContentImageUrls(post.content.rendered)) }} />

          {/* Author box */}
          {authorName && (
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
                  authorName.charAt(0)
                )}
              </div>
              <div className="author-info">
                <h4>{authorName}</h4>
              </div>
            </div>
          )}

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
