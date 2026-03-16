import type { Metadata } from 'next';
import { BarsDirectory } from './BarsDirectory';

export const metadata: Metadata = {
  title: 'Bar Directory | Bar Magazine',
  description: 'Discover the world\'s best cocktail bars. Search our curated directory of top bars across New York, London, Tokyo, Bangkok, and beyond.',
};

export default function BarsPage() {
  return <BarsDirectory />;
}
