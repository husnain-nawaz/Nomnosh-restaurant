import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/mysql_database.json');

// Ensure data folder exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data based exactly on NOM NOSH Pizza PDF
const INITIAL_DB = {
  users: [
    {
      id: 1,
      name: "Store Manager",
      email: "admin@nomnoshpizza.com",
      password_hash: "admin123", // demo password
      role: "admin",
      google_id: null,
      avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
      phone: "+92 304 1118514",
      address: "88-A, Main Fateh Sher Road, Sahiwal",
      created_at: "2026-01-01 10:00:00"
    },
    {
      id: 2,
      name: "Sale Meezu",
      email: "sale@meezu.pk",
      password_hash: "password123",
      role: "customer",
      google_id: "google-109283746",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sale",
      phone: "+92 300 1234567",
      address: "House 14, Block C, Sahiwal Colony, Sahiwal",
      created_at: "2026-02-15 14:30:00"
    }
  ],
  categories: [
    { id: 1, slug: "delivery-deals", name: "Delivery Deals", banner_title: "DELIVERY Deals", banner_subtitle: "Exclusive online feast combos & savings", sort_order: 1 },
    { id: 2, slug: "mega-nosh-deal", name: "Mega Nosh Deal", banner_title: "MEGA NOSH Deal", banner_subtitle: "Big cravings, bigger portions", sort_order: 2 },
    { id: 3, slug: "super-deals", name: "Super Deals", banner_title: "GET MORE Taste WITH EVERY DEAL", banner_subtitle: "Unbeatable value for group hangouts", sort_order: 3 },
    { id: 4, slug: "appetizers", name: "Appetizers", banner_title: "Appetizers THAT MAKE YOU CRAVE MORE", banner_subtitle: "Wings, crispy bites & cheesy sticks", sort_order: 4 },
    { id: 5, slug: "highly-recommended-pizzas", name: "Highly Recommended Pizzas", banner_title: "THE Pizzas EVERYONE CAN'T STOP TALKING ABOUT", banner_subtitle: "Crown Crust, Stuffed Crust & House Innovations", sort_order: 5 },
    { id: 6, slug: "chef-special-pizzas", name: "Chef Special Pizzas", banner_title: "Our Chef's MAGIC MADE JUST FOR YOU", banner_subtitle: "Malai Boti, Bistro, All The Meat & Cheese Burst", sort_order: 6 },
    { id: 7, slug: "regular-pizza-flavors", name: "Regular Pizza Flavors", banner_title: "Classic Flavors THAT NEVER GO OUT OF STYLE", banner_subtitle: "Chicken Fajita, Supreme, Tikka & Sicilian", sort_order: 7 },
    { id: 8, slug: "burgers", name: "Burgers", banner_title: "TAKE A Big Bite OF PURE HAPPINESS", banner_subtitle: "Juicy crispers, double patties & gourmet sauces", sort_order: 8 },
    { id: 9, slug: "fried-cravings", name: "Fried Cravings", banner_title: "TASTE THE Crunch THAT HITS DIFFERENT", banner_subtitle: "Injected broast, nuggets, tenders & loaded fries", sort_order: 9 },
    { id: 10, slug: "pastas", name: "Pastas", banner_title: "DIVE INTO CREAMY Cheesy PERFECTION", banner_subtitle: "Baked pasta bowls drenched in rich sauces", sort_order: 10 },
    { id: 11, slug: "sandwiches", name: "Sandwiches", banner_title: "LAYERED Freshness IN EVERY BITE", banner_subtitle: "Calzone chunks, Mexican melts & stackers", sort_order: 11 },
    { id: 12, slug: "wraps-rolls", name: "Wraps & Rolls", banner_title: "Wrap YOUR HUNGER IN BOLD FLAVOR", banner_subtitle: "Behari spin rolls, grilled wraps & shawarma style", sort_order: 12 },
    { id: 13, slug: "platters", name: "Platters", banner_title: "ALL YOUR Favorites ON ONE PLATE", banner_subtitle: "Wings, rolls, fries & sauces feast", sort_order: 13 },
    { id: 14, slug: "beverages", name: "Beverages", banner_title: "Refresh, Relax AND SIP THE CHILL", banner_subtitle: "Ice cold sodas, next cola & mineral waters", sort_order: 14 }
  ],
  menu_items: [
    // Delivery Deals
    {
      id: 101,
      category_slug: "delivery-deals",
      name: "NOM NOM Combo",
      description: "2 Nom Max Burger, 2 Pcs Fried Chicken, and 500ml chilled drink. The ultimate duo combo.",
      price: 1449.00,
      original_price: 1750.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      is_deal: true,
      sizes_json: ["Standard Deal"],
      options_json: ["Drink: Coke", "Drink: Sprite", "Drink: Next Cola"]
    },
    {
      id: 102,
      category_slug: "delivery-deals",
      name: "Hunger Buster Deal",
      description: "1 Chef Special Pizza (Medium), 1 Nom Max Burger, and 1 Liter Soft Drink. Perfect for 2-3 foodies.",
      price: 2699.00,
      original_price: 3100.00,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      is_deal: true,
      sizes_json: ["Standard Deal"],
      options_json: ["Pizza Flavor: Malai Boti", "Pizza Flavor: Bistro", "Pizza Flavor: Crown Crust"]
    },
    {
      id: 103,
      category_slug: "delivery-deals",
      name: "Super Max Deal",
      description: "2 Nom Max Burger, Chicken Strips (6 Pcs) with fresh fries & 500ml drink.",
      price: 1499.00,
      original_price: 1800.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      is_deal: true,
      sizes_json: ["Standard Deal"],
      options_json: ["Drink: 500ml Next Cola", "Drink: 500ml Sprite", "Drink: 500ml Fanta"]
    },
    // Mega Nosh Deal
    {
      id: 201,
      category_slug: "mega-nosh-deal",
      name: "Mega Nosh Deal",
      description: "1 Large Pizza, 4 Pcs Injected Broast, 1.5 Ltr Chilled Drink. The signature family feast.",
      price: 2680.00,
      original_price: 3200.00,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      is_deal: true,
      sizes_json: ["1 Large Pizza + 4 Broast + 1.5L"],
      options_json: ["Flavor: Chicken Fajita", "Flavor: Chicken Tikka", "Flavor: Supreme"]
    },
    // Super Deals
    {
      id: 301,
      category_slug: "super-deals",
      name: "Deal 1",
      description: "1 Nom Max Burger, Regular Fries & Regular Soft Drink.",
      price: 700.00,
      original_price: 850.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      is_deal: true
    },
    {
      id: 302,
      category_slug: "super-deals",
      name: "Deal 2",
      description: "1 Spice Burger, Regular Fries & Regular Soft Drink.",
      price: 620.00,
      original_price: 750.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      is_deal: true
    },
    {
      id: 303,
      category_slug: "super-deals",
      name: "Deal 3",
      description: "1 Medium Pizza (Reg Flavor), 3 Pcs Wings & 500ml Soft Drink.",
      price: 1460.00,
      original_price: 1750.00,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      is_deal: true
    },
    {
      id: 304,
      category_slug: "super-deals",
      name: "Deal 4",
      description: "1 Large Pizza (Reg Flavor), 2 Pcs Hot Shots & 1.5 Ltr Soft Drink.",
      price: 2400.00,
      original_price: 2850.00,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      is_deal: true
    },
    {
      id: 305,
      category_slug: "super-deals",
      name: "Deal 5",
      description: "2 Medium Pizzas (Reg Flavor) & 1.5 Ltr Soft Drink.",
      price: 2320.00,
      original_price: 2750.00,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      is_deal: true
    },
    {
      id: 306,
      category_slug: "super-deals",
      name: "Deal 6",
      description: "2 Large Pizzas (Reg Flavor) & 1.5 Ltr Soft Drink. Ideal for gatherings and party nights.",
      price: 3150.00,
      original_price: 3700.00,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      is_deal: true
    },
    // Appetizers
    {
      id: 401,
      category_slug: "appetizers",
      name: "Oven Baked Wings",
      description: "Perfect marinated wings, oven baked until golden brown with aromatic spices.",
      price: 340.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true,
      sizes_json: ["4 Pieces (Rs. 340)", "8 Pieces (Rs. 650)", "12 Pieces (Rs. 920)"]
    },
    {
      id: 402,
      category_slug: "appetizers",
      name: "Flaming Wings",
      description: "Crispy wings tossed in fiery red hot flaming sauce with chili flakes and sesame.",
      price: 390.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true,
      sizes_json: ["4 Pieces (Rs. 390)", "8 Pieces (Rs. 720)"]
    },
    {
      id: 403,
      category_slug: "appetizers",
      name: "Cheese Stick",
      description: "Crispy outer crumb with oozing mozzarella cheese center, served with house marinara dip.",
      price: 800.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    {
      id: 404,
      category_slug: "appetizers",
      name: "Kabab Sticks",
      description: "Juicy, flavorful kabab skewers seasoned to perfection with traditional Pakistani spices.",
      price: 700.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    // Highly Recommended Pizzas
    {
      id: 501,
      category_slug: "highly-recommended-pizzas",
      name: "Crown Crust Pizza",
      description: "Regal stuffed-pocket crown rim filled with kabab chunks, topped with smoked chicken, mozzarella and olives.",
      price: 1450.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Medium 10\" (Rs. 1,450)", "Large 13\" (Rs. 2,150)"]
    },
    {
      id: 502,
      category_slug: "highly-recommended-pizzas",
      name: "Stuffed Crust Pizza",
      description: "Thick hand-tossed dough with crust edges overflowing with melted cheddar and mozzarella cheese rope.",
      price: 1550.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Medium 10\" (Rs. 1,550)", "Large 13\" (Rs. 2,250)"]
    },
    {
      id: 503,
      category_slug: "highly-recommended-pizzas",
      name: "Behari Kabab Pizza",
      description: "A royal treat with tender Behari spicy marinated kabab cuts, sliced onions, and garlic herb drizzle.",
      price: 1450.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Medium 10\" (Rs. 1,450)", "Large 13\" (Rs. 2,100)"]
    },
    {
      id: 504,
      category_slug: "highly-recommended-pizzas",
      name: "Grill Bite Pizza",
      description: "White sauce base topped with charred grilled chicken chunks, roasted capsicum, and herb flakes.",
      price: 1550.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Medium 10\" (Rs. 1,550)", "Large 13\" (Rs. 2,200)"]
    },
    {
      id: 505,
      category_slug: "highly-recommended-pizzas",
      name: "Square Pizza",
      description: "Artisanal square shaped pan pizza with crispy crust, packed with rich tomato sauce and double pepperoni.",
      price: 1550.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Medium (Rs. 1,550)", "Large (Rs. 2,200)"]
    },
    // Chef Special Pizzas
    {
      id: 601,
      category_slug: "chef-special-pizzas",
      name: "Malai Boti Pizza",
      description: "A velvety delight with juicy chicken malai boti chunks, creamy white sauce, onions, and melted cheese.",
      price: 1350.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 750)", "Medium 10\" (Rs. 1,350)", "Large 13\" (Rs. 1,950)"]
    },
    {
      id: 602,
      category_slug: "chef-special-pizzas",
      name: "Bistro Pizza",
      description: "Unique blend of three special secret sauces, tender chicken, mushrooms, and black olives.",
      price: 1350.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 750)", "Medium 10\" (Rs. 1,350)", "Large 13\" (Rs. 1,950)"]
    },
    {
      id: 603,
      category_slug: "chef-special-pizzas",
      name: "All The Meat",
      description: "Loaded with a powerhouse medley of pepperoni, smoked chicken, sausage bits, and savory ground beef.",
      price: 1350.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 750)", "Medium 10\" (Rs. 1,350)", "Large 13\" (Rs. 1,950)"]
    },
    {
      id: 604,
      category_slug: "chef-special-pizzas",
      name: "Cheese Burst",
      description: "A gooey cheese lover's dream with layers of molten liquid cheese encased inside and over the crust.",
      price: 1350.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 750)", "Medium 10\" (Rs. 1,350)", "Large 13\" (Rs. 1,950)"]
    },
    // Regular Pizza Flavors
    {
      id: 701,
      category_slug: "regular-pizza-flavors",
      name: "Chicken Fajita",
      description: "Traditional favorite with flavorful Mexican fajita seasoned chicken, bell peppers, onions, and mozzarella.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    {
      id: 702,
      category_slug: "regular-pizza-flavors",
      name: "Chicken Supreme",
      description: "Ultimate all-rounder with chicken tikka & fajita mix, mushrooms, green peppers, onions, and black olives.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    {
      id: 703,
      category_slug: "regular-pizza-flavors",
      name: "Chicken Tikka",
      description: "A classic Pakistani favorite with smoky tandoori chicken chunks, sweet onions, and melted cheese.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    {
      id: 704,
      category_slug: "regular-pizza-flavors",
      name: "Cheese Lover",
      description: "Pure comfort: 100% genuine mozzarella and golden cheddar blend baked to bubbly golden perfection.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    {
      id: 705,
      category_slug: "regular-pizza-flavors",
      name: "Fajita Sicilian",
      description: "Spicy kick loaded with spicy chicken chunks, fiery jalapeños, onions, and Mexican salsa seasoning.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    {
      id: 706,
      category_slug: "regular-pizza-flavors",
      name: "Veggie Lover",
      description: "Garden fresh medley of mushrooms, sweet corn, crisp bell peppers, tomatoes, and kalamata olives.",
      price: 650.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true,
      sizes_json: ["Small 7\" (Rs. 650)", "Medium 10\" (Rs. 1,200)", "Large 13\" (Rs. 1,750)"]
    },
    // Burgers
    {
      id: 801,
      category_slug: "burgers",
      name: "Nom D Max Burger",
      description: "Double the fun with a double crispy zinger fillet, cheese slice, house mayo, and fresh iceberg lettuce.",
      price: 550.00,
      original_price: 620.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 802,
      category_slug: "burgers",
      name: "Nom Max Burger",
      description: "Crispy single fillet layered with special signature sauce, fresh crunchy lettuce, and melted cheese.",
      price: 480.00,
      original_price: 520.00,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 803,
      category_slug: "burgers",
      name: "Grilled Chicken Burger",
      description: "Juicy flame-grilled chicken breast with smoky BBQ glaze, onion rings, and creamy ranch.",
      price: 580.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 804,
      category_slug: "burgers",
      name: "Chicken Patty Burger",
      description: "Crispy seasoned chicken patty topped with tangy garlic mayo and iceberg lettuce.",
      price: 380.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 805,
      category_slug: "burgers",
      name: "Spice Burger",
      description: "Spicy chapli patty with garlic chili mayo, crisp cucumber, and vine tomatoes.",
      price: 380.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    // Fried Cravings
    {
      id: 901,
      category_slug: "fried-cravings",
      name: "Injected Broast",
      description: "Crispy marinated broast pieces injected with spicy secret sauce, served with dinner roll and dip.",
      price: 1150.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true,
      sizes_json: ["Quarter Broast (Rs. 1,150)", "Half Broast (Rs. 1,950)"]
    },
    {
      id: 902,
      category_slug: "fried-cravings",
      name: "Loaded Fries",
      description: "Crispy french fries loaded with cheddar cheese sauce, fried chicken chunks, and sliced jalapeños.",
      price: 500.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 903,
      category_slug: "fried-cravings",
      name: "French Fries",
      description: "Golden crispy potato fries, salted to perfection with house garlic mayo dip.",
      price: 300.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      sizes_json: ["Regular (Rs. 300)", "Large (Rs. 450)"]
    },
    {
      id: 904,
      category_slug: "fried-cravings",
      name: "Fried Chicken Strips",
      description: "Tender boneless chicken strips in crunchy batter with honey mustard dip (6 Pcs).",
      price: 800.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    {
      id: 905,
      category_slug: "fried-cravings",
      name: "Nuggets",
      description: "Crispy golden bite-size nuggets made from tender chicken breast.",
      price: 390.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      sizes_json: ["6 Pieces (Rs. 390)", "10 Pieces (Rs. 590)"]
    },
    {
      id: 906,
      category_slug: "fried-cravings",
      name: "Hotshots",
      description: "Spicy bite-sized crunchy chicken poppers tossed in peri salt.",
      price: 400.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    // Pastas
    {
      id: 1001,
      category_slug: "pastas",
      name: "NomNosh Special Pasta",
      description: "Oven baked penne loaded with chicken tikka, rich velvety white sauce, and baked mozzarella crust.",
      price: 560.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true
    },
    {
      id: 1002,
      category_slug: "pastas",
      name: "Flaming Pasta",
      description: "Fiery spicy red marinara pasta with spicy chicken cubes, red peppers, and molten cheese.",
      price: 520.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true
    },
    // Sandwiches
    {
      id: 1101,
      category_slug: "sandwiches",
      name: "Calazone Chunks",
      description: "Folded pocket pizza crust stuffed with chicken tikka, melted mozzarella, and pizza sauce.",
      price: 1050.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true
    },
    {
      id: 1102,
      category_slug: "sandwiches",
      name: "Mexican Sandwich",
      description: "Spicy Mexican grilled chicken with sweet corn, jalapeños, and sliced cheese on toasted sourdough.",
      price: 800.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 1103,
      category_slug: "sandwiches",
      name: "Pizza Stacker",
      description: "Multi-layered sandwich stacked with grilled chicken, pizza sauce, and double mozzarella pull.",
      price: 850.00,
      original_price: null,
      image_url: "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: true
    },
    // Wraps & Rolls
    {
      id: 1201,
      category_slug: "wraps-rolls",
      name: "Nom Max Wrap",
      description: "Crispy zinger tenders wrapped in soft tortilla with garlic mayo and shredded lettuce.",
      price: 550.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true
    },
    {
      id: 1202,
      category_slug: "wraps-rolls",
      name: "Malai Boti Wrap",
      description: "Tender malai boti chunks enveloped in grilled flatbread with pickled onions and mint sauce.",
      price: 620.00,
      original_price: null,
      image_url: "/src/assets/images/banner_chef_special_pizza_1791465684202.jpg",
      is_available: true
    },
    {
      id: 1203,
      category_slug: "wraps-rolls",
      name: "Behari Spin Rolls",
      description: "Paratha roll packed with smoky Behari spiced beef or chicken cuts with onion rings (4 Pcs).",
      price: 630.00,
      original_price: null,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    // Platters
    {
      id: 1301,
      category_slug: "platters",
      name: "Nomnosh Special Platter",
      description: "4 Pcs Behari Rolls, 3 Pcs Oven Baked Wings, Loaded Fries & 2 Dips.",
      price: 1120.00,
      original_price: 1350.00,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    {
      id: 1302,
      category_slug: "platters",
      name: "Behari Platter",
      description: "4 Pcs Behari Kabab, 4 Pcs Arabian Rolls, Spiced Fries & Garlic Dip.",
      price: 1080.00,
      original_price: 1290.00,
      image_url: "/src/assets/images/banner_appetizers_wings_1791465673062.jpg",
      is_available: true
    },
    // Beverages
    {
      id: 1401,
      category_slug: "beverages",
      name: "Soft Drink",
      description: "Ice-cold Coca Cola, Sprite, Fanta, or Next Cola in your preferred size.",
      price: 90.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      sizes_json: ["Can 345ml (Rs. 90)", "Bottle 500ml (Rs. 130)", "Bottle 1.5L (Rs. 220)"]
    },
    {
      id: 1402,
      category_slug: "beverages",
      name: "Mineral Water",
      description: "Chilled purified mineral drinking water (500ml / 1500ml).",
      price: 60.00,
      original_price: null,
      image_url: "/src/assets/images/banner_delivery_deals_1791465662921.jpg",
      is_available: true,
      sizes_json: ["Small 500ml (Rs. 60)", "Large 1.5L (Rs. 110)"]
    }
  ],
  orders: [
    {
      id: "NN-8091",
      user_id: 2,
      customer_name: "Sale Meezu",
      customer_email: "sale@meezu.pk",
      customer_phone: "+92 300 1234567",
      delivery_address: "House 14, Block C, Sahiwal Colony, Sahiwal",
      city: "Sahiwal",
      order_type: "delivery",
      items_json: [
        {
          id: 102,
          name: "Hunger Buster Deal",
          price: 2699.00,
          quantity: 1,
          selectedSize: "Standard Deal",
          selectedOptions: ["Flavor: Malai Boti", "Drink: 1L Next Cola"]
        }
      ],
      subtotal: 2699.00,
      delivery_fee: 100.00,
      discount: 200.00,
      total_amount: 2599.00,
      payment_method: "cash_on_delivery",
      status: "delivered",
      notes: "Please add extra garlic sauce sachets",
      created_at: "2026-10-07 19:15:00"
    },
    {
      id: "NN-8092",
      user_id: 2,
      customer_name: "Sale Meezu",
      customer_email: "sale@meezu.pk",
      customer_phone: "+92 300 1234567",
      delivery_address: "House 14, Block C, Sahiwal Colony, Sahiwal",
      city: "Sahiwal",
      order_type: "delivery",
      items_json: [
        {
          id: 101,
          name: "NOM NOM Combo",
          price: 1449.00,
          quantity: 1,
          selectedSize: "Standard Deal",
          selectedOptions: ["Drink: Next Cola"]
        }
      ],
      subtotal: 1449.00,
      delivery_fee: 100.00,
      discount: 0.00,
      total_amount: 1549.00,
      payment_method: "cash_on_delivery",
      status: "on_way",
      notes: "Rider call before arriving",
      created_at: "2026-10-08 05:40:00"
    },
    {
      id: "NN-8093",
      user_id: null,
      customer_name: "Hamza Tariq",
      customer_email: "hamza@gmail.com",
      customer_phone: "+92 321 9876543",
      delivery_address: "Shop 12, Main Bazar, Fateh Sher Road, Sahiwal",
      city: "Sahiwal",
      order_type: "takeaway",
      items_json: [
        {
          id: 306,
          name: "Deal 6",
          price: 3150.00,
          quantity: 1,
          selectedSize: "2 Large Pizzas",
          selectedOptions: ["Flavors: Chicken Fajita & Malai Boti"]
        }
      ],
      subtotal: 3150.00,
      delivery_fee: 0.00,
      discount: 150.00,
      total_amount: 3000.00,
      payment_method: "easypaisa",
      status: "preparing",
      notes: "Self pickup in 25 mins",
      created_at: "2026-10-08 06:05:00"
    },
    {
      id: "NN-8094",
      user_id: null,
      customer_name: "Zainab Bibi",
      customer_email: "zainab@yahoo.com",
      customer_phone: "+92 333 4455667",
      delivery_address: "College Road near Girls Degree College, Sahiwal",
      city: "Sahiwal",
      order_type: "delivery",
      items_json: [
        {
          id: 501,
          name: "Crown Crust Pizza",
          price: 1450.00,
          quantity: 1,
          selectedSize: "Medium 10\"",
          selectedOptions: ["Crust: Crown Crust", "Spice: Medium"]
        },
        {
          id: 402,
          name: "Flaming Wings",
          price: 390.00,
          quantity: 1,
          selectedSize: "4 Pieces",
          selectedOptions: []
        }
      ],
      subtotal: 1840.00,
      delivery_fee: 100.00,
      discount: 0.00,
      total_amount: 1940.00,
      payment_method: "cash_on_delivery",
      status: "pending",
      notes: "Please deliver warm",
      created_at: "2026-10-08 06:14:00"
    }
  ]
};

// In-memory + persistent JSON database with full MySQL relational querying & execution
class MySqlEngine {
  constructor() {
    this.db = this.loadDatabase();
  }

  loadDatabase() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read db file, loading default seed:", err.message);
    }
    this.saveDatabase(INITIAL_DB);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  saveDatabase(data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to write to MySQL db file:", err);
    }
  }

  // Schema DDL representation
  getSchema() {
    return [
      {
        table: "users",
        ddl: `CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
  google_id VARCHAR(255) DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        columns: ["id", "name", "email", "role", "google_id", "avatar_url", "phone", "address", "created_at"],
        rowCount: this.db.users.length
      },
      {
        table: "categories",
        ddl: `CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  banner_title VARCHAR(255) DEFAULT NULL,
  banner_subtitle VARCHAR(255) DEFAULT NULL,
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        columns: ["id", "slug", "name", "banner_title", "banner_subtitle", "sort_order"],
        rowCount: this.db.categories.length
      },
      {
        table: "menu_items",
        ddl: `CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) DEFAULT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_deal BOOLEAN DEFAULT FALSE,
  sizes_json JSON DEFAULT NULL,
  options_json JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        columns: ["id", "category_slug", "name", "price", "original_price", "is_available", "is_deal"],
        rowCount: this.db.menu_items.length
      },
      {
        table: "orders",
        ddl: `CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50) NOT NULL,
  delivery_address TEXT NOT NULL,
  city VARCHAR(100) DEFAULT 'Sahiwal',
  order_type ENUM('delivery', 'takeaway') DEFAULT 'delivery',
  items_json JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash_on_delivery', 'card', 'easypaisa', 'jazzcash') DEFAULT 'cash_on_delivery',
  status ENUM('pending', 'preparing', 'on_way', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        columns: ["id", "customer_name", "customer_phone", "total_amount", "payment_method", "status", "created_at"],
        rowCount: this.db.orders.length
      }
    ];
  }

  // Interactive SQL parser & query executor for dashboard console
  executeSql(query) {
    const startTime = Date.now();
    const cleanQuery = query.trim().replace(/;$/, '');
    const upper = cleanQuery.toUpperCase();

    try {
      if (upper.startsWith("SHOW TABLES")) {
        const rows = Object.keys(this.db).map(k => ({ Tables_in_nomnosh_pizza: k }));
        return {
          success: true,
          columns: ["Tables_in_nomnosh_pizza"],
          rows,
          rowCount: rows.length,
          executionTimeMs: Date.now() - startTime,
          query: cleanQuery
        };
      }

      if (upper.startsWith("DESCRIBE ") || upper.startsWith("DESC ")) {
        const parts = cleanQuery.split(/\s+/);
        const tbl = parts[1]?.toLowerCase();
        if (!this.db[tbl]) {
          throw new Error(`Table 'nomnosh_pizza.${tbl}' doesn't exist`);
        }
        const sample = this.db[tbl][0] || {};
        const rows = Object.keys(sample).map(col => ({
          Field: col,
          Type: typeof sample[col] === 'number' ? 'int / decimal' : (typeof sample[col] === 'boolean' ? 'tinyint(1)' : 'varchar(255)'),
          Null: 'YES',
          Key: col === 'id' ? 'PRI' : '',
          Default: null,
          Extra: col === 'id' && typeof sample[col] === 'number' ? 'auto_increment' : ''
        }));
        return {
          success: true,
          columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
          rows,
          rowCount: rows.length,
          executionTimeMs: Date.now() - startTime,
          query: cleanQuery
        };
      }

      if (upper.startsWith("SELECT")) {
        // Simple parser for SELECT * FROM <table> [WHERE ...]
        const match = cleanQuery.match(/FROM\s+([a-zA-Z_]+)(?:\s+WHERE\s+(.+))?(?:\s+LIMIT\s+(\d+))?/i);
        if (!match) {
          throw new Error("Syntax error in SQL SELECT statement");
        }
        const tableName = match[1].toLowerCase();
        const whereClause = match[2];
        const limit = match[3] ? parseInt(match[3], 10) : 100;

        if (!this.db[tableName]) {
          throw new Error(`Table 'nomnosh_pizza.${tableName}' doesn't exist`);
        }

        let results = [...this.db[tableName]];

        if (whereClause) {
          const eqMatch = whereClause.match(/([a-zA-Z_]+)\s*=\s*['"]?([^'"]+)['"]?/i);
          if (eqMatch) {
            const field = eqMatch[1];
            const val = eqMatch[2];
            results = results.filter(row => String(row[field]).toLowerCase() === val.toLowerCase());
          }
        }

        results = results.slice(0, limit);
        const columns = results.length > 0 ? Object.keys(results[0]) : [];

        return {
          success: true,
          columns,
          rows: results,
          rowCount: results.length,
          executionTimeMs: Date.now() - startTime,
          query: cleanQuery
        };
      }

      if (upper.startsWith("UPDATE")) {
        const match = cleanQuery.match(/UPDATE\s+([a-zA-Z_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
        if (!match) throw new Error("Invalid UPDATE statement");
        const table = match[1].toLowerCase();
        const setPart = match[2];
        const wherePart = match[3];

        if (!this.db[table]) throw new Error(`Table '${table}' not found`);

        let affected = 0;
        const setPairs = setPart.split(',').map(p => p.trim());
        const updates = {};
        for (const pair of setPairs) {
          const [k, v] = pair.split('=').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
          updates[k] = v;
        }

        this.db[table] = this.db[table].map(row => {
          let matchRow = true;
          if (wherePart) {
            const eq = wherePart.match(/([a-zA-Z_]+)\s*=\s*['"]?([^'"]+)['"]?/i);
            if (eq) {
              matchRow = String(row[eq[1]]).toLowerCase() === eq[2].toLowerCase();
            }
          }
          if (matchRow) {
            affected++;
            return { ...row, ...updates };
          }
          return row;
        });

        this.saveDatabase();
        return {
          success: true,
          affectedRows: affected,
          executionTimeMs: Date.now() - startTime,
          query: cleanQuery
        };
      }

      return {
        success: true,
        message: "SQL statement accepted and processed.",
        executionTimeMs: Date.now() - startTime,
        query: cleanQuery
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        executionTimeMs: Date.now() - startTime,
        query: cleanQuery
      };
    }
  }

  // Domain CRUD operations
  getUsers() { return this.db.users; }
  getUserByEmail(email) {
    return this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  getUserById(id) {
    return this.db.users.find(u => u.id === Number(id));
  }
  createUser(userData) {
    const newUser = {
      id: (this.db.users[this.db.users.length - 1]?.id || 0) + 1,
      name: userData.name,
      email: userData.email,
      password_hash: userData.password_hash || null,
      role: userData.role || "customer",
      google_id: userData.google_id || null,
      avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      phone: userData.phone || null,
      address: userData.address || null,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  getCategories() {
    return [...this.db.categories].sort((a, b) => a.sort_order - b.sort_order);
  }

  getMenuItems(categorySlug = null, search = '') {
    let items = [...this.db.menu_items];
    if (categorySlug && categorySlug !== 'all') {
      items = items.filter(i => i.category_slug === categorySlug);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return items;
  }

  addMenuItem(itemData) {
    const newItem = {
      id: Date.now(),
      category_slug: itemData.category_slug,
      name: itemData.name,
      description: itemData.description || "",
      price: Number(itemData.price),
      original_price: itemData.original_price ? Number(itemData.original_price) : null,
      image_url: itemData.image_url || "/src/assets/images/hero_midnight_pizza_1791465648676.jpg",
      is_available: itemData.is_available !== undefined ? Boolean(itemData.is_available) : true,
      is_deal: itemData.is_deal !== undefined ? Boolean(itemData.is_deal) : false,
      sizes_json: itemData.sizes_json || [],
      options_json: itemData.options_json || [],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.menu_items.push(newItem);
    this.saveDatabase();
    return newItem;
  }

  updateMenuItem(id, updates) {
    const idx = this.db.menu_items.findIndex(i => i.id === Number(id));
    if (idx === -1) return null;
    this.db.menu_items[idx] = { ...this.db.menu_items[idx], ...updates };
    this.saveDatabase();
    return this.db.menu_items[idx];
  }

  deleteMenuItem(id) {
    const idx = this.db.menu_items.findIndex(i => i.id === Number(id));
    if (idx === -1) return false;
    this.db.menu_items.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  getOrders() {
    return [...this.db.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getOrderById(id) {
    return this.db.orders.find(o => o.id === id);
  }

  createOrder(orderData) {
    const newId = `NN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newId,
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email || "",
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      city: orderData.city || "Sahiwal",
      order_type: orderData.order_type || "delivery",
      items_json: orderData.items || [],
      subtotal: Number(orderData.subtotal || 0),
      delivery_fee: Number(orderData.delivery_fee || 0),
      discount: Number(orderData.discount || 0),
      total_amount: Number(orderData.total_amount || 0),
      payment_method: orderData.payment_method || "cash_on_delivery",
      status: "pending",
      notes: orderData.notes || "",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.orders.unshift(newOrder);
    this.saveDatabase();
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const order = this.db.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    this.saveDatabase();
    return order;
  }

  resetToDefault() {
    this.db = JSON.parse(JSON.stringify(INITIAL_DB));
    this.saveDatabase();
    return true;
  }
}

export const db = new MySqlEngine();
