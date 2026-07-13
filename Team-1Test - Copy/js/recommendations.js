// AI Recommendation System for Clerks Shoes

class ShoeRecommendation {
  constructor(products) {
    this.products = products;
  }

  // Main recommendation function
  getRecommendations(userProfile) {
    const { height, weight, colorPreference, footType } = userProfile;

    let scores = this.products.map((product) => ({
      product: product,
      score: 0,
      reasons: [],
    }));

    // Score based on foot type (highest priority)
    scores = scores.map((item) => {
      if (item.product.footType.includes(footType)) {
        item.score += 50;
        item.reasons.push(`Perfect fit for ${footType} feet`);
      }
      return item;
    });

    // Score based on color preference
    scores = scores.map((item) => {
      if (colorPreference === "any" || item.product.color === colorPreference) {
        item.score += 30;
        if (colorPreference !== "any") {
          item.reasons.push(`Matches your ${colorPreference} color preference`);
        }
      }
      return item;
    });

    // Score based on weight (comfort and support)
    const weightKg = this.convertToKg(weight);
    scores = scores.map((item) => {
      if (weightKg > 90) {
        // Recommend shoes with more support (higher price = more features)
        if (item.product.price >= 109) {
          item.score += 20;
          item.reasons.push("Enhanced support and cushioning");
        }
      } else if (weightKg < 70) {
        // Lighter users can enjoy all models
        item.score += 10;
      } else {
        // Medium weight - all shoes suitable
        item.score += 15;
      }
      return item;
    });

    // Bonus for featured products
    scores = scores.map((item) => {
      if (item.product.featured) {
        item.score += 5;
      }
      return item;
    });

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // Return top 2 recommendations
    return scores.slice(0, 2);
  }

  // Convert weight to kg if needed
  convertToKg(weight) {
    // Assume if weight > 200, it's in lbs
    if (weight > 200) {
      return weight * 0.453592;
    }
    return weight;
  }

  // Get explanation for recommendation
  getExplanation(recommendation) {
    const reasons = recommendation.reasons;
    if (reasons.length === 0) {
      return "Great all-around shoe for your needs";
    }
    return reasons.join(". ") + ".";
  }

  // Filter products by recommendation
  filterByRecommendation(recommendations) {
    return recommendations.map((rec) => rec.product.id);
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShoeRecommendation;
}

// Made with Bob
