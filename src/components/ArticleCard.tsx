import Link from 'next/link';
import { format } from 'date-fns';
import type { WPPost } from '@/lib/wordpress';
import { getFeaturedImageUrl, getPostCategories, stripHtml, estimateReadTime } from '@/lib/wordpress';

export function ArticleCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'medium_large') || getFeaturedImageUrl(post, 'large');
  const categories = getPostCategories(post);
  const categoryName = categories[0]?.name || 'Article';
  const excerpt = stripHtml(post.excerpt.rendered);
  const readTime = estimateReadTime(post.content.rendered);

  return (
    <Link href={`/${post.slug}`} className="article-card">
      <div className="article-card-img">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={stripHtml(post.title.rendered)} loading="lazy" />
        )}
      </div>
      <div className="article-card-body">
        <div className="article-card-cat">{categoryName}</div>
        <h3
          className="article-card-title"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <p className="article-card-excerpt">{excerpt}</p>
        <div className="article-card-meta">
          <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
          <span className="dot" />
          <span>{readTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
