'use client';

import {useState, useEffect} from 'react';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Category } from '../../types/post';

// Skeleton components to prevent layout shifts
const SkeletonText = ({ className = '' }: { className?: string }) => (
  <div className={`bg-zinc-700 animate-pulse rounded ${className}`}></div>
);

const SkeletonCategory = () => (
  <div className="space-y-2">
    <SkeletonText className="h-5 w-24" />
    <div className="space-y-1">
      <SkeletonText className="h-4 w-20" />
      <SkeletonText className="h-4 w-16" />
    </div>
  </div>
);

const SkeletonNewsItem = () => (
  <li>
    <SkeletonText className="h-5 w-32 mb-1" />
    <SkeletonText className="h-3 w-24" />
  </li>
);

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [footerContent, setFooterContent] = useState('');
  const [footerLoading, setFooterLoading] = useState(true);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Prevent layout shift by delaying content change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 100); // Small delay to ensure stable initial render
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    const fetchLatestNews = async () => {
      setNewsLoading(true);
      try {
        const data = await api.get('/posts');
        // Get latest 2 published posts
        const publishedPosts = Array.isArray(data) ? data : (data?.data || []);
        const latest = publishedPosts
          .filter((post: any) => post.status === 'published')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);
        setLatestNews(latest);
      } catch (err) {
        setLatestNews([]);
      } finally {
        setNewsLoading(false);
      }
    };
    
    // Fetch footer content
    const fetchFooter = async () => {
      setFooterLoading(true);
      try {
        const data = await api.get('/settings/footer');
        setFooterContent(data.footerContent || '');
      } catch (err) {
        setFooterContent('');
      } finally {
        setFooterLoading(false);
      }
    };
    
    fetchCategories();
    fetchLatestNews();
    fetchFooter();
  }, []);

  // Helper to build category tree
  function buildCategoryTree(categories: Category[], parentId: string | null = null): (Category & { children: ReturnType<typeof buildCategoryTree> })[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat._id),
      }));
  }
  const categoryTree = buildCategoryTree(categories);

  // Default footer content to prevent layout shift
  const defaultFooterContent = 'CRM est une plateforme d\'actualités professionnelle. Nous fournissons uniquement du contenu intéressant que vous apprécierez. Nous nous efforçons de livrer les meilleures nouvelles, en nous concentrant sur la fiabilité et les dernières mises à jour aux États-Unis et dans le monde entier.';

  return (
    <footer 
      className="bg-zinc-800 border-t border-zinc-700 mt-16 min-h-[600px]" 
      style={{ 
        contain: 'layout style',
        willChange: 'auto'
      }}
    >
      {/* Top Row: Company Name and Nav */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[80px]">
          <span className="text-4xl font-extrabold font-serif text-white">Handicap Internatioanl</span>
          {/* Footer Navigation with Layout Shift Prevention */}
          <nav 
            className="flex flex-wrap gap-3 sm:gap-6 md:gap-8 font-semibold text-base min-h-[60px] items-start"
            style={{ 
              contain: 'layout style',
              willChange: 'auto'
            }}
          >
            {(categoriesLoading || isInitialRender) ? (
              // Navigation skeleton to prevent layout shifts
              <>
                <div className="h-6 w-16 bg-zinc-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-zinc-700 rounded animate-pulse" />
                <div className="h-6 w-18 bg-zinc-700 rounded animate-pulse" />
                <div className="h-6 w-22 bg-zinc-700 rounded animate-pulse" />
                <div className="h-6 w-16 bg-zinc-700 rounded animate-pulse" />
                <div className="h-6 w-24 bg-zinc-700 rounded animate-pulse" />
              </>
            ) : (
              <>
                {categories.length > 0 ? (
                  categories.slice(0, 6).map((category) => (
                    <Link
                      key={category._id}
                      href={`/${category.slug}`}
                      className="text-zinc-300 hover:text-white transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  // Fallback content to maintain layout
                  <>
                    <span className="text-zinc-300">Actualités</span>
                    <span className="text-zinc-300">Sport</span>
                    <span className="text-zinc-300">Culture</span>
                    <span className="text-zinc-300">Économie</span>
                    <span className="text-zinc-300">Politique</span>
                    <span className="text-zinc-300">International</span>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
      <div className="border-b border-white w-full mt-2 mb-8"></div>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8 min-h-[400px]">
        {/* First Row: About Us and Subscribe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8 min-h-[280px]">
          {/* About Us */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-xl mb-2 text-zinc-50">À propos de nous</h3>
            <div className="text-sm text-zinc-300 mb-6 min-h-[120px]">
              {(footerLoading || isInitialRender) ? (
                <div className="space-y-2">
                  <SkeletonText className="h-4 w-full" />
                  <SkeletonText className="h-4 w-full" />
                  <SkeletonText className="h-4 w-3/4" />
                  <SkeletonText className="h-4 w-full" />
                  <SkeletonText className="h-4 w-2/3" />
                </div>
              ) : (
                <p>{footerContent || defaultFooterContent}</p>
              )}
            </div>
            <div className="flex gap-4 text-2xl text-zinc-400">
              <a href="#" className="hover:text-white transition"><FaFacebookF /></a>
              <a href="#" className="hover:text-white transition"><FaInstagram /></a>
              <a href="#" className="hover:text-white transition"><FaXTwitter /></a>
            </div>
          </div>
          
          {/* Subscribe */}
          <div>
            <h3 className="font-bold text-xl mb-2 text-zinc-50">Les Dernières<br/>S'abonner</h3>
            <form className="mb-3">
              <input type="email" placeholder="Adresse e-mail" className="w-full border border-zinc-800 bg-zinc-900 text-zinc-50 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-400" />
              <button type="submit" className="w-full bg-white text-zinc-900 font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-zinc-100 transition">JE M'ABONNE <span aria-hidden>→</span></button>
            </form>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" className="accent-white" />
              J'ai lu et j'accepte la <a href="#" className="text-white underline ml-1">Politique de confidentialité</a>.
            </label>
          </div>
          
          {/* Latest News */}
          <div>
            <h3 className="font-bold text-xl mb-2 text-zinc-50">Dernières nouvelles</h3>
            <ul className="space-y-4 min-h-[160px]">
              {(newsLoading || isInitialRender) ? (
                <>
                  <SkeletonNewsItem />
                  <SkeletonNewsItem />
                </>
              ) : latestNews.length > 0 ? (
                latestNews.map((post, i) => (
                  <li key={post._id || post.id || i}>
                    <Link href={`/${post.slug}`} className="block font-bold text-zinc-50 hover:underline underline-offset-2 transition-all mb-1 hover:text-white">
                      {post.title}
                    </Link>
                    <div className="text-xs uppercase text-zinc-400 font-semibold mb-0.5">
                      {post.categoryIds && post.categoryIds.length > 0 ? (
                        typeof post.categoryIds[0] === 'string' 
                          ? categories.find(cat => cat._id === post.categoryIds[0])?.name?.toUpperCase() || 'NEWS'
                          : post.categoryIds[0]?.name?.toUpperCase() || 'NEWS'
                      ) : 'NEWS'} 
                      <span className="normal-case font-normal text-zinc-500 ml-2">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500">Aucune nouvelle récente disponible</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Second Row: Categories - Always render with fixed height to prevent layout shift */}
        <div className="border-t border-zinc-700 pt-8">
          <h3 className="font-bold text-xl mb-4 text-zinc-50">Catégories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 min-h-[120px]">
            {(categoriesLoading || isInitialRender) ? (
              // Show skeleton categories
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCategory key={i} />
              ))
            ) : categoryTree.length > 0 ? (
              categoryTree.map(cat => (
                <div key={cat._id} className="space-y-2">
                  <Link href={`/${cat.slug}`} className="hover:underline font-semibold text-zinc-200 hover:text-white block">
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <ul className="space-y-1">
                      {cat.children.map(sub => (
                        <li key={sub._id}>
                          <Link href={`/${cat.slug}/${sub.slug}`} className="hover:underline text-sm text-zinc-300 hover:text-white block">
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-zinc-500 text-center py-8">
                Aucune catégorie disponible
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-zinc-700 py-4 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} handicap-internatioanl.fr. Tous droits réservés. handicap-internatioanl.fr participe au programme Amazon Services LLC Associates, un programme de publicité d'affiliation conçu pour fournir aux sites un moyen de gagner des frais de publicité en faisant de la publicité et en créant des liens vers Amazon.com.
        </div>
      </div>
    </footer>
  );
} 