/* ==========================================================================
   Hasatz Solutions Client Portal - Core Utilities & Data Layer (js/app.js)
   ========================================================================== */

// Storage Keys
const STORAGE_KEYS = {
  REQUIREMENTS: 'hasatz_requirements',
  USER_SESSION: 'hasatz_user_session',
  ADMIN_SESSION: 'hasatz_admin_session'
};

// Seed Requirements for immediate interactive demo
const DEMO_REQUIREMENTS = [
  {
    id: 'HSZ-2026-8092',
    fullName: 'Alex Vance',
    email: 'alex.vance@techcorp.io',
    phone: '+91 98765 43210',
    businessName: 'Vance Tech Solutions',
    websiteType: 'Business',
    projectName: 'Enterprise Corporate Hub',
    websiteDescription: 'Modern corporate website with dynamic case studies, client portal integrations, and career application workflow.',
    targetAudience: 'B2B Enterprise Clients, Investors',
    pagesRequired: ['Home', 'About', 'Services', 'Contact', 'Blog'],
    featuresRequired: ['WhatsApp', 'Contact Form', 'Login System', 'Database', 'AI Features'],
    preferredColor: '#10b981',
    websiteStyle: 'Modern Corporate IT',
    referenceUrl: 'https://stripe.com',
    budget: '₹30,000 - ₹50,000',
    completionDate: '2026-09-30',
    additionalRequirements: 'Requires dark mode, smooth scroll animations, and multitenant CMS structure.',
    files: ['VanceTech_BrandGuide.pdf', 'Logo_Vector.svg'],
    status: 'In Progress',
    createdAt: '2026-08-10T10:30:00.000Z'
  },
  {
    id: 'HSZ-2026-9145',
    fullName: 'Sophia Martinez',
    email: 'sophia@luxecouture.com',
    phone: '+91 91234 56789',
    businessName: 'Luxe Couture Atelier',
    websiteType: 'E-commerce',
    projectName: 'High Fashion E-Store',
    websiteDescription: 'Luxury fashion store with interactive 3D product showcase, multi-currency checkout, and loyalty points.',
    targetAudience: 'Fashion Enthusiasts, Premium Shoppers',
    pagesRequired: ['Home', 'About', 'Products', 'Gallery', 'Contact', 'Login'],
    featuresRequired: ['Payment', 'WhatsApp', 'Booking', 'Login System', 'Database'],
    preferredColor: '#ec4899',
    websiteStyle: 'Luxury Minimalist',
    referenceUrl: 'https://gucci.com',
    budget: '₹50,000 - ₹1,00,000',
    completionDate: '2026-10-15',
    additionalRequirements: 'High resolution asset support with fast CDN caching.',
    files: ['Luxe_Catalog.pdf'],
    status: 'Reviewing',
    createdAt: '2026-08-14T14:15:00.000Z'
  },
  {
    id: 'HSZ-2026-4421',
    fullName: 'Rahul Sharma',
    email: 'rahul@sharmaestates.in',
    phone: '+91 88383 03167',
    businessName: 'Sharma Prime Properties',
    websiteType: 'Business',
    projectName: 'Real Estate Portfolio Portal',
    websiteDescription: 'Property listing portal with interactive map filtering, virtual tours, and agent scheduling.',
    targetAudience: 'Homebuyers, Property Investors',
    pagesRequired: ['Home', 'About', 'Services', 'Gallery', 'Contact'],
    featuresRequired: ['Google Maps', 'Booking', 'WhatsApp', 'Contact Form'],
    preferredColor: '#06b6d4',
    websiteStyle: 'Clean Modern Corporate',
    referenceUrl: 'https://zillow.com',
    budget: '₹15,000 - ₹30,000',
    completionDate: '2026-09-10',
    additionalRequirements: 'Fast mobile response for property listings on the go.',
    files: ['Properties_Overview.xlsx'],
    status: 'Submitted',
    createdAt: '2026-08-17T09:00:00.000Z'
  }
];

// Data Store Layer
class StoreService {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
    if (!existing || existing.includes('CNX-')) {
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(DEMO_REQUIREMENTS));
    }
  }

  // Get all requirements
  getRequirements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(DEMO_REQUIREMENTS));
        return DEMO_REQUIREMENTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(DEMO_REQUIREMENTS));
        return DEMO_REQUIREMENTS;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading requirements:', e);
      return DEMO_REQUIREMENTS;
    }
  }

  // Get single requirement by ID
  getRequirementById(id) {
    const items = this.getRequirements();
    return items.find(item => item.id === id);
  }

  // Save new requirement
  addRequirement(reqData) {
    const items = this.getRequirements();
    items.unshift(reqData);
    localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(items));
    return reqData;
  }

  // Update status of requirement
  updateRequirementStatus(id, newStatus) {
    const items = this.getRequirements();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index].status = newStatus;
      items[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(items));
      return items[index];
    }
    return null;
  }
}

// Instantiate global Store
window.HasatzStore = new StoreService();
window.CodenexaStore = window.HasatzStore; // Alias for backward compatibility

// UI Toast Notification Helper
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Date Format Helper
window.formatDate = function(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Navbar mobile toggle setup
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
