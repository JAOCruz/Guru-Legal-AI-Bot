# GURÚ SOLUCIONES DESIGN SYSTEM & BUILD PROMPT
### Professional Dashboard & Web Application Development Guide

**BRAND IDENTITY:** Gurú Soluciones - Modern tech services with neon-enhanced dark UI, professional animations, and enterprise-grade mobile responsiveness.

**MISSION:** Build React applications that match the exact visual style, animation quality, and mobile-first responsive patterns of the Gurú Soluciones dashboard.

---

## 🎨 VISUAL IDENTITY & STYLE GUIDE

### Color Palette (Exact Brand Colors)
```javascript
// Primary Brand Colors
const colors = {
  // Backgrounds
  background: {
    primary: '#0F172A',      // slate-900 - Main background
    secondary: '#1E293B',    // slate-800 - Cards, panels
    tertiary: '#151E32',     // Custom dark blue - Highlighted sections
    glass: 'rgba(15, 23, 42, 0.5)', // Glass morphism overlay
  },

  // Neon Accent Colors
  neon: {
    purple: '#9333EA',       // purple-600 - Primary CTAs, highlights
    blue: '#3B82F6',         // blue-500 - Info, secondary actions
    emerald: '#10B981',      // emerald-400 - Success, admin stats
    yellow: '#FBBF24',       // yellow-400 - Warnings, user stats
    cyan: '#06B6D4',         // cyan-400 - Special highlights
    pink: '#EC4899',         // pink-400 - Attention elements
  },

  // UI Colors
  ui: {
    border: '#334155',       // slate-700 - Default borders
    borderLight: '#475569',  // slate-600 - Hover borders
    text: '#FFFFFF',         // white - Primary text
    textSecondary: '#CBD5E1', // slate-300 - Secondary text
    textMuted: '#64748B',    // slate-500 - Muted text
    error: '#EF4444',        // red-500 - Errors
    success: '#10B981',      // emerald-500 - Success states
  }
};
```

### Neon Glow Effects (Signature Style)
```css
/* Purple Neon Glow - Primary CTA */
.neon-purple {
  background: #9333EA;
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
  transition: all 0.3s ease;
}
.neon-purple:hover {
  background: #A855F7;
  box-shadow: 0 0 25px rgba(147, 51, 234, 0.7);
}

/* Blue Neon Border - Highlighted Sections */
.neon-border-blue {
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.05);
}

/* Emerald Glow - Success/Admin Elements */
.neon-emerald {
  color: #10B981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Glass Morphism Effect */
.glass-effect {
  background: rgba(21, 30, 50, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(100, 116, 139, 0.1);
}
```

### Typography System
```javascript
// Font Families
const fonts = {
  display: 'font-display', // Large headers, stats (use Inter or similar)
  body: 'sans-serif',      // Body text (default Tailwind)
  mono: 'font-mono',       // Timestamps, technical data
};

// Type Scale
const typography = {
  // Headers
  h1: 'text-3xl md:text-5xl font-bold text-white',
  h2: 'text-2xl md:text-3xl font-bold text-white',
  h3: 'text-lg md:text-xl font-semibold text-white',

  // Stats/Numbers (Prominent)
  statLarge: 'font-display text-xl sm:text-2xl font-bold drop-shadow-[0_0_10px_currentColor]',
  statSmall: 'text-sm font-bold tracking-widest uppercase',

  // Body Text
  body: 'text-sm text-slate-300',
  bodySmall: 'text-xs text-slate-400',

  // Special
  label: 'text-sm font-medium text-slate-300',
  mono: 'font-mono text-xs text-slate-500',
};
```

---

## 📱 MOBILE-FIRST RESPONSIVE PATTERNS

### Critical Responsive Principles (From Production Fixes)

#### 1. **Flex Container Hierarchy with `min-w-0`**
```jsx
// PROBLEM: Flex children overflow on mobile
// SOLUTION: Add min-w-0 at every flex level

// ❌ WRONG - Overflows on small screens
<div className="flex">
  <div className="flex-1">
    <p className="text-xl">{longText}</p>
  </div>
</div>

// ✅ CORRECT - Properly constrains
<div className="flex min-w-0">          // Parent flex
  <div className="min-w-0 flex-1">      // Child flex
    <div className="min-w-0">           // Inner container
      <p className="truncate text-xl">{longText}</p>
    </div>
  </div>
</div>
```

