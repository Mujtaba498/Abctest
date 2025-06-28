'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Post, Category, Tag } from '../types/post';
import { api } from '../lib/api';
import { Carousel, CarouselContent, CarouselItem } from '../components/ui/carousel';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from '../components/ui/navigation-menu';
import Footer from '../components/ui/Footer';
import { AdPlaceholder } from '../components/ui/AdPlaceholder';

const placeholderImg = 'https://placehold.co/600x400?text=No+Image';

function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return match ? match[1] : null;
}

function getPostImage(post: Post): string | null {
  // First, try to use the image_urls array from the API
  if (post.image_urls && post.image_urls.length > 0) {
    return post.image_urls[0];
  }
  
  // If no image_urls, try to extract from content
  const extractedImage = extractFirstImage(post.content);
  if (extractedImage) {
    return extractedImage;
  }
  
  // Return null if no images found
  return null;
}

// Helper to strip HTML and get first N words
function getExcerptFromContent(html: string, wordCount = 15): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.split(/\s+/).slice(0, wordCount).join(' ') + (text.split(/\s+/).length > wordCount ? '...' : '');
}

export default function Articles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAll = async (retryCount = 0) => {
      setLoading(true);
      setError(null);
      try {

        
        const [postsData, categoriesData, tagsData] = await Promise.all([
          api.get('/posts'),
          api.get('/categories'),
          api.get('/tags'),
        ]);
        

        
        // Handle different API response formats
        const normalizedPosts = Array.isArray(postsData) ? postsData : 
                               (postsData?.data ? postsData.data : []);
        const normalizedCategories = Array.isArray(categoriesData) ? categoriesData : 
                                   (categoriesData?.data ? categoriesData.data : 
                                   (categoriesData?.categories ? categoriesData.categories : []));
        const normalizedTags = Array.isArray(tagsData) ? tagsData : 
                              (tagsData?.data ? tagsData.data : 
                              (tagsData?.tags ? tagsData.tags : []));
        

        
        setPosts(normalizedPosts.filter((post: Post) => post.status === 'published'));
        setCategories(normalizedCategories);
        setTags(normalizedTags);
      } catch (err) {
        console.error('API Error:', err);
        
        // Retry up to 2 times with delay
        if (retryCount < 2) {
          setTimeout(() => fetchAll(retryCount + 1), (retryCount + 1) * 1000);
          return;
        }
        
        setError('Failed to load articles after multiple attempts');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getCategoryNames = (cats: any[]) =>
    cats.map(cat => typeof cat === 'string' ? categories.find(c => c._id === cat)?.name : cat.name).filter(Boolean);
  const getTagNames = (tagsArr: any[]) =>
    tagsArr.map(tag => typeof tag === 'string' ? tags.find(t => t.id === tag)?.name : tag.name).filter(Boolean);

  if (loading) return <div className="flex justify-center p-8">Loading articles...</div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;

  // Filter parent categories (those without parentId)
  const parentCategories = categories.filter(category => 
    !category.parentId // This handles null, undefined, empty string, etc.
  );

  // Chunk posts for repeating structure
  const chunkSections = (arr: Post[], chunkSize: number, sliderSize: number) => {
    const sections = [];
    let i = 0;
    while (i < arr.length) {
      const section = arr.slice(i, i + chunkSize);
      i += chunkSize;
      const slider = arr.slice(i, i + sliderSize);
      i += sliderSize;
      sections.push({ section, slider });
    }
    return sections;
  };

  // Each section: 1 main, 2 small, headlines; then a slider of 4
  const sections = chunkSections(posts, 3, 4);

  // Helper to get sidebar headlines (next 4 posts after the 3 in section)
  const getSidebarStories = (startIdx: number) => posts.slice(startIdx + 3, startIdx + 7);

  // After the first main+2+headlines+carousel, show a modern 3-column layout for the next up to 11 posts (or fewer if not enough)
  const modernStartIdx = 3 + 4; // skip first 3 (main+2) and 4 (carousel)
  const modernPosts = posts.slice(modernStartIdx, modernStartIdx + 11); // 1+3+1+2+1+3 = 11
  // Left: 1 large + 3 small, Center: 1 extra-large + 2 small, Right: 1 large + 3 small
  const leftLarge = modernPosts[0];
  const leftSmall = modernPosts.slice(1, 4);
  const centerXL = modernPosts[4];
  const centerSmall = modernPosts.slice(5, 7);
  const rightLarge = modernPosts[7];
  const rightSmall = modernPosts.slice(8, 11);
  // Posts after the modern 3-column layout
  const afterModernIdx = modernStartIdx + modernPosts.length;
  const remainingPosts = posts.slice(afterModernIdx);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-2 md:px-0">
          {/* Header */}
          <header className="mb-4 border-b pb-4 text-center relative">
            {/* Login Button - Top Right */}
           
            
            <h1 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
            <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
                Handicap International
              </Link>
            </h1>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </header>
          {/* Category Navbar */}
          <nav className="flex justify-center mb-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900`}
                    onClick={() => router.push('/')}
                  >
                        Tout
                  </button>
                </NavigationMenuItem>

                {parentCategories.map(category => (
                  <NavigationMenuItem key={category._id}>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
                      onClick={() => router.push(`/${category.slug}`)}
                    >
                      {category.name}
                    </button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          {/* First main+2+headlines section */}
          {sections.length > 0 && (() => {
            const { section, slider } = sections[0];
            const mainStory = section[0];
            const secondaryStories = section.slice(1, 3);
            const sidebarStories = getSidebarStories(0);
            return (
              <div className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    {mainStory && (
                      <div className="flex flex-col border-b pb-6">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                          <Link href={`/${mainStory.slug}`} className="hover:underline underline-offset-2 transition-all">{mainStory.title}</Link>
                        </h2>
                                                  {getPostImage(mainStory) && (
                        <img
                              src={getPostImage(mainStory)!}
                          alt={mainStory.title}
                          className="w-full h-80 object-cover rounded mb-4"
                          loading="lazy"
                        />
                          )}
                        <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4 line-clamp-4">{getExcerptFromContent(mainStory.content, 40)}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getCategoryNames(mainStory.categoryIds).map(name => (
                            <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                          ))}
                          {getTagNames(mainStory.tagIds).map(name => (
                            <Badge key={name} variant="default" className="text-xs bg-indigo-100 text-indigo-800">#{name}</Badge>
                          ))}
                        </div>
                        <div className="text-zinc-500 text-xs mb-2">{new Date(mainStory.createdAt).toLocaleDateString()}</div>
                        <Button asChild size="sm" className="w-fit">
                          <Link href={`/${mainStory.slug}`} className="hover:underline underline-offset-2 transition-all">Lire la suite</Link>
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {secondaryStories.map(post => (
                        <div key={post.id} className="flex flex-col border-b pb-4">
                          <img
                            src={getPostImage(post) || placeholderImg}
                            alt={post.title}
                            className="w-full h-40 object-cover rounded mb-2"
                            loading="lazy"
                          />
                          <h3 className="text-lg font-semibold mb-1">
                            <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all">{post.title}</Link>
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-1">
                            {getCategoryNames(post.categoryIds).map(name => (
                              <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                            ))}
                            {getTagNames(post.tagIds).map(name => (
                              <Badge key={name} variant="default" className="text-xs bg-indigo-100 text-indigo-800">#{name}</Badge>
                            ))}
                          </div>
                          <div className="text-zinc-500 text-xs mb-1">{new Date(post.createdAt).toLocaleDateString()}</div>
                          <p className="text-zinc-700 dark:text-zinc-300 line-clamp-3 mb-2">{post.excerpt}</p>
                          <Button asChild size="sm" variant="link" className="p-0 h-auto">
                            <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all">Lire la suite</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <aside className="space-y-6 md:mt-24">
                    <div className="border-b pb-4">
                      <h3 className="font-bold mb-2 text-zinc-800 dark:text-zinc-100">Dernières nouvelles</h3>
                      <ul className="space-y-2">
                        {sidebarStories.map(post => (
                          <li key={post.id} className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-semibold line-clamp-2">
                                {post.title}
                              </Link>
                              <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-1">
                                {getExcerptFromContent(post.content)}
                              </div>
                              <div className="flex flex-wrap gap-1 mb-1">
                                {getCategoryNames(post.categoryIds).map(name => (
                                  <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                                ))}
                                {getTagNames(post.tagIds).map(name => (
                                  <Badge key={name} variant="default" className="text-xs bg-indigo-100 text-indigo-800">#{name}</Badge>
                                ))}
                              </div>
                              <div className="text-xs text-zinc-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                            </div>
                            {getPostImage(post) && (
                            <img
                                src={getPostImage(post)!}
                              alt={post.title}
                              className="w-20 h-20 object-cover rounded ml-2 flex-shrink-0 border"
                              loading="lazy"
                            />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Advertisement container */}
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col items-center py-6 mt-6">
                      <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Publicité</span>
                                              <AdPlaceholder width={300} height={180} className="w-full max-w-[300px]" />
                    </div>
                  </aside>
                </div>
                {/* Carousel slider */}
                {slider.length > 0 && (
                  <div className="my-12">
                    <Carousel>
                      <CarouselContent>
                        {slider.map(post => (
                          <CarouselItem key={post.id} className="basis-1/2 md:basis-1/4">
                            <div className="flex flex-col h-full border rounded-md p-2 bg-white dark:bg-zinc-900">
                              {getPostImage(post) && (
                              <img
                                  src={getPostImage(post)!}
                                alt={post.title}
                                className="w-full h-40 object-cover rounded mb-2"
                                loading="lazy"
                              />
                              )}
                              <h4 className="text-md font-semibold mb-1">
                                <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all">{post.title}</Link>
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {getCategoryNames(post.categoryIds).map(name => (
                                  <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                                ))}
                                {getTagNames(post.tagIds).map(name => (
                                  <Badge key={name} variant="default" className="text-xs bg-indigo-100 text-indigo-800">#{name}</Badge>
                                ))}
                              </div>
                              <div className="text-zinc-500 text-xs mb-1">{new Date(post.createdAt).toLocaleDateString()}</div>
                              <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-2">{post.excerpt}</p>
                              <Button asChild size="sm" variant="link" className="p-0 h-auto">
                                <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all">Lire la suite</Link>
                              </Button>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Modern 3-column layout after carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              {leftLarge && (
                <div className="mb-2">
                  {getPostImage(leftLarge) && (
                    <img src={getPostImage(leftLarge)!} alt={leftLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                  )}
                  <h3 className="text-xl font-bold mb-1">
                    <Link href={`/${leftLarge.slug}`} className="hover:underline underline-offset-2 transition-all">{leftLarge.title}</Link>
                  </h3>
                </div>
              )}
              {leftSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  {getPostImage(post) && (
                    <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  )}
                  <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                </div>
              ))}
            </div>
            {/* Center column */}
            <div className="flex flex-col gap-6">
              {centerXL && (
                <div className="mb-2">
                  {getPostImage(centerXL) && (
                    <img src={getPostImage(centerXL)!} alt={centerXL.title} className="w-full h-64 object-cover rounded mb-2" loading="lazy" />
                  )}
                  <h2 className="text-2xl font-bold mb-1">
                    <Link href={`/${centerXL.slug}`} className="hover:underline underline-offset-2 transition-all">{centerXL.title}</Link>
                  </h2>
                  <div className="text-xs text-zinc-500 mb-1">By Unknown | {new Date(centerXL.createdAt).toLocaleDateString()}</div>
                </div>
              )}
              {centerSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  {getPostImage(post) && (
                    <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  )}
                  <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-6">
              {rightLarge && (
                <div className="mb-2">
                  {getPostImage(rightLarge) && (
                    <img src={getPostImage(rightLarge)!} alt={rightLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                  )}
                  <h3 className="text-xl font-bold mb-1">
                    <Link href={`/${rightLarge.slug}`} className="hover:underline underline-offset-2 transition-all">{rightLarge.title}</Link>
                  </h3>
                </div>
              )}
              {rightSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  {getPostImage(post) && (
                    <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  )}
                  <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Advertisement container */}
          <div className="my-12 w-full">
            <div className="w-full max-w-7xl mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col items-center py-8">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Publicité</span>
                              <AdPlaceholder width={1200} height={120} className="w-full max-w-5xl" />
            </div>
          </div>

          {/* More posts after ad banner, in modern 3-column layout chunks */}
          {remainingPosts.length > 0 && (
            <div className="max-w-7xl mx-auto mt-12 space-y-16">
              {Array.from({ length: Math.ceil(remainingPosts.length / 11) }).map((_, i) => {
                const chunk = remainingPosts.slice(i * 11, (i + 1) * 11);
                const leftLarge = chunk[0];
                const leftSmall = chunk.slice(1, 4);
                const centerXL = chunk[4];
                const centerSmall = chunk.slice(5, 7);
                const rightLarge = chunk[7];
                const rightSmall = chunk.slice(8, 11);
                return (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column */}
                    <div className="flex flex-col gap-6">
                      {leftLarge && (
                        <div className="mb-2">
                          {getPostImage(leftLarge) && (
                            <img src={getPostImage(leftLarge)!} alt={leftLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                          )}
                          <h3 className="text-xl font-bold mb-1">
                            <Link href={`/${leftLarge.slug}`} className="hover:underline underline-offset-2 transition-all">{leftLarge.title}</Link>
                          </h3>
                        </div>
                      )}
                      {leftSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                            {getPostImage(post) && (
                              <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                            )}
                          <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                        </div>
                      ))}
                    </div>
                    {/* Center column */}
                    <div className="flex flex-col gap-6">
                      {centerXL && (
                        <div className="mb-2">
                          {getPostImage(centerXL) && (
                            <img src={getPostImage(centerXL)!} alt={centerXL.title} className="w-full h-64 object-cover rounded mb-2" loading="lazy" />
                          )}
                          <h2 className="text-2xl font-bold mb-1">
                            <Link href={`/${centerXL.slug}`} className="hover:underline underline-offset-2 transition-all">{centerXL.title}</Link>
                          </h2>
                          <div className="text-xs text-zinc-500 mb-1">By Unknown | {new Date(centerXL.createdAt).toLocaleDateString()}</div>
                        </div>
                      )}
                      {centerSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                            {getPostImage(post) && (
                              <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                            )}
                          <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                        </div>
                      ))}
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                      {rightLarge && (
                        <div className="mb-2">
                          {getPostImage(rightLarge) && (
                            <img src={getPostImage(rightLarge)!} alt={rightLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                          )}
                          <h3 className="text-xl font-bold mb-1">
                            <Link href={`/${rightLarge.slug}`} className="hover:underline underline-offset-2 transition-all">{rightLarge.title}</Link>
                          </h3>
                        </div>
                      )}
                      {rightSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                            {getPostImage(post) && (
                              <img src={getPostImage(post)!} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                            )}
                          <Link href={`/${post.slug}`} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 
