import {
  AchievementDef,
  ChapterObjectiveDef,
  CityNode,
  ItemTag,
  LegendaryDef,
  LockedRecipe,
} from "../types/game";

export const STARTING_COINS = 150;
export const STARTING_CITY_ID = "london";
export const ODD_JOB_REWARD = 25;
export const EXPEDITION_TOTAL_HOPS = 20;

export const EXPEDITION_MEDAL_THRESHOLDS = {
  gold: 2200,
  silver: 1400,
  bronze: 750,
} as const;

export const SATCHEL_UPGRADE_TIERS: Array<{ capacity: number; cost: number; label: string }> = [
  { capacity: 8, cost: 0, label: "Standard Courier Satchel" },
  { capacity: 12, cost: 240, label: "Expanded Leather Pack" },
  { capacity: 16, cost: 620, label: "Merchant Caravan Trunk" },
  { capacity: 20, cost: 1400, label: "Grand Expedition Hold" },
];

export const EXPLORER_RANKS: Array<{ minEarned: number; title: string }> = [
  { minEarned: 0, title: "Stowaway" },
  { minEarned: 250, title: "Street Peddler" },
  { minEarned: 750, title: "Route Runner" },
  { minEarned: 1800, title: "Caravan Merchant" },
  { minEarned: 4000, title: "Master Alchemist" },
  { minEarned: 8500, title: "World Magnate" },
];

export const TAG_LABELS: Record<ItemTag, string> = {
  beverage: "Beverage",
  culinary: "Culinary",
  textile: "Textile",
  fashion: "Fashion",
  weather: "Weather",
  heritage: "Heritage",
  transport: "Transport",
  tech: "Tech",
  craft: "Craft",
  luxury: "Luxury",
  music: "Music",
  botanical: "Botanical",
  romance: "Romance",
  spice: "Spice",
  architecture: "Architecture",
};