#### 2. **Responsive Flex Direction Stacking**
```jsx
// Stack vertically on mobile, horizontal on desktop
<div className="flex flex-col gap-2 sm:flex-row">
  <input className="w-full flex-1 sm:w-auto" />
  <div className="flex gap-2">
    <button className="flex-1 sm:flex-none">Button 1</button>
    <button className="flex-1 sm:flex-none">Button 2</button>
  </div>
</div>

// Wrap buttons instead of horizontal scroll
<div className="flex flex-wrap gap-2">
  <button>Tab 1</button>
  <button>Tab 2</button>
  <button>Tab 3</button>
  {/* Wraps to next line automatically */}
</div>
```

#### 3. **Mobile-First Component Sizing**
```jsx
// Headers and padding
<header className="h-16 px-4 md:h-20 md:px-8">
  <h1 className="text-lg md:text-2xl">Title</h1>
</header>

// Container padding
<main className="p-3 md:p-8">
  <div className="space-y-6 md:space-y-8">
    {/* Content */}
  </div>
</main>

// Stats cards
<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
  <StatsCard />
</div>
```

#### 4. **Input and Form Responsiveness**
```jsx
// Date filters and inputs
<div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-800/50 px-2 py-1.5 sm:gap-2 sm:px-3">
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs">
    Label
  </span>
  <input
    type="date"
    className="min-w-0 flex-1 border-none bg-transparent p-0 text-xs text-white sm:text-sm"
  />
</div>
```

#### 5. **Table to Card Pattern (Mobile Optimization)**
```jsx
// Desktop: Table view
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>

// Mobile: Card view
<div className="divide-y divide-slate-700 md:hidden">
  {data.map(item => (
    <div key={item.id} className="bg-slate-900 p-3">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-white">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
        </div>
        <span className="flex-shrink-0 text-base font-bold text-emerald-400">
          {item.value}
        </span>
      </div>
    </div>
  ))}
</div>
```

#### 6. **Currency and Number Display**
```javascript
// NO DECIMALS - Cleaner on mobile
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// In components - use truncate carefully
<p className="text-xl sm:text-2xl font-bold">
  {formatCurrency(value)}
  {/* NO truncate class on numbers - they're already compact */}
</p>
```

#### 7. **Responsive Breakpoint Strategy**
```javascript
// Tailwind Breakpoints (Mobile First)
const breakpoints = {
  sm: '640px',   // Small phones → Tablets
  md: '768px',   // Tablets → Desktop
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};

// Usage Pattern
// Base (mobile): Smallest size, vertical stack, minimal padding
// sm: Slightly larger, may introduce horizontal layout
// md: Full desktop experience, tables visible, larger spacing
// lg+: Enhanced spacing, multi-column layouts
```

---

## 🎬 ANIMATION & INTERACTION PATTERNS

### Framer Motion Integration
```jsx
import { motion } from "framer-motion";

// Card entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.1 }}
  className="rounded-xl bg-slate-900 p-6"
>
  {/* Card content */}
</motion.div>

// Staggered list animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Button Hover Effects
```jsx
// Primary CTA with neon glow
<button className="rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all duration-300 hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(147,51,234,0.7)]">
  Primary Action
</button>

// Secondary action
<button className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-slate-300 transition-all hover:bg-slate-600 hover:text-white">
  Secondary Action
</button>

// Icon button with scale
<button className="rounded-lg p-2 text-slate-600 transition-all hover:scale-110 hover:text-red-400">
  <Trash2 size={16} />
</button>
```

### Loading States
```jsx
// Skeleton loader
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
</div>

// Spinner
<div className="flex justify-center items-center py-8">
  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
</div>

