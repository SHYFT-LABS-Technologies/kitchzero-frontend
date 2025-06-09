import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import { 
  TrendingDown, 
  Plus, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const WasteTracking: React.FC = () => {
  const { user } = useAuth();
  const [wasteRecords, setWasteRecords] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [wasteCategories, setWasteCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, wasteCategoriesRes] = await Promise.all([
        wasteManagementAPI.getProducts(user?.tenantId),
        wasteManagementAPI.getWasteCategories(user?.tenantId),
      ]);

      setProducts(productsRes.data.products || []);
      setWasteCategories(wasteCategoriesRes.data.wasteCategories || []);
      
      // TODO: Load actual waste records when API is ready
     setWasteRecords([]);
   } catch (error) {
     console.error('Error loading waste tracking data:', error);
   } finally {
     setLoading(false);
   }
 };

 const StatCard: React.FC<{
   title: string;
   value: string;
   color: string;
   icon: React.ElementType;
   description?: string;
 }> = ({ title, value, color, icon: Icon, description }) => (
   <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
     <div className="flex items-center justify-between">
       <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-50`}>
         <Icon className={`h-6 w-6 text-${color}-600`} />
       </div>
       <span className="text-2xl font-bold text-gray-900">{value}</span>
     </div>
     <div className="mt-4">
       <h3 className="text-sm font-medium text-gray-500">{title}</h3>
       {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
     </div>
   </div>
 );

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
         <p className="text-gray-600">Loading waste tracking data...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="space-y-6 animate-fade-in">
     {/* Header */}
     <div className="flex items-center justify-between">
       <div>
         <h1 className="text-3xl font-bold text-gray-900">Waste Tracking</h1>
         <p className="text-gray-600 mt-1">
           Record and monitor food waste to reduce costs and improve efficiency
         </p>
       </div>
       <div className="flex space-x-3">
         <button className="btn-secondary flex items-center space-x-2">
           <Download className="w-4 h-4" />
           <span>Export</span>
         </button>
         <button 
           onClick={() => setShowAddModal(true)}
           className="btn-primary flex items-center space-x-2"
         >
           <Plus className="w-4 h-4" />
           <span>Record Waste</span>
         </button>
       </div>
     </div>

     {/* Stats Grid */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <StatCard
         title="Today's Waste"
         value="₨0.00"
         color="red"
         icon={TrendingDown}
         description="Waste cost today"
       />
       <StatCard
         title="This Week"
         value="₨0.00"
         color="orange"
         icon={Calendar}
         description="Weekly waste cost"
       />
       <StatCard
         title="Waste Incidents"
         value="0"
         color="yellow"
         icon={AlertTriangle}
         description="Total incidents"
       />
       <StatCard
         title="Avg Daily Waste"
         value="₨0.00"
         color="purple"
         icon={DollarSign}
         description="Last 30 days"
       />
     </div>

     {/* Waste Categories Overview */}
     {wasteCategories.length > 0 && (
       <div className="bg-white rounded-xl border border-gray-200 p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Categories</h3>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {wasteCategories.map((category) => (
             <div key={category.id} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
               <div 
                 className="w-12 h-12 rounded-full mx-auto mb-2"
                 style={{ backgroundColor: category.color }}
               />
               <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
               <p className="text-xs text-gray-500 mt-1">₨0.00</p>
             </div>
           ))}
         </div>
       </div>
     )}

     {/* Quick Start Guide */}
     <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Waste Tracking Setup</h3>
       <p className="text-gray-600 mb-4">
         To start tracking waste effectively, ensure you have products and waste categories configured.
       </p>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white rounded-lg p-4 border border-red-100">
           <div className="text-center">
             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <TrendingDown className="w-6 h-6 text-green-600" />
             </div>
             <h4 className="font-medium text-gray-900">Products: {products.length}</h4>
             <p className="text-sm text-gray-600 mt-1">
               {products.length === 0 ? 'Add products in Master Data' : 'Products available'}
             </p>
           </div>
         </div>
         <div className="bg-white rounded-lg p-4 border border-red-100">
           <div className="text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <AlertTriangle className="w-6 h-6 text-red-600" />
             </div>
             <h4 className="font-medium text-gray-900">Waste Types: {wasteCategories.length}</h4>
             <p className="text-sm text-gray-600 mt-1">
               {wasteCategories.length === 0 ? 'Add waste categories' : 'Categories configured'}
             </p>
           </div>
         </div>
         <div className="bg-white rounded-lg p-4 border border-red-100">
           <div className="text-center">
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <Plus className="w-6 h-6 text-blue-600" />
             </div>
             <h4 className="font-medium text-gray-900">Start Tracking</h4>
             <p className="text-sm text-gray-600 mt-1">
               Ready to record waste
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Waste Records */}
     <div className="bg-white rounded-xl border border-gray-200">
       <div className="px-6 py-4 border-b border-gray-200">
         <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-gray-900">Waste Records</h3>
           <div className="flex space-x-2">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 placeholder="Search waste records..."
                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
               />
             </div>
             <button className="btn-secondary btn-sm flex items-center space-x-1">
               <Filter className="w-4 h-4" />
               <span>Filter</span>
             </button>
           </div>
         </div>
       </div>
       
       <div className="p-6">
         <div className="text-center py-12">
           <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
           <h4 className="text-lg font-medium text-gray-600 mb-2">No Waste Records Yet</h4>
           <p className="text-gray-500 mb-6">
             Start recording waste to track patterns and reduce costs
           </p>
           <div className="space-y-3">
             {products.length === 0 ? (
               <p className="text-sm text-amber-600">
                 ⚠️ Add products in Master Data first
               </p>
             ) : wasteCategories.length === 0 ? (
               <p className="text-sm text-amber-600">
                 ⚠️ Add waste categories in Master Data first
               </p>
             ) : (
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="btn-primary"
               >
                 Record First Waste
               </button>
             )}
           </div>
         </div>
       </div>
     </div>

     {/* Record Waste Modal Placeholder */}
     {showAddModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-900">Record Waste</h3>
             <button
               onClick={() => setShowAddModal(false)}
               className="text-gray-400 hover:text-gray-600"
             >
               ×
             </button>
           </div>
           
           <div className="text-center py-8">
             <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h4 className="text-lg font-medium text-gray-600 mb-2">Waste Recording Form Coming Soon</h4>
             <p className="text-gray-500 mb-4">
               The waste recording interface will be implemented next
             </p>
             <button 
               onClick={() => setShowAddModal(false)}
               className="btn-primary"
             >
               Close
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default WasteTracking;