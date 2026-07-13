# Clerks Shop Page - Technical Specification

## Design System Analysis

### Color Palette

- **Primary Background**: `#090f1a` (Dark navy)
- **Primary Accent**: `#ff5f23` (Orange)
- **Secondary Text**: `#7886a0` (Light gray-blue)
- **White**: `#ffffff`
- **Alert Red**: `#a70404`
- **Light Background**: `aliceblue`

### Typography

- **Font Family**: IBM Plex Sans
- **Heading Weight**: Bold
- **Body Weight**: Normal

### Design Principles

- Minimalistic and clean layout
- Hover effects with scale transform (1.05-1.15)
- Smooth transitions (0.2s ease)
- Rounded corners for modern feel
- Orange accent for CTAs and highlights

---

## Product Specifications

### Shoe Inventory (4 Colorways)

1. **Clerks Rush - White/Navy** (Primary colorway from hero image)
   - Price: £89
   - Sizes: UK 6-12
2. **Clerks Rush - Blackout** (Black/White)
   - Price: £99
   - Sizes: UK 6-12
3. **Clerks Rush - Midnight Navy** (Navy/White)
   - Price: £109
   - Sizes: UK 6-12
4. **Clerks Rush - Sunset** (Orange/Grey)
   - Price: £129
   - Sizes: UK 6-12

---

## Page Structure

### Layout Components

```
┌─────────────────────────────────────────┐
│           HEADER (Existing)              │
├──────────┬──────────────────────────────┤
│          │                               │
│ FILTERS  │      PRODUCT GRID             │
│ SIDEBAR  │                               │
│          │   [Sort Dropdown]             │
│ - Color  │                               │
│ - Size   │   ┌────┐ ┌────┐ ┌────┐       │
│ - Price  │   │Shoe│ │Shoe│ │Shoe│       │
│          │   └────┘ └────┘ └────┘       │
│ [Size    │                               │
│  Chart]  │   ┌────┐ ┌────┐ ┌────┐       │
│          │   │Shoe│ │Shoe│ │Shoe│       │
│ [AI Rec] │   └────┘ └────┘ └────┘       │
│          │                               │
└──────────┴──────────────────────────────┘
│           FOOTER (Existing)              │
└─────────────────────────────────────────┘
```

---

## Feature Specifications

### 1. Filter Sidebar

**Filters:**

- **Color Filter**: Checkboxes for White/Navy, Black/White, Navy/White, Orange/Grey
- **Size Filter**: Dropdown or buttons for UK 6-12
- **Price Range**: Slider or input fields (£79-£129)

**Behavior:**

- Real-time filtering (no submit button)
- Multiple filters can be active simultaneously
- Clear all filters button

### 2. Sort Functionality

**Options:**

- Price: Low to High
- Price: High to Low
- Newest First (default)

**Implementation:**

- Dropdown in top-right of product grid
- Instant re-ordering on selection

### 3. Size Chart Modal

**Content:**
| UK | US | EU |
|----|----|----|
| 6 | 7 | 40 |
| 7 | 8 | 41 |
| 8 | 9 | 42 |
| 9 | 10 | 43 |
| 10 | 11 | 44 |
| 11 | 12 | 45 |
| 12 | 13 | 46 |

**Trigger:**

- Button in filter sidebar
- Modal overlay with close button

### 4. AI Recommendation System

**Input Fields:**

- Height (cm or ft/in)
- Weight (kg or lbs)
- Color Preference (dropdown: Any, Light, Dark, Bold)
- Foot Type (radio: Narrow, Regular, Wide)

**Recommendation Logic:**

```javascript
// Foot Type Matching
- Narrow → White/Navy, Midnight Navy (sleeker designs)
- Regular → All models
- Wide → Blackout, Sunset (chunkier designs)

// Color Preference
- Light → White/Navy
- Dark → Blackout, Midnight Navy
- Bold → Sunset

// Weight-based comfort
- <70kg → All models
- 70-90kg → Prioritize cushioned models
- >90kg → Recommend Sunset (most support)
```

**Output:**

- Display top 2 recommended shoes
- Highlight matching products in grid
- "Why this shoe?" explanation

---

## File Structure

```
/
├── index.html
├── Shop.html (to be updated)
├── style.css (to be updated)
├── js/
│   ├── shop.js (main shop functionality)
│   ├── filters.js (filter logic)
│   ├── products.js (product data)
│   └── recommendations.js (AI logic)
├── images/
│   ├── Clerks Rush.png
│   ├── Clerks Rush Blackout.png
│   ├── Clerks Rush Midnight Navy.png
│   └── (Sunset variant to be created/sourced)
└── SHOP_PAGE_SPECIFICATION.md
```

---

## Responsive Design Breakpoints

- **Desktop**: 1200px+ (3 columns)
- **Tablet**: 768px-1199px (2 columns, sidebar toggleable)
- **Mobile**: <768px (1 column, filters in drawer)

---

## Performance Considerations

1. Lazy load product images
2. Debounce filter inputs
3. Use CSS transforms for animations (GPU acceleration)
4. Minimize DOM manipulation
5. Cache filter states in sessionStorage

---

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance (WCAG AA)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Implementation Priority

1. ✅ Design system analysis
2. 🔄 Technical specification
3. ⏳ HTML structure
4. ⏳ CSS styling
5. ⏳ Product data
6. ⏳ Filter functionality
7. ⏳ Sort functionality
8. ⏳ Size chart modal
9. ⏳ AI recommendation system
10. ⏳ Testing & optimization

---

**Status**: Ready for implementation
**Estimated Completion**: 16 tasks remaining
**Next Step**: Switch to Code mode for implementation