export const WORLD_CITIES: CityNode[] = [
  {
    id: "london",
    name: "London",
    region: "England, UK",
    mapCoords: { x: 472, y: 150 },
    producerTags: ["weather", "beverage", "transport", "heritage"],
    highDemandTags: ["spice", "culinary", "romance", "botanical"],
    demandBlurb: "Craves exotic spices, fine pastries, and bright botanicals against the drizzle.",
    adjacentRoutes: [
      { targetCityId: "manchester", distanceKm: 330, fareCoins: 18 },
      { targetCityId: "edinburgh", distanceKm: 660, fareCoins: 30 },
      { targetCityId: "paris", distanceKm: 450, fareCoins: 24 },
      { targetCityId: "reykjavik", distanceKm: 1890, fareCoins: 65 },
      { targetCityId: "new_york", distanceKm: 5570, fareCoins: 118 },
    ],
    catalog: [
      { id: "lon_gin", name: "Gin", emoji: "🍸", description: "Juniper-forward dry spirit distilled near the Thames.", baseValue: 26, tags: ["beverage", "botanical"] },
      { id: "lon_fog", name: "Fog", emoji: "🌫️", description: "Cool river mist bottled along the Embankment at dawn.", baseValue: 16, tags: ["weather"] },
      { id: "lon_bus", name: "Red Bus", emoji: "🚌", description: "Double-decker transit icon climbing Oxford Street.", baseValue: 28, tags: ["transport", "heritage"] },
      { id: "lon_umbrella", name: "Umbrella", emoji: "☂️", description: "Rolled black canopy built for sudden squalls.", baseValue: 22, tags: ["fashion", "weather"] },
      { id: "lon_tea", name: "Tea", emoji: "🫖", description: "Loose-leaf afternoon blend packed in tin caddies.", baseValue: 20, tags: ["beverage", "heritage"] },
      { id: "lon_crown", name: "Crown", emoji: "👑", description: "Gilded ceremonial keepsake from the royal quarter.", baseValue: 36, tags: ["heritage", "luxury"] },
    ],
  },
  {
    id: "manchester",
    name: "Manchester",
    region: "England, UK",
    mapCoords: { x: 458, y: 132 },
    producerTags: ["textile", "music", "weather", "craft"],
    highDemandTags: ["beverage", "culinary", "luxury", "spice"],
    demandBlurb: "Busy mill workshops prize warm coffees, fine cuisine, and imported luxuries.",
    adjacentRoutes: [
      { targetCityId: "london", distanceKm: 330, fareCoins: 18 },
      { targetCityId: "edinburgh", distanceKm: 350, fareCoins: 20 },
    ],
    catalog: [
      { id: "man_cotton", name: "Cotton", emoji: "🧶", description: "Raw spun mill-grade bales ready for weavers.", baseValue: 20, tags: ["textile", "craft"] },
      { id: "man_raincoat", name: "Raincoat", emoji: "🧥", description: "Waxed waterproof outerwear tested in northern rain.", baseValue: 28, tags: ["fashion", "weather"] },
      { id: "man_vinyl", name: "Vinyl Record", emoji: "💿", description: "Heavyweight indie pressing from Northern Quarter crates.", baseValue: 24, tags: ["music", "craft"] },
      { id: "man_football", name: "Football", emoji: "⚽", description: "Stitched match leather prized across the city.", baseValue: 22, tags: ["heritage", "craft"] },
      { id: "man_brick", name: "Red Brick", emoji: "🧱", description: "Kiln-fired industrial masonry from Victorian warehouses.", baseValue: 18, tags: ["architecture", "craft"] },
      { id: "man_canal", name: "Canal Lock", emoji: "🚢", description: "Cast-iron waterway gear from Castlefield basin.", baseValue: 25, tags: ["transport", "architecture"] },
    ],
  },
  {
    id: "edinburgh",
    name: "Edinburgh",
    region: "Scotland, UK",
    mapCoords: { x: 460, y: 112 },
    producerTags: ["heritage", "beverage", "textile", "culinary"],
    highDemandTags: ["spice", "tech", "romance", "music"],
    demandBlurb: "Highland stone halls welcome exotic spices, modern tech, and bold music.",
    adjacentRoutes: [
      { targetCityId: "manchester", distanceKm: 350, fareCoins: 20 },
      { targetCityId: "london", distanceKm: 660, fareCoins: 30 },
      { targetCityId: "reykjavik", distanceKm: 1380, fareCoins: 52 },
    ],
    catalog: [
      { id: "edi_whisky", name: "Whisky", emoji: "🥃", description: "Peated single malt aged in oak casks.", baseValue: 34, tags: ["beverage", "heritage"] },
      { id: "edi_shortbread", name: "Shortbread", emoji: "🧈", description: "Rich all-butter biscuit baked in traditional moulds.", baseValue: 19, tags: ["culinary", "heritage"] },
      { id: "edi_tartan", name: "Tartan", emoji: "🧣", description: "Crisscrossed wool weave steeped in clan history.", baseValue: 26, tags: ["textile", "fashion"] },
      { id: "edi_kilt", name: "Kilt", emoji: "🏴", description: "Pleated ceremonial wool garment tailored in the Old Town.", baseValue: 32, tags: ["fashion", "heritage"] },
      { id: "edi_castle", name: "Castle", emoji: "🏰", description: "Volcanic-rock fortress stone overlooking the firth.", baseValue: 30, tags: ["architecture", "heritage"] },
      { id: "edi_heather", name: "Heather", emoji: "🪻", description: "Fragrant purple moorland sprig gathered on the hills.", baseValue: 18, tags: ["botanical", "weather"] },
    ],
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    region: "Iceland",
    mapCoords: { x: 404, y: 88 },
    producerTags: ["weather", "botanical", "textile", "craft"],
    highDemandTags: ["culinary", "beverage", "spice", "romance"],
    demandBlurb: "Subarctic outposts pay generously for warm culinary treats, spices, and spirits.",
    adjacentRoutes: [
      { targetCityId: "edinburgh", distanceKm: 1380, fareCoins: 52 },
      { targetCityId: "london", distanceKm: 1890, fareCoins: 65 },
      { targetCityId: "new_york", distanceKm: 4200, fareCoins: 98 },
    ],
    catalog: [
      { id: "rey_steam", name: "Geothermal Steam", emoji: "♨️", description: "Mineral-rich vapor rising from volcanic vents.", baseValue: 22, tags: ["weather", "botanical"] },
      { id: "rey_sweater", name: "Wool Sweater", emoji: "🧶", description: "Hand-knitted lopapeysa built for North Atlantic gales.", baseValue: 32, tags: ["textile", "fashion"] },
      { id: "rey_salt", name: "Sea Salt", emoji: "🧂", description: "Flaky geothermal-dried crystals from cold fjords.", baseValue: 18, tags: ["culinary", "spice"] },
      { id: "rey_basalt", name: "Basalt", emoji: "🪨", description: "Hexagonal dark volcanic stone carved by the sea.", baseValue: 20, tags: ["architecture", "craft"] },
      { id: "rey_glacier", name: "Glacier Ice", emoji: "🧊", description: "Ancient compressed crystal from highland ice caps.", baseValue: 24, tags: ["weather", "luxury"] },
      { id: "rey_puffin", name: "Aurora Compass", emoji: "🧭", description: "Magnetic brass dial tuned to northern latitudes.", baseValue: 30, tags: ["transport", "craft"] },
    ],
  },
  {
    id: "paris",
    name: "Paris",
    region: "France",
    mapCoords: { x: 486, y: 172 },
    producerTags: ["culinary", "romance", "fashion", "luxury"],
    highDemandTags: ["textile", "tech", "spice", "music"],
    demandBlurb: "Ateliers and salons compete for raw textiles, fresh music, and rare spices.",
    adjacentRoutes: [
      { targetCityId: "london", distanceKm: 450, fareCoins: 24 },
      { targetCityId: "milan", distanceKm: 850, fareCoins: 36 },
      { targetCityId: "marrakech", distanceKm: 2100, fareCoins: 66 },
    ],
    catalog: [
      { id: "par_baguette", name: "Baguette", emoji: "🥖", description: "Crisp golden crust fresh from a morning boulangerie.", baseValue: 16, tags: ["culinary"] },
      { id: "par_metro", name: "Metro", emoji: "🚇", description: "Art Nouveau subterranean transit pass across arrondissements.", baseValue: 20, tags: ["transport", "architecture"] },
      { id: "par_love", name: "Love", emoji: "❤️", description: "Pure romantic spark lingering along Seine bridges.", baseValue: 30, tags: ["romance"] },
      { id: "par_perfume", name: "Perfume", emoji: "🧴", description: "Small glass flacon blended with iris and cedar.", baseValue: 34, tags: ["luxury", "botanical"] },
      { id: "par_beret", name: "Beret", emoji: "🎨", description: "Soft felted wool cap worn in Montmartre studios.", baseValue: 22, tags: ["fashion", "heritage"] },
      { id: "par_croissant", name: "Croissant", emoji: "🥐", description: "Flaky laminated pastry folded with cultured butter.", baseValue: 18, tags: ["culinary", "luxury"] },
    ],
  },
  {
    id: "milan",
    name: "Milan",
    region: "Italy",
    mapCoords: { x: 514, y: 188 },
    producerTags: ["fashion", "beverage", "luxury", "transport"],
    highDemandTags: ["textile", "weather", "botanical", "tech"],
    demandBlurb: "Design houses snap up raw cotton, silk, botanicals, and futuristic tech.",
    adjacentRoutes: [
      { targetCityId: "paris", distanceKm: 850, fareCoins: 36 },
      { targetCityId: "istanbul", distanceKm: 1670, fareCoins: 56 },
      { targetCityId: "cairo", distanceKm: 2600, fareCoins: 76 },
    ],
    catalog: [
      { id: "mil_espresso", name: "Espresso", emoji: "☕", description: "Velvety dark roast pulled under high steam pressure.", baseValue: 18, tags: ["beverage", "culinary"] },
      { id: "mil_leather", name: "Leather Bag", emoji: "👜", description: "Hand-stitched Italian calfskin satchel from Navigli.", baseValue: 38, tags: ["fashion", "luxury"] },
      { id: "mil_silk", name: "Silk", emoji: "🧣", description: "Lustrous Como-woven bolt shimmering in warm light.", baseValue: 34, tags: ["textile", "luxury"] },
      { id: "mil_vespa", name: "Scooter", emoji: "🛵", description: "Nimble pastel two-wheeler weaving down cobblestones.", baseValue: 30, tags: ["transport", "fashion"] },
      { id: "mil_opera", name: "Opera Ticket", emoji: "🎭", description: "Velvet-box seat for a La Scala evening premiere.", baseValue: 28, tags: ["music", "romance"] },
      { id: "mil_saffron", name: "Saffron", emoji: "🌼", description: "Crimson threads prized for golden risotto.", baseValue: 32, tags: ["spice", "culinary"] },
    ],
  },
  {
    id: "marrakech",
    name: "Marrakech",
    region: "Morocco",
    mapCoords: { x: 454, y: 244 },
    producerTags: ["spice", "craft", "botanical", "heritage"],
    highDemandTags: ["weather", "tech", "music", "transport"],
    demandBlurb: "Sun-drenched riads pay top coin for cooling weather, vinyl, and modern gear.",
    adjacentRoutes: [
      { targetCityId: "paris", distanceKm: 2100, fareCoins: 66 },
      { targetCityId: "cairo", distanceKm: 3600, fareCoins: 90 },
      { targetCityId: "oaxaca", distanceKm: 8200, fareCoins: 142 },
    ],
    catalog: [
      { id: "mar_tagine", name: "Tagine Pot", emoji: "🍲", description: "Conical earthenware vessel built for slow-simmered feasts.", baseValue: 26, tags: ["craft", "culinary"] },
      { id: "mar_mint", name: "Mint Tea", emoji: "🍵", description: "Sweet green gunpowder brew poured high with fresh spearmint.", baseValue: 18, tags: ["beverage", "botanical"] },
      { id: "mar_saffron", name: "Saffron", emoji: "🌼", description: "Fragrant crimson spice harvested from Atlas foothills.", baseValue: 32, tags: ["spice", "luxury"] },
      { id: "mar_cedar", name: "Cedarwood", emoji: "🪵", description: "Aromatic carved Atlas timber with warm resin notes.", baseValue: 24, tags: ["craft", "botanical"] },
      { id: "mar_lantern", name: "Brass Lantern", emoji: "🏮", description: "Pierced filigree metalwork casting starlit shadows.", baseValue: 28, tags: ["craft", "romance"] },
      { id: "mar_argan", name: "Argan Oil", emoji: "🫒", description: "Cold-pressed golden elixir from desert groves.", baseValue: 30, tags: ["botanical", "luxury"] },
    ],
  },
  {
    id: "cairo",
    name: "Cairo",
    region: "Egypt",
    mapCoords: { x: 572, y: 248 },
    producerTags: ["textile", "heritage", "spice", "architecture"],
    highDemandTags: ["weather", "fashion", "beverage", "tech"],
    demandBlurb: "Bustling Nile markets offer high margins on cool weather, fashion, and tech.",
    adjacentRoutes: [
      { targetCityId: "marrakech", distanceKm: 3600, fareCoins: 90 },
      { targetCityId: "milan", distanceKm: 2600, fareCoins: 76 },
      { targetCityId: "istanbul", distanceKm: 1230, fareCoins: 46 },
      { targetCityId: "mumbai", distanceKm: 4350, fareCoins: 98 },
    ],
    catalog: [
      { id: "cai_cotton", name: "Cotton", emoji: "🧶", description: "Long-staple Nile delta fiber renowned for softness.", baseValue: 22, tags: ["textile", "craft"] },
      { id: "cai_papyrus", name: "Papyrus", emoji: "📜", description: "Woven river-reed scroll pressed along the Nile.", baseValue: 24, tags: ["heritage", "craft"] },
      { id: "cai_hibiscus", name: "Hibiscus", emoji: "🌺", description: "Ruby-red dried petals steeped into tart karkadeh.", baseValue: 18, tags: ["botanical", "beverage"] },
      { id: "cai_alabaster", name: "Alabaster", emoji: "🏺", description: "Translucent carved stone vessel glowing by candlelight.", baseValue: 30, tags: ["architecture", "luxury"] },
      { id: "cai_spice", name: "Dukkah Spice", emoji: "🌶️", description: "Toasted sesame, coriander, and cumin bazaar blend.", baseValue: 20, tags: ["spice", "culinary"] },
      { id: "cai_felucca", name: "Felucca Sail", emoji: "⛵", description: "Triangular canvas rigged to catch evening Nile winds.", baseValue: 26, tags: ["transport", "textile"] },
    ],
  },
  {
    id: "istanbul",
    name: "Istanbul",
    region: "Turkey",
    mapCoords: { x: 568, y: 196 },
    producerTags: ["spice", "craft", "beverage", "architecture"],
    highDemandTags: ["fashion", "music", "tech", "romance"],
    demandBlurb: "Bosphorus traders prize modern tech, European fashion, and rare music.",
    adjacentRoutes: [
      { targetCityId: "milan", distanceKm: 1670, fareCoins: 56 },
      { targetCityId: "cairo", distanceKm: 1230, fareCoins: 46 },
      { targetCityId: "mumbai", distanceKm: 4820, fareCoins: 105 },
    ],
    catalog: [
      { id: "ist_coffee", name: "Turkish Coffee", emoji: "☕", description: "Finely ground roast simmered in a copper cezve.", baseValue: 22, tags: ["beverage", "heritage"] },
      { id: "ist_mosaic", name: "Mosaic Lamp", emoji: "🪔", description: "Stained-glass globe shimmering in Grand Bazaar stalls.", baseValue: 30, tags: ["craft", "luxury"] },
      { id: "ist_rug", name: "Woven Rug", emoji: "🧶", description: "Knotted Anatolian wool pattern rich in geometry.", baseValue: 36, tags: ["textile", "heritage"] },
      { id: "ist_pomegranate", name: "Pomegranate", emoji: "🍎", description: "Jewel-seeded orchard fruit pressed for tart glaze.", baseValue: 17, tags: ["culinary", "botanical"] },
      { id: "ist_ferry", name: "Ferry Token", emoji: "⛴️", description: "Cross-strait commuter coin linking Europe and Asia.", baseValue: 18, tags: ["transport"] },
      { id: "ist_copper", name: "Copper Pot", emoji: "🍯", description: "Hammered Anatolian cookware tinned by master smiths.", baseValue: 28, tags: ["craft", "culinary"] },
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "India",
    mapCoords: { x: 696, y: 278 },
    producerTags: ["textile", "spice", "music", "beverage"],
    highDemandTags: ["weather", "tech", "luxury", "architecture"],
    demandBlurb: "Coastal studios and docks seek luxury goods, precision tech, and cool weather.",
    adjacentRoutes: [
      { targetCityId: "cairo", distanceKm: 4350, fareCoins: 98 },
      { targetCityId: "istanbul", distanceKm: 4820, fareCoins: 105 },
      { targetCityId: "singapore", distanceKm: 3910, fareCoins: 92 },
    ],
    catalog: [
      { id: "mum_cotton", name: "Cotton", emoji: "🧶", description: "Crisp Deccan-grown cotton bolts bound for tailors.", baseValue: 19, tags: ["textile", "craft"] },
      { id: "mum_chai", name: "Chai", emoji: "🍵", description: "Cardamom-and-ginger spiced Assam tea boiled with milk.", baseValue: 18, tags: ["beverage", "spice"] },
      { id: "mum_silk", name: "Silk", emoji: "🧣", description: "Vibrant hand-dyed sari silk with gold zari thread.", baseValue: 34, tags: ["textile", "fashion"] },
      { id: "mum_reel", name: "Film Reel", emoji: "🎞️", description: "35mm musical cinema print straight from Film City.", baseValue: 28, tags: ["music", "romance"] },
      { id: "mum_tiffin", name: "Steel Tiffin", emoji: "🍱", description: "Stacked lunch carrier delivered across city rail lines.", baseValue: 22, tags: ["craft", "transport"] },
      { id: "mum_mango", name: "Alphonso Mango", emoji: "🥭", description: "Golden coastal orchard fruit bursting with nectar.", baseValue: 24, tags: ["culinary", "botanical"] },
    ],
  },
  {
    id: "singapore",
    name: "Singapore",
    region: "Singapore",
    mapCoords: { x: 774, y: 332 },
    producerTags: ["botanical", "transport", "culinary", "tech"],
    highDemandTags: ["heritage", "fashion", "romance", "weather"],
    demandBlurb: "Garden-city skyscrapers reward heritage crafts, vintage fashion, and cool mist.",
    adjacentRoutes: [
      { targetCityId: "mumbai", distanceKm: 3910, fareCoins: 92 },
      { targetCityId: "kyoto", distanceKm: 4950, fareCoins: 106 },
      { targetCityId: "tokyo", distanceKm: 5310, fareCoins: 112 },
    ],
    catalog: [
      { id: "sin_orchid", name: "Orchid", emoji: "🌸", description: "Rare tropical bloom nurtured in glass conservatories.", baseValue: 28, tags: ["botanical", "luxury"] },
      { id: "sin_crab", name: "Chili Crab", emoji: "🦀", description: "Sweet-spicy hawker feast glazed in thick tomato sauce.", baseValue: 26, tags: ["culinary", "spice"] },
      { id: "sin_rain", name: "Monsoon Rain", emoji: "🌧️", description: "Sudden warm equatorial downpour over Marina Bay.", baseValue: 16, tags: ["weather"] },
      { id: "sin_cargo", name: "Cargo Crate", emoji: "📦", description: "Sealed maritime container routed through the strait.", baseValue: 24, tags: ["transport", "tech"] },
      { id: "sin_kopi", name: "Kopi", emoji: "☕", description: "Caramelized dark roast pulled briskly in sock filters.", baseValue: 18, tags: ["beverage", "culinary"] },
      { id: "sin_gin", name: "Botanical Gin", emoji: "🍸", description: "Small-batch spirit infused with kaffir lime and orchid.", baseValue: 32, tags: ["beverage", "botanical"] },
    ],
  },
  {
    id: "kyoto",
    name: "Kyoto",
    region: "Japan",
    mapCoords: { x: 848, y: 204 },
    producerTags: ["heritage", "botanical", "craft", "beverage"],
    highDemandTags: ["fashion", "spice", "romance", "music"],
    demandBlurb: "Quiet wooden machiya prize bold spices, tailored fashion, and vinyl pressings.",
    adjacentRoutes: [
      { targetCityId: "singapore", distanceKm: 4950, fareCoins: 106 },
      { targetCityId: "tokyo", distanceKm: 450, fareCoins: 24 },
    ],
    catalog: [
      { id: "kyo_matcha", name: "Matcha", emoji: "🍵", description: "Shade-grown Uji tea whisked into emerald foam.", baseValue: 28, tags: ["beverage", "botanical"] },
      { id: "kyo_silk", name: "Kimono Silk", emoji: "👘", description: "Yuzen-dyed silk panel painted with crane motifs.", baseValue: 38, tags: ["textile", "heritage"] },
      { id: "kyo_bowl", name: "Ceramic Bowl", emoji: "🥣", description: "Hand-thrown Raku stoneware glazed for tea ceremonies.", baseValue: 26, tags: ["craft", "heritage"] },
      { id: "kyo_bamboo", name: "Bamboo", emoji: "🎋", description: "Tall emerald culm cut from misty Arashiyama groves.", baseValue: 18, tags: ["botanical", "architecture"] },
      { id: "kyo_incense", name: "Incense", emoji: "🕯️", description: "Sandalwood temple stick drifting with calm cedar smoke.", baseValue: 24, tags: ["botanical", "romance"] },
      { id: "kyo_lantern", name: "Paper Lantern", emoji: "🏮", description: "Oiled washi glow hanging outside Gion teahouses.", baseValue: 22, tags: ["craft", "heritage"] },
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    region: "Japan",
    mapCoords: { x: 874, y: 196 },
    producerTags: ["tech", "culinary", "transport", "music"],
    highDemandTags: ["heritage", "romance", "textile", "luxury"],
    demandBlurb: "Neon avenues pay handsomely for old-world heritage, artisanal textiles, and romance.",
    adjacentRoutes: [
      { targetCityId: "kyoto", distanceKm: 450, fareCoins: 24 },
      { targetCityId: "singapore", distanceKm: 5310, fareCoins: 112 },
      { targetCityId: "san_francisco", distanceKm: 8280, fareCoins: 145 },
    ],
    catalog: [
      { id: "tok_neon", name: "Neon", emoji: "⚡", description: "Electric argon glow humming above Shinjuku alleys.", baseValue: 26, tags: ["tech", "architecture"] },
      { id: "tok_ramen", name: "Ramen", emoji: "🍜", description: "Rich slow-simmered broth topped with springy noodles.", baseValue: 20, tags: ["culinary"] },
      { id: "tok_shinkansen", name: "Bullet Train", emoji: "🚄", description: "Aerodynamic high-speed rail pass piercing Mount Fuji mist.", baseValue: 34, tags: ["transport", "tech"] },
      { id: "tok_vinyl", name: "Vinyl Record", emoji: "💿", description: "Rare Shibuya city-pop LP in mint obi sleeve.", baseValue: 30, tags: ["music", "luxury"] },
      { id: "tok_capsule", name: "Capsule Toy", emoji: "🔮", description: "Miniature collectible sealed inside a plastic orb.", baseValue: 16, tags: ["craft", "tech"] },
      { id: "tok_watch", name: "Quartz Watch", emoji: "⌚", description: "Precision micro-timed timepiece built in Ginza.", baseValue: 36, tags: ["tech", "luxury"] },
    ],
  },
  {
    id: "san_francisco",
    name: "San Francisco",
    region: "California, USA",
    mapCoords: { x: 152, y: 194 },
    producerTags: ["weather", "tech", "culinary", "transport"],
    highDemandTags: ["heritage", "spice", "textile", "luxury"],
    demandBlurb: "Bay piers and tech studios bid high for old-world heritage, spices, and fine textiles.",
    adjacentRoutes: [
      { targetCityId: "tokyo", distanceKm: 8280, fareCoins: 145 },
      { targetCityId: "new_york", distanceKm: 4130, fareCoins: 94 },
      { targetCityId: "oaxaca", distanceKm: 3460, fareCoins: 84 },
    ],
    catalog: [
      { id: "sf_fog", name: "Fog", emoji: "🌫️", description: "Pacific Karl-the-Fog drifting beneath Golden Gate cables.", baseValue: 16, tags: ["weather"] },
      { id: "sf_sourdough", name: "Sourdough", emoji: "🍞", description: "Tangy blistered loaf fermented with bay-air wild yeast.", baseValue: 19, tags: ["culinary"] },
      { id: "sf_cable", name: "Cable Car", emoji: "🚋", description: "Clanging wooden tram climbing Nob Hill gradients.", baseValue: 28, tags: ["transport", "heritage"] },
      { id: "sf_denim", name: "Denim", emoji: "👖", description: "Riveted indigo workwear twill born for gold-rush grit.", baseValue: 26, tags: ["fashion", "textile"] },
      { id: "sf_espresso", name: "Espresso", emoji: "☕", description: "Single-origin light roast pulled in Mission cafes.", baseValue: 20, tags: ["beverage", "culinary"] },
      { id: "sf_redwood", name: "Redwood Cone", emoji: "🌲", description: "Ancient coastal sequoia seed from Muir Woods.", baseValue: 22, tags: ["botanical", "heritage"] },
    ],
  },
  {
    id: "new_york",
    name: "New York",
    region: "New York, USA",
    mapCoords: { x: 274, y: 186 },
    producerTags: ["architecture", "transport", "music", "culinary"],
    highDemandTags: ["botanical", "spice", "heritage", "weather"],
    demandBlurb: "Fast-paced boroughs crave botanicals, heirloom crafts, and exotic spices.",
    adjacentRoutes: [
      { targetCityId: "san_francisco", distanceKm: 4130, fareCoins: 94 },
      { targetCityId: "oaxaca", distanceKm: 3680, fareCoins: 88 },
      { targetCityId: "reykjavik", distanceKm: 4200, fareCoins: 98 },
      { targetCityId: "london", distanceKm: 5570, fareCoins: 118 },
    ],
    catalog: [
      { id: "ny_bagel", name: "Bagel", emoji: "🥯", description: "Kettle-boiled sesame ring warm from a corner deli.", baseValue: 16, tags: ["culinary"] },
      { id: "ny_cab", name: "Yellow Cab", emoji: "🚕", description: "Iconic medallion cruiser weaving down Fifth Avenue.", baseValue: 26, tags: ["transport"] },
      { id: "ny_skyscraper", name: "Skyscraper", emoji: "🏙️", description: "Art Deco limestone spire piercing Midtown clouds.", baseValue: 34, tags: ["architecture", "tech"] },
      { id: "ny_jazz", name: "Jazz Record", emoji: "🎷", description: "Smoky Greenwich Village saxophone session on wax.", baseValue: 28, tags: ["music", "romance"] },
      { id: "ny_pretzel", name: "Pretzel", emoji: "🥨", description: "Coarse-salted street cart twist hot off the grill.", baseValue: 14, tags: ["culinary"] },
      { id: "ny_card", name: "Metro Card", emoji: "🎫", description: "Yellow magnetic stripe unlocking 24-hour subway rides.", baseValue: 20, tags: ["transport", "tech"] },
    ],
  },
  {
    id: "oaxaca",
    name: "Oaxaca",
    region: "Mexico",
    mapCoords: { x: 214, y: 272 },
    producerTags: ["spice", "culinary", "craft", "botanical"],
    highDemandTags: ["weather", "tech", "luxury", "transport"],
    demandBlurb: "Highland mercados bid generously for modern tech, maritime cargo, and cool mist.",
    adjacentRoutes: [
      { targetCityId: "san_francisco", distanceKm: 3460, fareCoins: 84 },
      { targetCityId: "new_york", distanceKm: 3680, fareCoins: 88 },
      { targetCityId: "marrakech", distanceKm: 8200, fareCoins: 142 },
    ],
    catalog: [
      { id: "oax_cacao", name: "Cacao", emoji: "🍫", description: "Stone-ground heirloom beans spiced with cinnamon.", baseValue: 24, tags: ["culinary", "spice"] },
      { id: "oax_mezcal", name: "Mezcal", emoji: "🥃", description: "Smoky agave spirit roasted in earthen pit ovens.", baseValue: 32, tags: ["beverage", "craft"] },
      { id: "oax_chili", name: "Chili Pepper", emoji: "🌶️", description: "Sun-dried pasilla pods brimming with smoky heat.", baseValue: 18, tags: ["spice", "culinary"] },
      { id: "oax_marigold", name: "Marigold", emoji: "🌼", description: "Bright golden cempasuchil petals gathered in baskets.", baseValue: 19, tags: ["botanical", "romance"] },
      { id: "oax_rug", name: "Woven Rug", emoji: "🧶", description: "Cochineal-dyed Zapotec loom textile.", baseValue: 34, tags: ["textile", "heritage"] },
      { id: "oax_clay", name: "Clay Pot", emoji: "🏺", description: "Burnished barro negro earthenware fired in wood smoke.", baseValue: 26, tags: ["craft", "heritage"] },
    ],
  },
];

export const CITY_BY_ID: Record<string, CityNode> = Object.fromEntries(
  WORLD_CITIES.map((city) => [city.id, city])
);

export function makeRecipeKey(names: string[]): string {
  return names
    .map((n) => n.trim().toLowerCase())
    .sort()
    .join("+");
}

export const LEGENDARY_DISCOVERIES: LegendaryDef[] = [
  {
    id: "legend_northern_lights",
    name: "Northern Lights",
    emoji: "🌌",
    riddle: "Three northern tokens: oak-aged spirit, ancient ice, and a polar dial.",
    description: "Emerald ribbons dancing above glacial fjords under a compass star.",
    lateralSpark: "Whisky warmth, Glacier Ice, and Aurora Compass align with the polar sky.",
    canonicalIngredients: ["Whisky", "Glacier Ice", "Aurora Compass"],
    tags: ["weather", "luxury", "heritage"],
    baseValue: 180,
    bonusCoins: 140,
  },
  {
    id: "legend_silk_road",
    name: "Silk Road",
    emoji: "🐪",
    riddle: "Three caravan treasures: woven luster, crimson spice, and river-reed scrolls.",
    description: "A storied transcontinental trade artery linking bazaar and loom.",
    lateralSpark: "Silk, Saffron, and Papyrus chart the oldest overland trade route.",
    canonicalIngredients: ["Silk", "Saffron", "Papyrus"],
    tags: ["textile", "spice", "heritage"],
    baseValue: 185,
    bonusCoins: 150,
  },
  {
    id: "legend_midnight_express",
    name: "Midnight Express",
    emoji: "🚂",
    riddle: "Three nocturnal notes: high-speed steel, drifting mist, and brass jazz.",
    description: "A sleeper locomotive gliding smoothly through moonlit city fog.",
    lateralSpark: "Bullet Train speed, Fog, and Jazz Record create a midnight rail classic.",
    canonicalIngredients: ["Bullet Train", "Fog", "Jazz Record"],
    tags: ["transport", "music", "romance"],
    baseValue: 175,
    bonusCoins: 140,
  },
  {
    id: "legend_grand_tour",
    name: "Grand Tour",
    emoji: "🧳",
    riddle: "Three iconic city rides from London, Paris, and San Francisco.",
    description: "A classic multi-continent ticket stamped across three great cities.",
    lateralSpark: "Red Bus, Metro, and Cable Car unite three legendary urban commutes.",
    canonicalIngredients: ["Red Bus", "Metro", "Cable Car"],
    tags: ["transport", "heritage", "architecture"],
    baseValue: 165,
    bonusCoins: 130,
  },
  {
    id: "legend_spice_armada",
    name: "Spice Armada",
    emoji: "⛵",
    riddle: "Three maritime essentials: river canvas, fiery pods, and ocean crystals.",
    description: "Wind-taut sails carrying rare peppers across open salt water.",
    lateralSpark: "Felucca Sail, Chili Pepper, and Sea Salt launch a culinary fleet.",
    canonicalIngredients: ["Felucca Sail", "Chili Pepper", "Sea Salt"],
    tags: ["transport", "spice", "culinary"],
    baseValue: 145,
    bonusCoins: 120,
  },
  {
    id: "legend_cloud_observatory",
    name: "Cloud Observatory",
    emoji: "🔭",
    riddle: "Three clear-sky instruments: towering glass, bay mist, and precision time.",
    description: "Brass lenses peering above the fog layer in exact sidereal time.",
    lateralSpark: "Skyscraper height, Fog, and Quartz Watch build an atmospheric lookout.",
    canonicalIngredients: ["Skyscraper", "Fog", "Quartz Watch"],
    tags: ["architecture", "tech", "weather"],
    baseValue: 185,
    bonusCoins: 150,
  },
  {
    id: "legend_royal_symphony",
    name: "Royal Symphony",
    emoji: "🎼",
    riddle: "Three gala pieces: gilded regalia, a velvet theater seat, and studio wax.",
    description: "An unforgettable command performance recorded for posterity.",
    lateralSpark: "Crown, Opera Ticket, and Vinyl Record compose a stately concert.",
    canonicalIngredients: ["Crown", "Opera Ticket", "Vinyl Record"],
    tags: ["music", "luxury", "heritage"],
    baseValue: 195,
    bonusCoins: 160,
  },
  {
    id: "legend_wanderlust_elixir",
    name: "Elixir of Wanderlust",
    emoji: "⚗️",
    riddle: "Three spirit-world infusions from London, Kyoto, and Oaxaca.",
    description: "Juniper, ceremonial tea, and smoky agave blended for restless travelers.",
    lateralSpark: "Gin, Matcha, and Mezcal bridge three continents in one glass.",
    canonicalIngredients: ["Gin", "Matcha", "Mezcal"],
    tags: ["beverage", "botanical", "craft"],
    baseValue: 185,
    bonusCoins: 150,
  },
];

function buildSeededRecipe(
  ingredients: string[],
  resultName: string,
  resultEmoji: string,
  resultDescription: string,
  lateralSpark: string,
  tags: ItemTag[],
  baseValue: number,
  legendaryId?: string
): LockedRecipe {
  return {
    sortedKey: makeRecipeKey(ingredients),
    ingredients: [...ingredients],
    resultName,
    resultEmoji,
    resultDescription,
    lateralSpark,
    tags,
    tier: ingredients.length >= 3 ? 2 : 1,
    baseValue,
    discoveredAt: 0,
    craftCount: 0,
    isSeeded: true,
    legendaryId,
  };
}

export interface BountyBlueprint {
  itemName: string;
  itemEmoji: string;
  clueText: string;
  difficulty: 1 | 2;
  preferredCities?: string[];
}

const RAW_SEEDED_RECIPES: Array<LockedRecipe & { clueText?: string }> = [
  {
    ...buildSeededRecipe(
      ["Fog", "Tea"],
      "Earl Grey",
      "🫖",
      "Aromatic bergamot infusion steeped inside thick coastal mist.",
      "British tea steeping gently inside signature London fog.",
      ["beverage", "heritage", "botanical"],
      49
    ),
    clueText: "Craft 2 items · try London",
  },
  {
    ...buildSeededRecipe(
      ["Cotton", "Raincoat"],
      "Trench Coat",
      "🧥",
      "Weatherproof woven gabardine tailored for stormy avenues.",
      "Sturdy cotton spun into an iconic rain-shedding overcoat.",
      ["fashion", "textile", "weather"],
      65
    ),
    clueText: "Craft 2 items · look to Manchester",
  },
  {
    ...buildSeededRecipe(
      ["Baguette", "Love"],
      "Picnic",
      "🧺",
      "A sunny checkered blanket shared beside the river.",
      "Warm French bread shared in sweet romantic company.",
      ["culinary", "romance"],
      62
    ),
    clueText: "Craft 2 items · look to Paris",
  },
  {
    ...buildSeededRecipe(
      ["Fog", "Cable Car"],
      "Cliffhanger",
      "🎬",
      "A hillside tram vanishing dramatically into swirling white mist.",
      "Steep hills and blinding fog turn a commute into suspense.",
      ["transport", "romance"],
      60
    ),
    clueText: "Craft 2 items · try San Francisco",
  },
  {
    ...buildSeededRecipe(
      ["Neon", "Espresso"],
      "All-Nighter",
      "🌃",
      "Midnight neon humming beside a double shot of dark roast.",
      "Bright city lights paired with pure caffeine fuel.",
      ["tech", "beverage"],
      60
    ),
    clueText: "Craft 2 items · Tokyo + Milan or SF",
  },
  {
    ...buildSeededRecipe(
      ["Whisky", "Shortbread"],
      "Hogmanay",
      "🎆",
      "Fireside New Year cheer toasted with oak malt and butter biscuit.",
      "Classic Scottish hospitality poured and plated for midnight.",
      ["heritage", "culinary", "beverage"],
      72
    ),
    clueText: "Craft 2 items · look to Edinburgh",
  },
  {
    ...buildSeededRecipe(
      ["Cacao", "Chili Pepper"],
      "Mole Sauce",
      "🍲",
      "Velvety spiced chocolate simmered into an ancient fiesta glaze.",
      "Earthy cacao and smoky chilies marry in Oaxacan kitchens.",
      ["culinary", "spice", "heritage"],
      58
    ),
    clueText: "Craft 2 items · look to Oaxaca",
  },
  {
    ...buildSeededRecipe(
      ["Gin", "Botanical Gin"],
      "Distillery",
      "⚗️",
      "Copper stills brimming with juniper, citrus peel, and florals.",
      "Two distinct craft gins unite into a dedicated botanical house.",
      ["beverage", "craft", "botanical"],
      78
    ),
    clueText: "Craft 2 items · London + Singapore",
  },
  {
    ...buildSeededRecipe(
      ["Metro", "Yellow Cab"],
      "Rush Hour",
      "🚦",
      "Gridlocked avenues above and packed trains rattling below.",
      "Subway lines and city taxis collide at five o'clock.",
      ["transport", "architecture"],
      62
    ),
    clueText: "Craft 2 items · Paris + New York",
  },
  {
    ...buildSeededRecipe(
      ["Espresso", "Croissant"],
      "Cafe Terrace",
      "🥐",
      "A marble bistro table set with flaky pastry and dark crema.",
      "Morning coffee and laminated butter pastry create the classic sidewalk pause.",
      ["culinary", "beverage", "romance"],
      50
    ),
    clueText: "Craft 2 items · Milan/SF + Paris",
  },
  {
    ...buildSeededRecipe(
      ["Cotton", "Silk"],
      "Brocade",
      "👘",
      "Lustrous patterned cloth woven with crisp natural threads.",
      "Durable cotton warp meets shimmering silk weft on the loom.",
      ["textile", "luxury", "fashion"],
      74
    ),
    clueText: "Craft 2 items · Textile hubs",
  },
  {
    ...buildSeededRecipe(
      ["Skyscraper", "Fog"],
      "Cloud Nine",
      "☁️",
      "Penthouse glass floating high above a veiled skyline.",
      "A tower rising straight through the mist into clear air.",
      ["architecture", "weather", "luxury"],
      68
    ),
    clueText: "Craft 2 items · New York + London/SF",
  },
  {
    ...buildSeededRecipe(
      ["Vinyl Record", "Jazz Record"],
      "Record Store",
      "🎵",
      "Wooden crates stuffed with rare pressings and listening booths.",
      "Indie wax and smoky saxophone grooves share one dusty shelf.",
      ["music", "heritage"],
      70
    ),
    clueText: "Craft 2 items · Manchester/Tokyo + NY",
  },
  {
    ...buildSeededRecipe(
      ["Chai", "Saffron"],
      "Royal Masala",
      "👑",
      "Gilded spiced tea infused with precious crimson threads.",
      "Everyday cardamom chai elevated with luxury saffron.",
      ["beverage", "spice", "luxury"],
      68
    ),
    clueText: "Craft 2 items · Mumbai + Milan/Marrakech",
  },
  {
    ...buildSeededRecipe(
      ["Cotton", "Denim"],
      "Workwear",
      "👖",
      "Heavy riveted indigo twill tailored for tireless hands.",
      "Raw spun cotton reinforced into rugged bay-area denim.",
      ["fashion", "textile"],
      62
    ),
    clueText: "Craft 2 items · Cotton + San Francisco",
  },
  {
    ...buildSeededRecipe(
      ["Mint Tea", "Brass Lantern"],
      "Riad Courtyard",
      "🏮",
      "Starlit shadows flickering over sweet poured green tea.",
      "Pierced brass light and fragrant mint evoke a serene courtyard.",
      ["heritage", "romance", "beverage"],
      62
    ),
    clueText: "Craft 2 items · look to Marrakech",
  },
  {
    ...buildSeededRecipe(
      ["Matcha", "Ceramic Bowl"],
      "Tea Ceremony",
      "🍵",
      "Mindful whisking inside a hand-thrown Raku vessel.",
      "Ceremonial powder and glazed stoneware define quiet Kyoto ritual.",
      ["heritage", "botanical", "craft"],
      73
    ),
    clueText: "Craft 2 items · look to Kyoto",
  },
  {
    ...buildSeededRecipe(
      ["Bagel", "Espresso"],
      "Morning Commute",
      "🥯",
      "Sesame crust in one hand and a hot cup in the other.",
      "Deli bread and dark roast fuel a brisk city start.",
      ["culinary", "beverage"],
      48
    ),
    clueText: "Craft 2 items · New York + Espresso",
  },
  {
    ...buildSeededRecipe(
      ["Wool Sweater", "Geothermal Steam"],
      "Hot Spring",
      "♨️",
      "Warm wool folded beside steaming volcanic mineral pools.",
      "Icelandic winter warmth meets natural geothermal mist.",
      ["weather", "luxury", "botanical"],
      73
    ),
    clueText: "Craft 2 items · look to Reykjavik",
  },
  {
    ...buildSeededRecipe(
      ["Turkish Coffee", "Mosaic Lamp"],
      "Grand Bazaar",
      "🪔",
      "Spiced roast steaming beneath colored glass globes.",
      "Copper-pot coffee and stained-glass glow capture Istanbul's heart.",
      ["heritage", "craft", "beverage"],
      70
    ),
    clueText: "Craft 2 items · look to Istanbul",
  },
  {
    ...buildSeededRecipe(
      ["Orchid", "Monsoon Rain"],
      "Conservatory",
      "🌿",
      "Humid glass domes sheltering vibrant tropical blooms.",
      "Equatorial rain nourishes delicate Singapore orchids.",
      ["botanical", "architecture", "weather"],
      60
    ),
    clueText: "Craft 2 items · look to Singapore",
  },
  {
    ...buildSeededRecipe(
      ["Ramen", "Neon"],
      "Night Market",
      "🏮",
      "Steaming noodle stalls glowing beneath buzzing street signs.",
      "Late-night broth served under bright Tokyo neon.",
      ["culinary", "tech"],
      62
    ),
    clueText: "Craft 2 items · look to Tokyo",
  },
  {
    ...buildSeededRecipe(
      ["Red Bus", "Umbrella"],
      "Rainy Commute",
      "🌧️",
      "Dripping canopies boarding a scarlet double-decker.",
      "Wet pavements and bright red transit capture London weather.",
      ["transport", "weather"],
      68
    ),
    clueText: "Craft 2 items · look to London",
  },
  {
    ...buildSeededRecipe(
      ["Leather Bag", "Perfume"],
      "Fashion Week",
      "👠",
      "Front-row leather and iris fragrance along runway lights.",
      "Milanese calfskin and Parisian scent define high style.",
      ["fashion", "luxury"],
      97
    ),
    clueText: "Craft 2 items · Milan + Paris",
  },
  {
    ...buildSeededRecipe(
      ["Baguette", "Love", "Espresso"],
      "Parisian Morning",
      "☕",
      "Warm terrace sunlight over fresh crust, coffee, and affection.",
      "Bread, coffee, and romance distill an effortless morning in Paris.",
      ["culinary", "romance", "beverage"],
      99
    ),
    clueText: "Craft 3 items · Paris + Espresso",
  },
  {
    ...buildSeededRecipe(
      ["Tagine Pot", "Saffron", "Pomegranate"],
      "Sultan's Feast",
      "🍽️",
      "Fragrant slow-braised platter crowned with jewel-red seeds.",
      "Earthenware heat, golden spice, and ruby fruit create a banquet.",
      ["culinary", "spice", "luxury"],
      116
    ),
    clueText: "Craft 3 items · Marrakech + Istanbul",
  },
  // Add all 8 Legendary Discoveries to the canonical seeded recipe map
  ...LEGENDARY_DISCOVERIES.map((legend) =>
    buildSeededRecipe(
      legend.canonicalIngredients,
      legend.name,
      legend.emoji,
      legend.description,
      legend.lateralSpark,
      legend.tags,
      legend.baseValue,
      legend.id
    )
  ),
];

export const SEEDED_RECIPES: Record<string, LockedRecipe> = Object.fromEntries(
  RAW_SEEDED_RECIPES.map(({ clueText: _ignored, ...recipe }) => [recipe.sortedKey, recipe])
);

export const SEEDED_BOUNTY_BLUEPRINTS: BountyBlueprint[] = RAW_SEEDED_RECIPES.filter(
  (r) => !r.legendaryId
).map((r) => ({
  itemName: r.resultName,
  itemEmoji: r.resultEmoji,
  clueText: r.clueText || `Craft ${r.ingredients.length} items`,
  difficulty: r.ingredients.length >= 3 ? 2 : 1,
}));

export const CHAPTER_OBJECTIVES: ChapterObjectiveDef[] = [
  {
    id: "ch_1_trade",
    chapterNumber: 1,
    title: "Maiden Voyage",
    description: "Buy local stock, travel to a neighboring city, and sell 1 item.",
    rewardCoins: 40,
    target: 1,
  },
  {
    id: "ch_2_bounty",
    chapterNumber: 2,
    title: "Guild Seal",
    description: "Fulfill 1 exact-item Guild Bounty from the Job Board.",
    rewardCoins: 65,
    target: 1,
  },
  {
    id: "ch_3_satchel",
    chapterNumber: 3,
    title: "Bigger Pack",
    description: "Expand your travel satchel to 12 or more slots.",
    rewardCoins: 90,
    target: 12,
  },
  {
    id: "ch_4_triad",
    chapterNumber: 4,
    title: "Triad Synthesis",
    description: "Switch the bench to 3-Item Mode and complete a triple craft.",
    rewardCoins: 110,
    target: 1,
  },
  {
    id: "ch_5_legend",
    chapterNumber: 5,
    title: "Mythic Discovery",
    description: "Unlock any 1 Legendary Discovery in the Hall of Legends.",
    rewardCoins: 160,
    target: 1,
  },
  {
    id: "ch_6_atlas",
    chapterNumber: 6,
    title: "Grand Cartographer",
    description: "Chart all 16 cities across the World Trade Network.",
    rewardCoins: 260,
    target: 16,
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_trade",
    title: "First Ledger Entry",
    description: "Complete your first item sale in a city market.",
    category: "trade",
    target: 1,
  },
  {
    id: "bounty_1",
    title: "Contract Runner",
    description: "Fulfill your first Guild Bounty contract.",
    category: "trade",
    target: 1,
  },
  {
    id: "bounty_5",
    title: "Guild Courier",
    description: "Fulfill 5 Guild Bounty contracts.",
    category: "trade",
    target: 5,
  },
  {
    id: "big_margin",
    title: "Arbitrage Artist",
    description: "Sell a single item for at least 120 coins.",
    category: "trade",
    target: 120,
  },
  {
    id: "purse_500",
    title: "Sound Purse",
    description: "Hold 500 coins at once.",
    category: "wealth",
    target: 500,
  },
  {
    id: "purse_2000",
    title: "Guild Financier",
    description: "Hold 2,000 coins at once.",
    category: "wealth",
    target: 2000,
  },
  {
    id: "earned_5000",
    title: "Caravan Fortune",
    description: "Earn 5,000 cumulative coins across trades and bounties.",
    category: "wealth",
    target: 5000,
  },
  {
    id: "first_craft",
    title: "Spark of Alchemy",
    description: "Combine ingredients on the Crafting Bench.",
    category: "alchemy",
    target: 1,
  },
  {
    id: "triple_craft",
    title: "Triad Synthesis",
    description: "Complete a 3-ingredient combination.",
    category: "alchemy",
    target: 1,
  },
  {
    id: "recipes_5",
    title: "Apprentice Grimoire",
    description: "Lock 5 unique recipes into your Grimoire.",
    category: "alchemy",
    target: 5,
  },
  {
    id: "recipes_20",
    title: "Master Alchemist",
    description: "Lock 20 unique recipes into your Grimoire.",
    category: "alchemy",
    target: 20,
  },
  {
    id: "legend_1",
    title: "Mythic Spark",
    description: "Discover your first Legendary Masterwork.",
    category: "alchemy",
    target: 1,
  },
  {
    id: "legend_8",
    title: "Keeper of Legends",
    description: "Unlock all 8 Legendary Discoveries.",
    category: "alchemy",
    target: 8,
  },
  {
    id: "satchel_12",
    title: "Pack Mule",
    description: "Upgrade your travel satchel to 12 or more slots.",
    category: "travel",
    target: 12,
  },
  {
    id: "visit_8",
    title: "Regional Navigator",
    description: "Chart 8 different cities across the network.",
    category: "travel",
    target: 8,
  },
  {
    id: "visit_16",
    title: "Global Cartographer",
    description: "Chart all 16 cities in the WanderCraft network.",
    category: "travel",
    target: 16,
  },
];
