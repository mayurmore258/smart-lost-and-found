import React, { useState } from 'react';
import { UploadBox } from '../components/UploadBox';
import { apiService, getImageUrl } from '../services/api';

interface ReportLostProps {
  onNavigate: (path: string, params?: any) => void;
}

export const ReportLost: React.FC<ReportLostProps> = ({ onNavigate }) => {
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState('Wallets');
  const [color, setColor] = useState('Black');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setErrorMessage('Please upload a photo of the lost item.');
      return;
    }
    if (!color.trim()) {
      setErrorMessage('Please specify the primary color of the item.');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please enter the location where you lost the item.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide distinctive features or details about your item.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('category', category);
      formData.append('color', color.trim());
      if (brand.trim()) formData.append('brand', brand.trim());
      formData.append('location', location.trim());
      formData.append('date_time', dateTime.trim() || new Date().toISOString());
      formData.append('description', description.trim());

      const res = await apiService.createLostReport(formData);
      const itemId = res.id || res.item_id;

      // Save report locally so My Reports can display the user's submissions
      const reportRecord = {
        id: itemId,
        item_id: itemId,
        title: `${res.color} ${res.category}`,
        type: 'lost',
        category: res.category,
        color: res.color,
        brand: res.brand,
        location: res.location,
        date_time: res.date_time,
        description: res.description,
        image_url: getImageUrl(res.image_path),
        image_path: res.image_path,
        status: res.status || 'active',
        created_at: res.created_at,
      };

      try {
        const stored = JSON.parse(localStorage.getItem('smart_lost_found_user_reports') || '[]');
        localStorage.setItem(
          'smart_lost_found_user_reports',
          JSON.stringify([reportRecord, ...stored.filter((r: any) => r.id !== itemId)])
        );
      } catch (storageErr) {
        console.warn('LocalStorage save error:', storageErr);
      }

      // Navigate to searching screen with returned backend item ID
      onNavigate('searching', {
        itemId,
        itemDetails: reportRecord,
      });
    } catch (err: any) {
      console.error('Lost report submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit lost report. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-[#949994] hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block">
          Lost Item Report
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
          Tell us about your lost item
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
          Upload a photo and share key details so our AI can match with community-found records.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
        {/* Photo Upload Box */}
        <UploadBox
          onImageSelected={(file) => setImage(file)}
          label="Photo of your item *"
          hint="Upload a photo from your camera roll or gallery"
        />

        {/* Category & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            >
              <option value="Wallets">Wallet / Purse</option>
              <option value="Keys">Keys</option>
              <option value="Phones">Smartphone / Mobile</option>
              <option value="Earbuds">Earbuds / Headphones</option>
              <option value="Bags">Backpack / Bag</option>
              <option value="IDs & Cards">ID Card / Passport / Driving License</option>
              <option value="Glasses & Watches">Watch / Eyeglasses</option>
              <option value="Other">Other Belonging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
              Primary Color *
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, Navy Blue, Brown"
              className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
              required
            />
          </div>
        </div>

        {/* Brand & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
              Brand / Make (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Titan, Wildcraft"
              className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
              Approx. Date & Time Lost
            </label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="e.g. Today around 2 PM"
              className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
            Location Where Item Was Lost *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dadar Station Platform 1, Cafe Coffee Day Bandra"
            className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            required
          />
        </div>

        {/* Description / Distinctive marks */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-1.5">
            Distinctive Features & Details *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe scratches, keychains, stickers, inner contents, or unique identifiers..."
            className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            required
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white font-semibold text-base shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Submitting Report...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>Find My Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
