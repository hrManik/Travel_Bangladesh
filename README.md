# Green Bangladesh — My Travel Map (আমার ভ্রমণ মানচিত্র)

A modern, responsive web application for visually tracking your personal travel journey across all **64 administrative districts of Bangladesh**.

Initially, the entire map of Bangladesh is white. As you visit places and mark them as visited, each district turns vibrant green (**#22C55E**), transforming the map into an evolving visual record of your exploration.

---

## 🌟 Key Features

### 1. Interactive Geographical Map
- **Accurate Boundaries:** Built with official GeoJSON boundary geometries covering all 64 districts across 8 divisions.
- **Visual Status:**
  - **Visited districts:** Lush Green (`#22C55E`).
  - **Unvisited districts:** Clean White (`#FFFFFF`) with subtle slate borders (`#CBD5E1`).
  - **Selected district:** High-contrast outline (`#0F172A`) with interactive focus.
- **Immediate Color Updates:** Districts change color instantly upon status toggling with smooth SVG transitions.
- **Rich Hover Tooltips:** Displays the district name in English and Bangla (বাংলা), division, and visit status.
- **Map Controls:** Zoom In/Out, Reset View (fits whole Bangladesh), and Basemap toggle (Minimalist Canvas vs Reference Basemap).

### 2. Live Travel Dashboard
- **Total Districts:** 64
- **Districts Visited & Remaining counters**
- **Explored Percentage:** Real-time calculation using `(Visited / 64) × 100`
- **Visual Progress Bar:** Sleek progress bar with milestone indicators (25%, 50%, 75%, 100%).
- **Traveler Milestones:** Dynamically awards ranks from *Budding Traveler* to *Green Bangladesh Champion*.
- **Division Explorer:** Quick filter chips for all 8 divisions (*Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh*) with live completion fractions.

### 3. District Details & Memory Journal
- **Bilingual District Names:** English and Bangla (e.g., *Cox's Bazar / কক্সবাজার, Bagerhat / বাগেরহাট, Sylhet / সিলেট*).
- **Date of Visit:** Date picker with quick shortcuts (*Today*, *Yesterday*).
- **Attractions Checklist:** Curated list of famous landmarks in each district (e.g., Sixty Dome Mosque, Nilgiri, Ratargul, Somapura Mahavihara) that you can check off.
- **Trip Notes:** Write personal travel memories, stories, local cuisine experiences, and hotel recommendations.
- **Photo Memories:** Upload travel photos stored locally with full preview gallery.
- **Star Rating:** Rate your travel experience from 1 to 5 stars.
- **Celebration Effects:** Confetti celebrations when you mark districts as visited.

### 4. Search and Filters
- **Real-time Search:** Filter districts instantly by English name, Bangla name, division, or attraction spot.
- **Status Filter:** Switch between *All (64)*, *Visited*, and *Unvisited*.
- **Division Filter:** Focus on specific administrative divisions.
- **Two-way Sync:** Selecting a district from the sidebar highlights and centers it on the map, and clicking a district on the map opens its card.

### 5. Client-Side GPS Location Detection ("Detect My Location")
- **Privacy-First:** Location coordinates are processed entirely inside the browser using point-in-polygon ray-casting against Bangladesh district polygons. No GPS data is ever sent to external servers or tracked in the background.
- **Explicit Consent:** Asks for browser permission, detects current coordinates, identifies the district, and requires user confirmation before marking it as visited.
- **Graceful Handling:** Includes simulated testing options for users exploring the app from outside Bangladesh.

### 6. Data Storage & Portability
- **Persistence:** All travel records persist across browser refreshes and sessions via `localStorage`.
- **JSON Export / Backup:** Download a full backup file of your travel history with one click.
- **JSON Import / Restore:** Restore your map from any previously exported backup.
- **Travel Passport Card:** Generate and download a personalized PNG passport certificate card or copy a social media summary.
- **Sample Demo Mode:** One-click demo trip loader with 14 iconic districts and a reset button.

### 7. Share Individual Visits
- Share a social-ready map image with the visited district highlighted. Facebook and WhatsApp get a link preview; download the image and caption for Instagram.
- Shared links open a separate, read-only district map page with a social preview image. The page links to a fresh app home (not an editable record) and does not include or modify the owner's local travel records, notes, or photos.
- Personal photos stay in the owner's browser and are not uploaded or visible to people opening a shared map link.

### 8. Driving Route Planner
- Search for places in Bangladesh, then view an estimated driving route, road distance, duration, and directions on an in-app map.
- Live Bangladesh place suggestions use Photon/OpenStreetMap as you type; full typed searches use OpenStreetMap Nominatim, and driving routes use the community OSRM demo service. Availability and routing accuracy are not guaranteed.
- Provides route guidance, not live traffic, turn-by-turn GPS navigation, or automatic rerouting.
- Map and place data © OpenStreetMap contributors.

The app footer displays a current-year copyright notice for Manik.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4, Plus Jakarta Sans, Hind Siliguri (Bangla)
- **Map & Geo Engine:** Leaflet, GeoJSON (64 Bangladesh administrative districts)
- **Effects & UI Icons:** Lucide React, Canvas Confetti
- **Build System:** Vite

---

## 🚀 Running the App Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Header, GPS trigger, Passport, and Menu
│   │   ├── DashboardSummary.tsx   # 64-district progress, stats, and division filters
│   │   ├── MapViewer.tsx          # Leaflet interactive map with GeoJSON polygons
│   │   ├── DistrictSidebar.tsx    # Search, status tabs, and district directory
│   │   ├── DistrictDetailModal.tsx# Visit date, notes, attractions, photos, rating
│   │   ├── GpsLocationModal.tsx   # Geolocation point-in-polygon detector
│   │   ├── PassportShareModal.tsx # Shareable passport certificate with Canvas PNG export
│   │   ├── BackupModal.tsx        # JSON backup and restore dialog
│   │   └── AboutModal.tsx         # About Green Bangladesh & methodology
│   ├── data/
│   │   ├── bangladeshDistrictsGeo.json # 64 district boundary polygons
│   │   ├── districtsInfo.json          # 64 districts metadata, attractions, Bangla names
│   │   └── districts.ts               # Typed data constants and division helpers
│   ├── hooks/
│   │   └── useTravelData.ts       # State management, local storage, confetti triggers
│   ├── utils/
│   │   └── geoUtils.ts            # Ray-casting point-in-polygon and distance calculations
│   ├── types/
│   │   └── index.ts               # Core TypeScript type definitions
│   ├── App.tsx                    # Main layout and view coordination
│   ├── index.css                  # Tailwind styles and Leaflet customization
│   └── main.tsx                   # React root mount
├── index.html                     # Entry HTML with meta tags and Google fonts
├── metadata.json                  # AI Studio configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

---

## 🇧🇩 The 64 Districts by Division

- **Dhaka (13):** Dhaka, Gazipur, Narayanganj, Tangail, Kishoreganj, Manikganj, Munshiganj, Narsingdi, Faridpur, Gopalganj, Madaripur, Rajbari, Shariatpur
- **Chattogram (11):** Chattogram, Cox's Bazar, Cumilla, Feni, Brahmanbaria, Rangamati, Bandarban, Khagrachhari, Noakhali, Lakshmipur, Chandpur
- **Rajshahi (8):** Rajshahi, Bogura, Pabna, Sirajganj, Naogaon, Natore, Chapainawabganj, Joypurhat
- **Khulna (10):** Khulna, Jashore, Satkhira, Bagerhat, Jhenaidah, Kushtia, Magura, Meherpur, Narail, Chuadanga
- **Barishal (6):** Barishal, Patuakhali, Bhola, Pirojpur, Barguna, Jhalokati
- **Sylhet (4):** Sylhet, Moulvibazar, Habiganj, Sunamganj
- **Rangpur (8):** Rangpur, Dinajpur, Gaibandha, Kurigram, Lalmonirhat, Nilphamari, Panchagarh, Thakurgaon
- **Mymensingh (4):** Mymensingh, Jamalpur, Netrokona, Sherpur
# Travel_BD
# Travel_Bangladesh
