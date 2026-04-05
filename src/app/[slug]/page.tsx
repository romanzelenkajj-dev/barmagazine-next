import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getPostBySlug, getPosts, getFeaturedImageUrl, getFeaturedImageData, getPostCategories, getPostAuthor, getPostTags, stripHtml, truncateAtWord, estimateReadTime, rewriteContentImageUrls, extractFaqPairs } from '@/lib/wordpress';
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
  const categories = getPostCategories(post);
  const author = getPostAuthor(post);
  const tags = getPostTags(post);
  const authorName = author?.name && author.name !== 'BarMagazine' ? author.name : 'BarMagazine';

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
      modifiedTime: post.modified || post.date,
      authors: [authorName],
      section: categories[0]?.name || undefined,
      tags: tags.map(t => t.name),
      url: `${SITE_URL}/${params.slug}`,
      siteName: 'BarMagazine',
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
  const tags = getPostTags(post);
  const heroImage = getFeaturedImageUrl(post, 'full');
  const heroImgFull = getFeaturedImageData(post, 'full');
  const heroImgMedium = getFeaturedImageData(post, 'medium_large');
  const heroImgLarge = getFeaturedImageData(post, 'large');
  const readTime = estimateReadTime(post.content.rendered);
  const wordCount = stripHtml(post.content.rendered).split(/\s+/).length;
  const authorName = author?.name && author.name !== 'BarMagazine' ? author.name : null;
  // Build a rich author object for schema — includes profile URL, bio, and avatar
  // Google uses these signals to verify real human authorship (E-E-A-T)
  const authorSchema = authorName && author
    ? {
        '@type': 'Person',
        name: authorName,
        // Use the barmagazine.com author URL (not the staging WP URL)
        url: `${SITE_URL}/author/${author.slug}`,
        ...(author.description && { description: author.description }),
        ...(author.avatar_urls?.['96'] && {
          image: {
            '@type': 'ImageObject',
            url: author.avatar_urls['96'],
          },
        }),
      }
    : { '@type': 'Organization', name: 'BarMagazine', url: SITE_URL };

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
    dateModified: post.modified || post.date,
    url: `${SITE_URL}/${params.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'BarMagazine',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    },
    // FIX: was { '@type': 'Person', name: authorName } — now includes url, description, image
    // Google needs these to verify the author is a real person with industry expertise
    author: authorSchema,
    ...(categories[0] && { articleSection: categories[0].name }),
    ...(tags.length > 0 && { keywords: tags.map(t => t.name).join(', ') }),
    wordCount,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${params.slug}`,
    },
  };

  // FAQPage JSON-LD (auto-extracted from Q&A content)
  const faqPairs = extractFaqPairs(post.content.rendered);
  const faqLd = faqPairs.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqPairs.map(pair => ({
      '@type': 'Question',
      name: pair.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: pair.answer,
      },
    })),
  } : null;

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...(categories[0] ? [{
        '@type': 'ListItem',
        position: 2,
        name: categories[0].name,
        item: `${SITE_URL}/category/${categories[0].slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: categories[0] ? 3 : 2,
        name: stripHtml(post.title.rendered).replace(/\|/g, '').trim(),
        item: `${SITE_URL}/${params.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Breadcrumb navigation */}
      <nav className="article-breadcrumb">
        <Link href="/">Home</Link>
        <span className="article-breadcrumb-sep">/</span>
        {categories[0] && (
          <>
            <Link href={`/category/${categories[0].slug}`}>{categories[0].name}</Link>
            <span className="article-breadcrumb-sep">/</span>
          </>
        )}
        <span>{stripHtml(post.title.rendered).replace(/\|/g, '').trim()}</span>
      </nav>

      {/* OUTER GRID: 2/3 main + 1/3 sidebar from the top */}
      <div className="article-outer-grid">
      {/* LEFT COLUMN: hero + body */}
      <div className="article-main-col">

      {/* ARTICLE HERO */}
      <div className="article-hero">
        {heroImgFull && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={heroImgFull.url}
            srcSet={[
              heroImgMedium && `${heroImgMedium.url} ${heroImgMedium.width}w`,
              heroImgLarge && `${heroImgLarge.url} ${heroImgLarge.width}w`,
              `${heroImgFull.url} ${heroImgFull.width}w`,
            ].filter(Boolean).join(', ')}
            sizes="100vw"
            alt={stripHtml(post.title.rendered).replace(/\|/g, '').trim()}
            width={heroImgFull.width}
            height={heroImgFull.height}
            className="article-hero-img"
            // @ts-expect-error fetchPriority is valid HTML
            fetchpriority="high"
            decoding="sync"
            loading="eager"
          />
        )}
        <div className="article-hero-overlay" />
        {categories[0] && (
          <span className="article-hero-cat">{categories[0].name}</span>
        )}
        <div className="article-hero-content">
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

      {/* ARTICLE BODY */}
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

          {/* LIST YOUR BAR CTA */}
          <div className="article-list-bar-cta">
            <div className="article-list-bar-cta-inner">
              <div className="article-list-bar-cta-text">
                <h3>Own a bar?</h3>
                <p>Get featured on BarMagazine and reach cocktail enthusiasts worldwide.</p>
              </div>
              <Link href="/claim-your-bar" className="article-list-bar-cta-btn">
                List Your Bar
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* AD BANNER: Pampero */}
          <a href="https://www.alkoshop.sk/?s=pampero&post_type=product&type_aws=true&aws_id=1&aws_filter=1" target="_blank" rel="noopener noreferrer sponsored" className="ad-banner" style={{ marginTop: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banners/pampero.jpg" alt="Pampero Rum" width={1212} height={358} loading="lazy" />
          </a>
        </article>

      </div>{/* end article-layout */}
      </div>{/* end article-main-col */}

      {/* RIGHT COLUMN: sidebar */}
      <Sidebar relatedPosts={relatedPosts} />
      </div>{/* end article-outer-grid */}
    </>
  );
}
