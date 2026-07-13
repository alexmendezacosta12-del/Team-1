// Filter and Sort functionality for Clerks Shop

class ProductFilter {
  constructor(products) {
    this.products = products;
    this.activeFilters = {
      colors: [],
      sizes: [],
      priceRange: { min: 79, max: 129 },
      search: "",
    };
    this.sortBy = "newest";
  }

  // Apply all active filters
  applyFilters() {
    let filtered = [...this.products];

    // Filter by search query
    if (this.activeFilters.search.trim()) {
      const q = this.activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.colorway.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q),
      );
    }

    // Filter by color
    if (this.activeFilters.colors.length > 0) {
      filtered = filtered.filter((product) =>
        this.activeFilters.colors.includes(product.colorway),
      );
    }

    // Filter by size
    if (this.activeFilters.sizes.length > 0) {
      filtered = filtered.filter((product) =>
        this.activeFilters.sizes.some((size) => product.sizes.includes(size)),
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= this.activeFilters.priceRange.min &&
        product.price <= this.activeFilters.priceRange.max,
    );

    // Apply sorting
    filtered = this.sortProducts(filtered);

    return filtered;
  }

  // Sort products
  sortProducts(products) {
    const sorted = [...products];

    switch (this.sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate),
        );
    }
  }

  // Toggle color filter
  toggleColor(colorway) {
    const index = this.activeFilters.colors.indexOf(colorway);
    if (index > -1) {
      this.activeFilters.colors.splice(index, 1);
    } else {
      this.activeFilters.colors.push(colorway);
    }
  }

  // Toggle size filter
  toggleSize(size) {
    const index = this.activeFilters.sizes.indexOf(size);
    if (index > -1) {
      this.activeFilters.sizes.splice(index, 1);
    } else {
      this.activeFilters.sizes.push(size);
    }
  }

  // Update price range
  updatePriceRange(min, max) {
    this.activeFilters.priceRange.min = min;
    this.activeFilters.priceRange.max = max;
  }

  // Update sort method
  updateSort(sortMethod) {
    this.sortBy = sortMethod;
  }

  // Update search query
  updateSearch(query) {
    this.activeFilters.search = query;
  }

  // Clear all filters
  clearFilters() {
    this.activeFilters = {
      colors: [],
      sizes: [],
      priceRange: { min: 79, max: 129 },
      search: "",
    };
    this.sortBy = "newest";
  }

  // Get active filter count
  getActiveFilterCount() {
    return (
      this.activeFilters.colors.length +
      this.activeFilters.sizes.length +
      (this.activeFilters.priceRange.min !== 79 ||
      this.activeFilters.priceRange.max !== 129
        ? 1
        : 0) +
      (this.activeFilters.search.trim() ? 1 : 0)
    );
  }

  // Check if a specific filter is active
  isColorActive(colorway) {
    return this.activeFilters.colors.includes(colorway);
  }

  isSizeActive(size) {
    return this.activeFilters.sizes.includes(size);
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ProductFilter;
}

// Made with Bob
