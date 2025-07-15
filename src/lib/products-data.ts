
export interface Product {
  slug: string;
  name: string;
  origin: string;
  description: string;
  price: number;
  image: string;
  aiHint: string;
  rating: number;
  reviews: number;
  tags: string[];
  roast: string;
}

const initialProducts: Product[] = [
  {
    slug: 'aceh-gayo',
    name: 'Aceh Gayo',
    origin: 'Gayo Highlands, Aceh',
    description: 'A rich, full-bodied coffee with earthy notes of dark chocolate, cedar, and a hint of spice. Known for its smooth finish and low acidity, making it a classic Indonesian favorite.',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1607681034540-2c46cc71896d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'coffee beans bag',
    rating: 4.8,
    reviews: 125,
    tags: ['Earthy', 'Spicy', 'Full Body'],
    roast: 'Medium-Dark',
  },
  {
    slug: 'bali-kintamani',
    name: 'Bali Kintamani',
    origin: 'Kintamani Highlands, Bali',
    description: 'A smooth, sweet coffee with a clean finish and bright, citrusy undertones. Grown on volcanic soil alongside citrus fruits, which imparts a unique fruity aroma and flavor.',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1629248989876-07129a68946d?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'bali landscape',
    rating: 4.9,
    reviews: 98,
    tags: ['Fruity', 'Citrus', 'Clean'],
    roast: 'Medium',
  },
  {
    slug: 'flores-bajawa',
    name: 'Flores Bajawa',
    origin: 'Bajawa, Flores',
    description: 'A complex coffee with beautiful floral aromas, sweet chocolate notes, and a syrupy, lingering body. The unique terroir of Flores gives this coffee a truly memorable character.',
    price: 150000,
    image: 'https://plus.unsplash.com/premium_photo-1681324222331-935fd4bc5180?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'indonesian flowers',
    rating: 4.7,
    reviews: 82,
    tags: ['Floral', 'Chocolate', 'Syrupy'],
    roast: 'Medium',
  },
  {
    slug: 'sumatra-mandheling',
    name: 'Sumatra Mandheling',
    origin: 'Mandailing, Sumatra',
    description: 'Famously smooth and heavy-bodied, this coffee presents deep, resonant notes of tobacco, dark cocoa, and a whisper of tropical fruit. A truly classic and satisfying cup.',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1515694590185-73647ba02c10?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'sumatra jungle',
    rating: 4.8,
    reviews: 110,
    tags: ['Full Body', 'Earthy', 'Complex'],
    roast: 'Dark',
  },
  {
    slug: 'toraja-kalosi',
    name: 'Toraja Kalosi',
    origin: 'Tana Toraja, Sulawesi',
    description: 'Well-balanced with a velvety body and notes of ripe fruit and dark chocolate. It has a vibrant yet low-toned acidity, making it a delightfully complex and clean coffee.',
    price: 140000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'sulawesi mountains',
    rating: 4.9,
    reviews: 102,
    tags: ['Balanced', 'Chocolate', 'Fruity'],
    roast: 'Medium-Dark',
  },
  {
    slug: 'java-preanger',
    name: 'Java Preanger',
    origin: 'West Java',
    description: 'One of the world\'s oldest coffee cultivation areas. This coffee offers a medium body, a mild acidity, and a smooth, clean taste with a sweet, slightly herbaceous finish.',
    price: 130000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'java coffee plantation',
    rating: 4.6,
    reviews: 75,
    tags: ['Smooth', 'Sweet', 'Herbal'],
    roast: 'Medium',
  },
  {
    slug: 'papua-wamena',
    name: 'Papua Wamena',
    origin: 'Wamena, Papua',
    description: 'Grown in the remote highlands of Papua, this coffee has a clean, crisp flavor with a heavy body, low acidity, and notes of caramel, nuts, and a hint of stone fruit.',
    price: 160000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'papua landscape',
    rating: 4.8,
    reviews: 65,
    tags: ['Caramel', 'Nutty', 'Clean'],
    roast: 'Medium'
  },
];


// Singleton pattern to hold products in memory
class ProductStore {
  private static instance: ProductStore;
  private products: Product[];

  private constructor() {
    this.products = initialProducts;
  }

  public static getInstance(): ProductStore {
    if (!ProductStore.instance) {
      ProductStore.instance = new ProductStore();
    }
    return ProductStore.instance;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public addProduct(productData: Omit<Product, 'slug' | 'rating' | 'reviews' | 'tags'> & { tags: string }): Product {
    const newProduct: Product = {
      ...productData,
      slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      rating: 0, // Default value for new products
      reviews: 0, // Default value
      tags: productData.tags.split(',').map(tag => tag.trim()),
    };
    this.products.unshift(newProduct); // Add to the beginning
    return newProduct;
  }
}

// Function to add a product from another component
export const addProduct = (productData: Omit<Product, 'slug' | 'rating' | 'reviews' | 'tags'> & { tags: string }) => {
  return ProductStore.getInstance().addProduct(productData);
}

// Function to get all products
export const getProducts = () => {
    return ProductStore.getInstance().getProducts();
}
