import { useState } from 'react';
import { useProfileEffects } from './Effects';
import { getProfileActions } from './Profile';
import { getFullUrl } from './Utils';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    artist_name: '',
    bio: '',
    genres: [],
    phone_number: ''
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [customGenre, setCustomGenre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Predefined genre options
  const genreOptions = [
    'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 
    'Classical', 'Country', 'Folk', 'Metal', 'Punk', 
    'Indie', 'Soul', 'Blues', 'Reggae', 'Disco', 'House'
  ];
  

  useProfileEffects({
    setProfile,
    setSocialLinks,
    setIsLoading,
    setError,
  });

  const {
    handleProfileChange,
    handleGenreToggle,
    handleAddCustomGenre,
    handleNewLinkChange,
    handleAddLink,
    handleDeleteLink,
    handleSaveProfile,
  } = getProfileActions({
    profile,
    setProfile,
    customGenre,
    setCustomGenre,
    newLink,
    setNewLink,
    socialLinks,
    setSocialLinks,
    setError,
  });

  
  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Artist Profile</h2>
      
      <div className="window-win98 mb-4">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Basic Information</div>
        </div>
        <div className="p-4 bg-gray-200 space-y-4">
          <div>
            <label className="block mb-1 font-bold" htmlFor="artist_name">
              Artist Name
            </label>
            <input
              id="artist_name"
              name="artist_name"
              value={profile.artist_name}
              onChange={handleProfileChange}
              placeholder="Your stage name or band name"
              className="w-full border-2 border-gray-400 p-2"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-bold" htmlFor="phone_number">
              Phone Number
            </label>
            <input
              id="phone_number"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleProfileChange}
              placeholder="Your contact phone number"
              className="w-full border-2 border-gray-400 p-2"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-bold" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself and your music..."
              className="w-full border-2 border-gray-400 p-2 h-32"
              rows={5}
            />
          </div>
        </div>
      </div>
      
      <div className="window-win98 mb-4">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Genres</div>
        </div>
        <div className="p-4 bg-gray-200">
          <div className="mb-4">
            <p className="mb-2">Select your musical genres:</p>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 border-2 ${
                    profile.genres.includes(genre)
                      ? 'bg-blue-500 text-black border-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-400'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-bold" htmlFor="custom-genre">
                Add Custom Genre
              </label>
              <input
                id="custom-genre"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="e.g. Synthwave"
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            <button 
              onClick={handleAddCustomGenre}
              className="btn-win98"
            >
              Add
            </button>
          </div>
          
          {profile.genres.length > 0 && (
            <div className="mt-4">
              <p className="font-bold">Your Genres:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.genres.map(genre => (
                  <div
                    key={genre}
                    className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 flex items-center"
                  >
                    {genre}
                    <button
                      onClick={() => handleGenreToggle(genre)}
                      className="ml-2 text-xs bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="window-win98 mb-4">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Social Links</div>
        </div>
        <div className="p-4 bg-gray-200 space-y-4">
          {socialLinks.length > 0 && (
            <div className="space-y-2">
              {socialLinks.map(link => (
                <div key={link.id} className="flex items-center gap-2 p-2 border-b border-gray-400">
                  <div className="flex-1 font-bold">{link.label}:</div>
                  <div className="flex-1 text-blue-600 truncate">
                    <a href={getFullUrl(link.url)} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="bg-red-100 text-red-800 px-2 py-1 border border-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold" htmlFor="link-label">
                Platform/Label
              </label>
              <input
                id="link-label"
                name="label"
                value={newLink.label}
                onChange={handleNewLinkChange}
                placeholder="e.g. Instagram, Twitter, Website"
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-bold" htmlFor="link-url">
                URL
              </label>
              <input
                id="link-url"
                name="url"
                value={newLink.url}
                onChange={handleNewLinkChange}
                placeholder="https://..."
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleAddLink}
              className="btn-win98"
            >
              Add Link
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          onClick={handleSaveProfile}
          className="btn-win98 px-6"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 