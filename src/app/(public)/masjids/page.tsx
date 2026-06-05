import { DirectoryMap } from '@/components/maps/DirectoryMap';

export const metadata = {
  title: 'Explore Masjids | Home Masjid',
  description: 'Discover masjids around the world and find prayer times near you.',
};

export default function MasjidsDirectoryPage() {
  const mapboxKey = process.env.MAPBOX_API_KEY;

  if (!mapboxKey) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Configuration Error</h1>
        <p className="text-muted-foreground">The Mapbox API key is missing. Please configure MAPBOX_API_KEY.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 lg:py-12 flex flex-col min-h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Masjids</h1>
          <p className="text-muted-foreground">Discover masjids around you, view accurate prayer times, and connect with communities.</p>
        </div>
        <div className="w-full md:w-auto">
          {/* Future search/filter implementation */}
          <input 
            type="text" 
            placeholder="Search by city or name..." 
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
        {/* Left Side: List view */}
        <div className="col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 max-h-[600px]">
          <div className="p-4 bg-surface rounded-xl border border-border shadow-sm text-center py-12">
            <h3 className="font-medium text-lg mb-2">Select a Masjid on the Map</h3>
            <p className="text-sm text-muted-foreground">
              Browse the map to find masjids near you. More features coming soon!
            </p>
          </div>
        </div>

        {/* Right Side: Map view */}
        <div className="col-span-1 lg:col-span-2 h-[500px] lg:h-[600px]">
          <DirectoryMap mapboxAccessToken={mapboxKey} />
        </div>
      </div>
    </div>
  );
}
