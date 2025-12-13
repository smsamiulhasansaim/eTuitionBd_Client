import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MdSave, MdCampaign, MdAttachMoney, MdContactSupport, 
  MdSecurity, MdCheck, MdInfoOutline 
} from 'react-icons/md';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlatformSettings = () => {
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  
  // Local state for the form (editable)
  const [settings, setSettings] = useState({
    commissionRate: 15,
    currency: 'BDT',
    isBannerActive: false,
    bannerText: "",
    bannerType: "info",
    supportEmail: "",
    supportPhone: "",
    officeAddress: "",
    maintenanceMode: false,
    allowRegistration: true
  });

  // --- 1. Fetch Settings (Query) ---
  const fetchSettings = async () => {
    // Get token for authentication if needed (optional based on your backend)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.email) throw new Error("Unauthorized");

    const res = await axios.get(`${API_URL}/api/admin/settings`);
    return res.data.data;
  };

  const { data: serverSettings, isLoading, isError, error } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: fetchSettings,
    refetchOnWindowFocus: false,
  });

  // --- 2. Sync Server Data to Local State ---
  useEffect(() => {
    if (serverSettings) {
      setSettings(prev => ({ ...prev, ...serverSettings }));
    }
  }, [serverSettings]);

  // --- 3. Save Settings (Mutation) ---
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      return await axios.put(`${API_URL}/api/admin/settings`, newSettings);
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries(['platformSettings']); // Ensure data consistency
      setTimeout(() => setIsSaved(false), 2000);
    },
    onError: (err) => {
      console.error("Save failed:", err);
      alert("Failed to save settings. Please try again.");
    }
  });

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  // --- Render States ---
  if (isLoading) return <Loading />;

  if (isError) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === "Unauthorized") {
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  // --- Main UI ---
  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Platform Settings</h2>
          <p className="text-sm text-gray-500">Manage global configurations and system alerts</p>
        </div>
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all
            ${isSaved 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}
            ${updateSettingsMutation.isPending ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {updateSettingsMutation.isPending ? "Saving..." : 
            (isSaved ? <><MdCheck size={20} /> Saved!</> : <><MdSave size={20} /> Save Changes</>)
          }
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- 1. Financial Settings --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><MdAttachMoney /></div>
            Financial Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="commissionRate"
                  value={settings.commissionRate}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <select 
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="BDT">BDT (Bangladeshi Taka)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- 2. Announcement Banner --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><MdCampaign /></div>
            Announcement Banner
          </h3>

          {/* Live Preview */}
          {settings.isBannerActive && (
            <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 text-sm
              ${settings.bannerType === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                settings.bannerType === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 
                'bg-green-50 text-green-800 border border-green-200'}
            `}>
              <MdInfoOutline className="mt-0.5 text-lg flex-shrink-0" />
              <div>
                <span className="font-bold uppercase text-xs mr-1">Preview:</span>
                {settings.bannerText || "No text set"}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Activate Banner</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isBannerActive" checked={settings.isBannerActive} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
              <div className="flex gap-2">
                {['info', 'warning', 'success'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSettings({...settings, bannerType: type})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                      settings.bannerType === type 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
              <textarea 
                name="bannerText"
                rows="2"
                value={settings.bannerText}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* --- 3. Contact Information --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><MdContactSupport /></div>
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input 
                type="email" 
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Phone</label>
              <input 
                type="text" 
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
              <input 
                type="text" 
                name="officeAddress"
                value={settings.officeAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* --- 4. Danger Zone / System --- */}
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><MdSecurity /></div>
            System Controls (Danger Zone)
          </h3>

          <div className="space-y-4">
             {/* Maintenance Toggle */}
             <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-red-200 transition-colors">
               <div>
                 <h4 className="font-bold text-gray-700 flex items-center gap-2">
                   Maintenance Mode
                   {settings.maintenanceMode && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full">ACTIVE</span>}
                 </h4>
                 <p className="text-xs text-gray-500 mt-1">If active, users will see a maintenance screen and cannot log in.</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
             </div>

             {/* Registration Toggle */}
             <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
               <div>
                 <h4 className="font-bold text-gray-700">Allow New Registrations</h4>
                 <p className="text-xs text-gray-500 mt-1">Enable or disable new student/tutor signups.</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlatformSettings;