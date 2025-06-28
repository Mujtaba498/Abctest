'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Post, Category, Tag } from '../types/post';
import { api } from '../lib/api';
import { Carousel, CarouselContent, CarouselItem } from '../components/ui/carousel';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem
} from '../components/ui/navigation-menu';
import Footer from '../components/ui/Footer';
import { AdPlaceholder } from '../components/ui/AdPlaceholder';

const placeholderImg = 'https://placehold.co/600x400?text=No+Image';

function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return match ? match[1] : null;
}

function getExcerptFromContent(html: string, wordCount = 15): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.split(/\s+/).slice(0, wordCount).join(' ') + (text.split(/\s+/).length > wordCount ? '...' : '');
}

export default function CategoryPage() {
  // Support both category and subcategory in the URL
  const params = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const categorySlug = params?.categorySlug;
  const subcategorySlug = params?.subcategorySlug;
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesData = await api.get('/categories');
        setCategories(categoriesData);
        // Find parent category
        const foundCategory = categoriesData.find((c: Category) => c.slug === categorySlug && c.parentId === null);
        setCategory(foundCategory || null);
        // Find subcategory if present
        let foundSubcategory: Category | null = null;
        if (subcategorySlug && foundCategory) {
          foundSubcategory = categoriesData.find((c: Category) => c.slug === subcategorySlug && c.parentId === foundCategory._id) || null;
        }
        setSubcategory(foundSubcategory);
        // Fetch posts by subcategory if present, else by category
        let postsData: Post[] = [];
        if (foundSubcategory) {
          postsData = await api.get(`/posts/by-category/${foundSubcategory.slug}`);
        } else if (foundCategory) {
          postsData = await api.get(`/posts/by-category/${foundCategory.slug}`);
        }
        setPosts(postsData);
        const tagsData = await api.get('/tags');
        setTags(tagsData);
      } catch (err) {
        setError('Failed to load category page');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [categorySlug, subcategorySlug]);

  const getCategoryNames = (cats: any[]) =>
    cats.map(cat => typeof cat === 'string' ? categories.find(c => c._id === cat)?.name : cat.name).filter(Boolean);
  const getTagNames = (tagsArr: any[]) =>
    tagsArr.map(tag => typeof tag === 'string' ? tags.find(t => t.id === tag)?.name : tag.name).filter(Boolean);

  // Sort posts by most recent first
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Show the 4 most recent posts for Latest News
  const latestNewsPosts = sortedPosts.slice(0, 4);

  // Exclude latest news posts from the rest
  const restPosts = sortedPosts.filter(post => !latestNewsPosts.some(news => news._id === post._id || news.id === post.id));

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

  // Use restPosts for main page content
  const sections = chunkSections(restPosts, 3, 4);
  const modernStartIdx = 3 + 4;
  const modernPosts = restPosts.slice(modernStartIdx, modernStartIdx + 11);
  const leftLarge = modernPosts[0];
  const leftSmall = modernPosts.slice(1, 4);
  const centerXL = modernPosts[4];
  const centerSmall = modernPosts.slice(5, 7);
  const rightLarge = modernPosts[7];
  const rightSmall = modernPosts.slice(8, 11);
  const afterModernIdx = modernStartIdx + modernPosts.length;
  const remainingPosts = restPosts.slice(afterModernIdx);

  // Helper to build post detail URL for posts in this page
  function getPostUrl(post: any) {
    // Use direct post slug for all posts
    return `/${post.slug}`;
  }

  if (loading) return <div className="flex justify-center p-8">Loading articles...</div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  if (!category) return <div className="p-4 text-red-500 bg-red-50 rounded-md">Category not found</div>;

  // Subcategories of the current parent category
  const subcategories = categories.filter(cat => cat.parentId === category._id);

  // In the sidebar, use latestNewsPosts instead of latestNewsPosts from posts
  const getSidebarStories = () => latestNewsPosts;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-2 md:px-0">
          {/* Header */}
          <header className="mb-4 border-b pb-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              {subcategory ? subcategory.name : category.name}
            </h1>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </header>
          {/* Category Navbar */}
          <nav className="flex justify-center mb-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <button
                    className={
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                    onClick={() => router.push('/')}
                  >
                        Tout
                  </button>
                </NavigationMenuItem>
                {subcategories.map(subcat => (
                  <NavigationMenuItem key={subcat._id}>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${subcategorySlug === subcat.slug ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900' : 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                      onClick={() => router.push(`/${category.slug}/${subcat.slug}`)}
                    >
                      {subcat.name}
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
            const sidebarStories = getSidebarStories();
            return (
              <div className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    {mainStory && (
                      <div className="flex flex-col border-b pb-6">
                        <Badge className="mb-2 self-start" variant="secondary">À la une</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                          <Link href={getPostUrl(mainStory)} className="hover:underline underline-offset-2 transition-all">
                            {mainStory.title}
                          </Link>
                        </h2>
                        <img
                          src={extractFirstImage(mainStory.content) || placeholderImg}
                          alt={mainStory.title}
                          className="w-full h-80 object-cover rounded mb-4"
                          loading="lazy"
                        />
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
                          <Link href={getPostUrl(mainStory)} className="hover:underline underline-offset-2 transition-all">
                            Lire la suite
                          </Link>
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {secondaryStories.map(post => (
                        <div key={post.id} className="flex flex-col border-b pb-4">
                          <img
                            src={extractFirstImage(post.content) || placeholderImg}
                            alt={post.title}
                            className="w-full h-40 object-cover rounded mb-2"
                            loading="lazy"
                          />
                          <h3 className="text-lg font-semibold mb-1">
                            <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all">
                              {post.title}
                            </Link>
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
                            <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all">
                              Lire la suite
                            </Link>
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
                              <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-semibold line-clamp-2">
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
                            <img
                              src={extractFirstImage(post.content) || placeholderImg}
                              alt={post.title}
                              className="w-20 h-20 object-cover rounded ml-2 flex-shrink-0 border"
                              loading="lazy"
                            />
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
                              <img
                                src={extractFirstImage(post.content) || placeholderImg}
                                alt={post.title}
                                className="w-full h-40 object-cover rounded mb-2"
                                loading="lazy"
                              />
                              <h4 className="text-md font-semibold mb-1">
                                <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all">
                                  {post.title}
                                </Link>
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
                                <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all">
                                  Lire la suite
                                </Link>
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
                  <img src={extractFirstImage(leftLarge.content) || placeholderImg} alt={leftLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                  <h3 className="text-xl font-bold mb-1">
                    <Link href={getPostUrl(leftLarge)} className="hover:underline underline-offset-2 transition-all">
                      {leftLarge.title}
                    </Link>
                  </h3>
                </div>
              )}
              {leftSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                </div>
              ))}
            </div>
            {/* Center column */}
            <div className="flex flex-col gap-6">
              {centerXL && (
                <div className="mb-2">
                  <img src={extractFirstImage(centerXL.content) || placeholderImg} alt={centerXL.title} className="w-full h-64 object-cover rounded mb-2" loading="lazy" />
                  <h2 className="text-2xl font-bold mb-1">
                    <Link href={getPostUrl(centerXL)} className="hover:underline underline-offset-2 transition-all">
                      {centerXL.title}
                    </Link>
                  </h2>
                  <div className="text-xs text-zinc-500 mb-1">By Unknown | {new Date(centerXL.createdAt).toLocaleDateString()}</div>
                </div>
              )}
              {centerSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-6">
              {rightLarge && (
                <div className="mb-2">
                  <img src={extractFirstImage(rightLarge.content) || placeholderImg} alt={rightLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                  <h3 className="text-xl font-bold mb-1">
                    <Link href={getPostUrl(rightLarge)} className="hover:underline underline-offset-2 transition-all">
                      {rightLarge.title}
                    </Link>
                  </h3>
                </div>
              )}
              {rightSmall.map(post => (
                <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                  <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
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
                          <img src={extractFirstImage(leftLarge.content) || placeholderImg} alt={leftLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                          <h3 className="text-xl font-bold mb-1">
                            <Link href={getPostUrl(leftLarge)} className="hover:underline underline-offset-2 transition-all">
                              {leftLarge.title}
                            </Link>
                          </h3>
                        </div>
                      )}
                      {leftSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                          <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                          <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                        </div>
                      ))}
                    </div>
                    {/* Center column */}
                    <div className="flex flex-col gap-6">
                      {centerXL && (
                        <div className="mb-2">
                          <img src={extractFirstImage(centerXL.content) || placeholderImg} alt={centerXL.title} className="w-full h-64 object-cover rounded mb-2" loading="lazy" />
                          <h2 className="text-2xl font-bold mb-1">
                            <Link href={getPostUrl(centerXL)} className="hover:underline underline-offset-2 transition-all">
                              {centerXL.title}
                            </Link>
                          </h2>
                          <div className="text-xs text-zinc-500 mb-1">By Unknown | {new Date(centerXL.createdAt).toLocaleDateString()}</div>
                        </div>
                      )}
                      {centerSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                          <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                          <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
                        </div>
                      ))}
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                      {rightLarge && (
                        <div className="mb-2">
                          <img src={extractFirstImage(rightLarge.content) || placeholderImg} alt={rightLarge.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
                          <h3 className="text-xl font-bold mb-1">
                            <Link href={getPostUrl(rightLarge)} className="hover:underline underline-offset-2 transition-all">
                              {rightLarge.title}
                            </Link>
                          </h3>
                        </div>
                      )}
                      {rightSmall.map(post => (
                        <div key={post.id} className="flex gap-3 items-center border-b pb-2">
                          <img src={extractFirstImage(post.content) || placeholderImg} alt={post.title} className="w-16 h-16 object-cover rounded" loading="lazy" />
                          <Link href={getPostUrl(post)} className="hover:underline underline-offset-2 transition-all font-medium line-clamp-2">{post.title}</Link>
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
