import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  RefreshCw,
  Users,
  Crown,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'restaurant' | 'hotel';
  is_active: boolean;
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancelled';
  user_count: number;
  branch_count: number;
  last_activity: string;
  created_at: string;
}

const TenantManagement: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    type: 'restaurant' as 'restaurant' | 'hotel',
    adminUser: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadTenants();
    }
  }, [user, pagination.current]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `/api/v1/admin/tenants?page=${pagination.current}&limit=${pagination.limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
       }
     );

     if (response.ok) {
       const data = await response.json();
       if (data.success) {
         setTenants(data.data.tenants);
         setPagination(data.data.pagination);
       }
     }
   } catch (error) {
     console.error('Error loading tenants:', error);
   } finally {
     setLoading(false);
   }
 };

 const handleCreateTenant = async (e: React.FormEvent) => {
   e.preventDefault();
   try {
     const token = localStorage.getItem('access_token');
     const response = await fetch('/api/v1/admin/tenants', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(newTenant),
     });

     if (response.ok) {
       const data = await response.json();
       if (data.success) {
         setShowAddModal(false);
         setNewTenant({
           name: '',
           slug: '',
           type: 'restaurant',
           adminUser: {
             username: '',
             email: '',
             password: '',
           },
         });
         loadTenants();
       }
     } else {
       const errorData = await response.json();
       alert(errorData.message || 'Failed to create tenant');
     }
   } catch (error) {
     console.error('Error creating tenant:', error);
     alert('Failed to create tenant');
   }
 };

 const generateSlug = (name: string) => {
   return name
     .toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/^-+|-+$/g, '');
 };

 const getStatusIcon = (status: string, isActive: boolean) => {
   if (!isActive) return <XCircle className="w-4 h-4 text-red-500" />;
   
   switch (status) {
     case 'active':
       return <CheckCircle className="w-4 h-4 text-green-500" />;
     case 'trial':
       return <Clock className="w-4 h-4 text-blue-500" />;
     case 'suspended':
       return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
     case 'cancelled':
       return <XCircle className="w-4 h-4 text-red-500" />;
     default:
       return <AlertTriangle className="w-4 h-4 text-gray-500" />;
   }
 };

 const getStatusLabel = (status: string, isActive: boolean) => {
   if (!isActive) return 'Inactive';
   
   switch (status) {
     case 'active':
       return 'Active';
     case 'trial':
       return 'Trial';
     case 'suspended':
       return 'Suspended';
     case 'cancelled':
       return 'Cancelled';
     default:
       return 'Unknown';
   }
 };

 const filteredTenants = tenants.filter(tenant =>
   tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (user?.role !== 'super_admin') {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
         <p className="text-gray-600">Only Super Admins can access tenant management.</p>
       </div>
     </div>
   );
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
         <p className="text-gray-600">Loading tenants...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="space-y-6 animate-fade-in">
     {/* Header */}
     <div className="flex items-center justify-between">
       <div>
         <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
         <p className="text-gray-600 mt-1">
           Manage client organizations and their access to the system
         </p>
       </div>
       <button 
         onClick={() => setShowAddModal(true)}
         className="btn-primary flex items-center space-x-2"
       >
         <Plus className="w-4 h-4" />
         <span>Add New Client</span>
       </button>
     </div>

     {/* Stats Cards */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <div className="bg-white rounded-xl border border-gray-200 p-6">
         <div className="flex items-center justify-between">
           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
             <Building2 className="h-6 w-6 text-blue-600" />
           </div>
           <span className="text-2xl font-bold text-gray-900">{tenants.length}</span>
         </div>
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 p-6">
         <div className="flex items-center justify-between">
           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
             <CheckCircle className="h-6 w-6 text-green-600" />
           </div>
           <span className="text-2xl font-bold text-gray-900">
             {tenants.filter(t => t.is_active && t.subscription_status === 'active').length}
           </span>
         </div>
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-500">Active Clients</h3>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 p-6">
         <div className="flex items-center justify-between">
           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-50">
             <Clock className="h-6 w-6 text-yellow-600" />
           </div>
           <span className="text-2xl font-bold text-gray-900">
             {tenants.filter(t => t.subscription_status === 'trial').length}
           </span>
         </div>
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-500">Trial Clients</h3>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 p-6">
         <div className="flex items-center justify-between">
           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
             <Users className="h-6 w-6 text-purple-600" />
           </div>
           <span className="text-2xl font-bold text-gray-900">
             {tenants.reduce((sum, t) => sum + t.user_count, 0)}
           </span>
         </div>
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
         </div>
       </div>
     </div>

     {/* Search */}
     <div className="bg-white rounded-xl border border-gray-200 p-6">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
         <input
           type="text"
           placeholder="Search clients..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
         />
       </div>
     </div>

     {/* Tenants Table */}
     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
       <div className="px-6 py-4 border-b border-gray-200">
         <h3 className="text-lg font-semibold text-gray-900">Client Organizations</h3>
         <p className="text-sm text-gray-600">
           {filteredTenants.length} of {tenants.length} clients
         </p>
       </div>
       
       {filteredTenants.length > 0 ? (
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Client
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Type
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Status
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Users
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Branches
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Created
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Actions
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredTenants.map((tenant) => (
                 <tr key={tenant.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div>
                       <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                       <div className="text-sm text-gray-500">@{tenant.slug}</div>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                       {tenant.type}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center space-x-2">
                       {getStatusIcon(tenant.subscription_status, tenant.is_active)}
                       <span className="text-sm text-gray-900">
                         {getStatusLabel(tenant.subscription_status, tenant.is_active)}
                       </span>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {tenant.user_count}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {tenant.branch_count}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {new Date(tenant.created_at).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex space-x-2">
                       <button
                         onClick={() => setEditingTenant(tenant)}
                         className="text-blue-600 hover:text-blue-900"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button className="text-red-600 hover:text-red-900">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       ) : (
         <div className="text-center py-12">
           <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
           <h4 className="text-lg font-medium text-gray-600 mb-2">No Clients Found</h4>
           <p className="text-gray-500 mb-4">
             {searchTerm ? 'No clients match your search criteria' : 'Start by adding your first client organization'}
           </p>
           {!searchTerm && (
             <button 
               onClick={() => setShowAddModal(true)}
               className="btn-primary"
             >
               Add First Client
             </button>
           )}
         </div>
       )}
     </div>

     {/* Add Tenant Modal */}
     {showAddModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-900">Add New Client</h3>
             <button
               onClick={() => setShowAddModal(false)}
               className="text-gray-400 hover:text-gray-600"
             >
               ×
             </button>
           </div>

           <form onSubmit={handleCreateTenant} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Organization Name *
               </label>
               <input
                 type="text"
                 required
                 value={newTenant.name}
                 onChange={(e) => {
                   const name = e.target.value;
                   setNewTenant({
                     ...newTenant,
                     name,
                     slug: generateSlug(name),
                   });
                 }}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                 placeholder="e.g., Pizza Palace, Grand Hotel"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 URL Slug *
               </label>
               <input
                 type="text"
                 required
                 value={newTenant.slug}
                 onChange={(e) => setNewTenant({...newTenant, slug: e.target.value})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                 placeholder="pizza-palace"
               />
               <p className="text-xs text-gray-500 mt-1">Used for API access and URLs</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Business Type *
               </label>
               <select
                 required
                 value={newTenant.type}
                 onChange={(e) => setNewTenant({...newTenant, type: e.target.value as 'restaurant' | 'hotel'})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
               >
                 <option value="restaurant">Restaurant</option>
                 <option value="hotel">Hotel</option>
               </select>
             </div>

             <div className="border-t pt-4">
               <h4 className="font-medium text-gray-900 mb-3">Admin User Account</h4>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Admin Username *
                 </label>
                 <input
                   type="text"
                   required
                   value={newTenant.adminUser.username}
                   onChange={(e) => setNewTenant({
                     ...newTenant,
                     adminUser: {...newTenant.adminUser, username: e.target.value}
                   })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                   placeholder="admin123"
                 />
               </div>

               <div className="mt-3">
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Admin Email
                 </label>
                 <input
                   type="email"
                   value={newTenant.adminUser.email}
                   onChange={(e) => setNewTenant({
                     ...newTenant,
                     adminUser: {...newTenant.adminUser, email: e.target.value}
                   })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                   placeholder="admin@pizzapalace.com"
                 />
               </div>

               <div className="mt-3">
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Admin Password *
                 </label>
                 <input
                   type="password"
                   required
                   value={newTenant.adminUser.password}
                   onChange={(e) => setNewTenant({
                     ...newTenant,
                     adminUser: {...newTenant.adminUser, password: e.target.value}
                   })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                   placeholder="Strong password"
                   minLength={12}
                 />
                 <p className="text-xs text-gray-500 mt-1">Minimum 12 characters</p>
               </div>
             </div>

             <div className="flex space-x-3 mt-6">
               <button
                 type="button"
                 onClick={() => setShowAddModal(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                 Create Client
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 );
};

export default TenantManagement;