// Shimmer effect
<div className="relative overflow-hidden bg-slate-800">
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
</div>
```

---

## 🏗️ COMPONENT ARCHITECTURE

### Page Layout Structure
```jsx
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const MyPage: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-center">
        <div>
          <h2 className="font-display mb-2 text-2xl font-bold text-white md:text-3xl">
            Page Title
          </h2>
          <p className="text-sm text-slate-400">
            Page description
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 xl:w-auto">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] sm:w-auto">
            <Zap size={16} />
            Primary Action
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatsCard label="Metric 1" value="$1,234" color="text-emerald-400" />
        <StatsCard label="Metric 2" value="$5,678" color="text-yellow-400" />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Content sections */}
      </div>
    </DashboardLayout>
  );
};
```

### Stats Card Component (Reusable)
```jsx
interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subValue,
  color,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

      <div className="relative z-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400 sm:text-sm">
          {label}
        </p>
        <p className={`font-display text-xl font-bold sm:text-2xl ${color} drop-shadow-[0_0_10px_currentColor]`}>
          {value}
        </p>
        {subValue && (
          <p className="mt-1 text-xs text-slate-500">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
};
```

### Form Component Pattern
```jsx
const FormSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
      <h2 className="mb-8 text-3xl font-bold text-white">
        Form Title
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Field Label
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-3 text-red-400">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 text-emerald-400">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
```

---

## 🔒 SECURITY & BEST PRACTICES

### Authentication Pattern
```javascript
// JWT token management
const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),

  getCurrentUser: () => api.get("/auth/me"),
};

// Axios interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Input Validation & Sanitization
```javascript
// Client-side validation
const validateInput = (value: string, type: 'email' | 'number' | 'text') => {
  switch(type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'number':
      return !isNaN(parseFloat(value)) && isFinite(Number(value));
    case 'text':
      return value.trim().length > 0;
  }
};

// Percentage validation example
if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
  setError("El porcentaje debe estar entre 0 y 100");
  return;
}
```

### Role-Based Access Control
```jsx
// Admin-only routes
<Route
  path="/settings"
  element={
    isAdmin ? (
      <Settings />
    ) : (
      <div className="text-center text-slate-400 py-8">
        No tienes acceso a esta página
      </div>
    )
  }
/>

// Conditional navigation items
{isAdmin && (
  <NavItem
    icon={Settings}
    label="Configuración"
    to="/dashboard/settings"
  />
)}
```

---

## 📊 DATA HANDLING & STATE MANAGEMENT

### API Service Pattern
```typescript
// services/api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const dataAPI = {
  // GET with params
  getData: (startDate?: string, endDate?: string) =>
    api.get("/data", { params: { startDate, endDate } }),

  // POST with body
  createData: (data: CreateDataDTO) =>
    api.post("/data", data),

  // PUT update
  updateData: (id: number, data: UpdateDataDTO) =>
    api.put(`/data/${id}`, data),

  // DELETE
  deleteData: (id: number) =>
    api.delete(`/data/${id}`),
};
```

### React State Management Pattern
```jsx
const MyComponent: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataAPI.getData(startDate, endDate);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dataAPI.deleteData(id);
      fetchData(); // Refresh after delete
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* Render data */}
    </div>
  );
};
```

---

## 🎯 PERFORMANCE OPTIMIZATION

### Code Splitting & Lazy Loading
```jsx
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

// Lazy load heavy components
const DataCharts = lazy(() => import('@/components/dashboard/DataCharts'));
const Settings = lazy(() => import('@/pages/Settings'));

// Wrap in Suspense
<Suspense fallback={<LoadingScreen />}>
  <DataCharts data={data} />
</Suspense>
```

### Image Optimization
```jsx
// Responsive images with lazy loading
<img
  src="/images/hero.jpg"
  srcSet="/images/hero-small.jpg 640w, /images/hero-medium.jpg 1280w, /images/hero-large.jpg 1920w"
  sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1920px"
  alt="Description"
  loading="lazy"
  className="h-auto w-full"
/>
```

### Memoization
```jsx
import { useMemo, useCallback } from 'react';

const MyComponent = ({ data, filter }) => {
  // Memoize expensive calculations
  const filteredData = useMemo(() => {
    return data.filter(item => item.status === filter);
  }, [data, filter]);

  // Memoize callback functions
  const handleClick = useCallback((id: number) => {
    console.log('Clicked:', id);
  }, []);

  return <div>{/* Render */}</div>;
};
```

---

## 🚀 DEPLOYMENT & PRODUCTION

### Environment Variables
```bash
# .env.local (Development)
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development

# .env.production (Production)
VITE_API_URL=https://api.gurusolucionesrd.com/api
VITE_ENV=production
```

### Build Optimization
```json
// vite.config.ts optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion'],
          'charts': ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
});
```

