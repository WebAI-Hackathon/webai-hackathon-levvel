export interface MockAsset {
  id: string;
  name: string;
  type: 'image' | 'template' | 'character';
  url: string;
  thumbnail: string;
  tags: string[];
  dimensions?: { width: number; height: number; };
}

export const mockAssets: MockAsset[] = [
  {
    id: 'bg-city-1',
    name: 'City Skyline',
    type: 'image',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    tags: ['background', 'city', 'urban'],
    dimensions: { width: 1920, height: 1080 }
  },
  {
    id: 'char-hero-1',
    name: 'Superhero Male',
    type: 'character',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    tags: ['character', 'superhero', 'male'],
    dimensions: { width: 400, height: 600 }
  },
  {
    id: 'bubble-round',
    name: 'Round Speech Bubble',
    type: 'template',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    tags: ['speech', 'bubble', 'round']
  },
  {
    id: 'bubble-thought',
    name: 'Thought Bubble',
    type: 'template',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    tags: ['thought', 'bubble', 'cloud']
  }
];

// TODO: Replace with actual asset loading from workspace
export const getAssetsByType = (type: MockAsset['type']): MockAsset[] => {
  return mockAssets.filter(asset => asset.type === type);
};

export const searchAssets = (query: string): MockAsset[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockAssets.filter(asset => 
    asset.name.toLowerCase().includes(lowercaseQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};