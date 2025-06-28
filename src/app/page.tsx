import { Metadata } from 'next';
import ArticlesSSR from '@/page-components/ArticlesSSR';
import { generateHomeMetadata } from '@/lib/seo';

// Generate metadata for SEO
export const metadata: Metadata = generateHomeMetadata();

// Server-side data fetching
async function fetchHomePageData() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log('SSR: Fetching data from:', apiBaseUrl);
    
    const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/posts`, { 
        next: { 
          revalidate: 180, // Cache for 3 minutes
          tags: ['posts'] 
        },
        headers: {
          'User-Agent': 'NextJS-SSR/1.0',
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${apiBaseUrl}/categories`, { 
        next: { 
          revalidate: 300, // Cache for 5 minutes
          tags: ['categories'] 
        },
        headers: {
          'User-Agent': 'NextJS-SSR/1.0',
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${apiBaseUrl}/tags`, { 
        next: { 
          revalidate: 600, // Cache for 10 minutes
          tags: ['tags'] 
        },
        headers: {
          'User-Agent': 'NextJS-SSR/1.0',
          'Content-Type': 'application/json'
        }
      }),
    ]);

    console.log('SSR: Response status - Posts:', postsResponse.status, 'Categories:', categoriesResponse.status, 'Tags:', tagsResponse.status);

    const [postsData, categoriesData, tagsData] = await Promise.all([
      postsResponse.ok ? postsResponse.json() : [],
      categoriesResponse.ok ? categoriesResponse.json() : [],
      tagsResponse.ok ? tagsResponse.json() : [],
    ]);

    // Normalize data (same logic as client-side)
    const normalizedPosts = Array.isArray(postsData) ? postsData : 
                           (postsData?.data ? postsData.data : []);
    const normalizedCategories = Array.isArray(categoriesData) ? categoriesData : 
                               (categoriesData?.data ? categoriesData.data : 
                               (categoriesData?.categories ? categoriesData.categories : []));
    const normalizedTags = Array.isArray(tagsData) ? tagsData : 
                          (tagsData?.data ? tagsData.data : 
                          (tagsData?.tags ? tagsData.tags : []));

    const publishedPosts = normalizedPosts.filter((post: any) => post.status === 'published');
    
    // Filter posts to only include those with image_urls array (don't validate URLs yet)
    const postsWithImages = publishedPosts.filter((post: any) => 
      Array.isArray(post.image_urls) && post.image_urls.length > 0
    );
    
    console.log('SSR: Data loaded -', postsWithImages.length, 'posts with image arrays,', normalizedCategories.length, 'categories,', normalizedTags.length, 'tags');

    return {
      posts: postsWithImages,
      categories: normalizedCategories,
      tags: normalizedTags,
    };
  } catch (error) {
    console.error('SSR: Error fetching homepage data:', error);
    return {
      posts: [],
      categories: [],
      tags: [],
    };
  }
}

export default async function HomePage() {
  const data = await fetchHomePageData();
  
  return <ArticlesSSR initialData={data} />;
} 