---

## ✅ QUALITY CHECKLIST

### Before Pushing to Production:

#### Responsive Design
- [ ] Tested on mobile (375px, 414px)
- [ ] Tested on tablet (768px, 1024px)
- [ ] Tested on desktop (1280px, 1920px)
- [ ] All text readable without horizontal scroll
- [ ] All buttons accessible and not clipped
- [ ] Tables convert to cards on mobile
- [ ] Forms stack vertically on mobile
- [ ] `min-w-0` used in all flex hierarchies

#### Visual Consistency
- [ ] Colors match brand palette exactly
- [ ] Neon glows applied to CTAs
- [ ] Glass morphism effects where appropriate
- [ ] Consistent spacing (gap-3 mobile, gap-4+ desktop)
- [ ] Consistent border radius (rounded-lg, rounded-xl, rounded-2xl)
- [ ] Proper text truncation (no overflow dots on numbers)

#### Animation & Interactions
- [ ] Framer Motion animations on page load
- [ ] Hover states on all interactive elements
- [ ] Loading states for async operations
- [ ] Smooth transitions (transition-all duration-300)
- [ ] No layout shift during animations

#### Performance
- [ ] Images lazy loaded
- [ ] Heavy components code-split
- [ ] API calls debounced where appropriate
- [ ] No unnecessary re-renders
- [ ] Bundle size optimized

#### Security & Data
- [ ] Input validation on all forms
- [ ] Error handling for all API calls
- [ ] Proper authentication checks
- [ ] No sensitive data in console logs
- [ ] CORS configured correctly

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Proper ARIA labels
- [ ] Color contrast meets WCAG AA
- [ ] Focus states visible
- [ ] Screen reader friendly

---

## 🎨 EXAMPLE: BUILD A WHATSAPP BOT DASHBOARD

### Requirements Interpretation:
Given the Gurú Soluciones style guide, a WhatsApp bot dashboard would include:

**Visual Design:**
- Dark slate-900 background with neon purple/blue accents
- Glass morphism cards for message logs
- Emerald-400 for success metrics (messages sent)
- Yellow-400 for pending/queue metrics
- Real-time message feed with animations

**Key Features:**
1. **Stats Cards** - Message count, success rate, active chats (using StatsCard component)
2. **Message Log** - Table → Card pattern for mobile
3. **Bot Controls** - Start/Stop/Configure with neon buttons
4. **Analytics Charts** - Time-based message flow (using DataCharts pattern)
5. **Settings Panel** - Bot configuration (using Settings pattern)

**Responsive Behavior:**
- Stats: 2 cols mobile, 3 cols desktop
- Message log: Cards on mobile, table on desktop
- Controls: Vertical stack mobile, horizontal desktop
- All inputs: Full width mobile, auto desktop

**Animation:**
- Messages fade in with stagger
- Stats cards scale on load
- Real-time updates pulse
- Hover glows on interactive elements

**Implementation Structure:**
```
/dashboard/whatsapp-bot
  ├── pages/
  │   ├── WhatsAppDashboard.tsx  (Main stats view)
  │   ├── MessageLogs.tsx        (Message history)
  │   ├── BotSettings.tsx        (Configuration)
  │   └── Analytics.tsx          (Charts & insights)
  ├── components/
  │   ├── MessageCard.tsx        (Individual message)
  │   ├── BotStatusIndicator.tsx (Online/Offline)
  │   ├── QuickReplyManager.tsx  (Manage responses)
  │   └── ChatPreview.tsx        (Live chat preview)
  └── services/
      └── whatsappAPI.ts         (API integration)
```

This structure follows all established patterns while adding WhatsApp-specific features with the same professional quality and mobile responsiveness.

---

## 📝 FINAL NOTES

**This design system ensures:**
1. Visual consistency across all pages and components
2. Enterprise-grade mobile responsiveness
3. Professional animations and interactions
4. Secure and performant data handling
5. Maintainable and scalable code architecture

**When building new features:**
- Always start mobile-first
- Use the exact color palette
- Apply neon glows to CTAs
- Add Framer Motion animations
- Test on real devices
- Follow the responsive patterns exactly

**Quality Standard:**
Every component should match the production quality of the Gurú Soluciones dashboard - professional, responsive, animated, and secure.
