import { Locator, Page } from '@playwright/test';

export class ProductCard {
  private cardElement: Locator;

  constructor(private page: Page, cardLocator: Locator) {
    this.cardElement = cardLocator;
  }

  // Locators
  private get productImage(): Locator {
    return this.cardElement.locator('img').first();
  }

  private get productTitle(): Locator {
    return this.cardElement.locator('[data-testid="product-title"], .product-title, h3, h4').first();
  }

  private get modelNumber(): Locator {
    return this.cardElement.locator('[data-testid="model-number"], .model-number, span:has-text("Model")').first();
  }

  private get starRating(): Locator {
    return this.cardElement.locator('[data-testid="rating"], .rating, [class*="star"]').first();
  }

  private get reviewCount(): Locator {
    return this.cardElement.locator('[data-testid="reviews"], .reviews, span:has-text("Review")').first();
  }

  private get featuresList(): Locator {
    return this.cardElement.locator('[data-testid="features"], .features, ul, li').first();
  }

  private get learnMoreButton(): Locator {
    return this.cardElement.locator('a, button').filter({ hasText: /learn more/i }).first();
  }

  private get whereToByButton(): Locator {
    return this.cardElement.locator('a, button').filter({ hasText: /where to buy|buy/i }).first();
  }

  // Validation methods
  async hasProductImage(): Promise<boolean> {
    return this.productImage.isVisible().catch(() => false);
  }

  async hasProductTitle(): Promise<boolean> {
    return this.productTitle.isVisible().catch(() => false);
  }

  async hasModelNumber(): Promise<boolean> {
    return this.modelNumber.isVisible().catch(() => false);
  }

  async hasStarRating(): Promise<boolean> {
    return this.starRating.isVisible().catch(() => false);
  }

  async hasReviewCount(): Promise<boolean> {
    return this.reviewCount.isVisible().catch(() => false);
  }

  async hasFeaturesList(): Promise<boolean> {
    return this.featuresList.isVisible().catch(() => false);
  }

  async hasLearnMoreButton(): Promise<boolean> {
    return this.learnMoreButton.isVisible().catch(() => false);
  }

  async hasWhereToByButton(): Promise<boolean> {
    return this.whereToByButton.isVisible().catch(() => false);
  }

  async getProductTitle(): Promise<string> {
    return (await this.productTitle.textContent({timeout: 60000})) ?? '';
  }

  async getModelNumber(): Promise<string> {
    return (await this.modelNumber.textContent()) || '';
  }

  async getStarRating(): Promise<string> {
    return (await this.starRating.textContent()) || '';
  }

  async clickLearnMore(): Promise<void> {
    await this.learnMoreButton.click();
  }

  async clickWhereToBuy(): Promise<void> {
    await this.whereToByButton.click();
  }

  async hasAllRequiredElements(): Promise<{
    hasImage: boolean;
    hasTitle: boolean;
    hasModel: boolean;
    hasRating: boolean;
    hasReviews: boolean;
    hasFeatures: boolean;
    hasLearnMore: boolean;
    hasBuyButton: boolean;
  }> {
    return {
      hasImage: await this.hasProductImage(),
      hasTitle: await this.hasProductTitle(),
      hasModel: await this.hasModelNumber(),
      hasRating: await this.hasStarRating(),
      hasReviews: await this.hasReviewCount(),
      hasFeatures: await this.hasFeaturesList(),
      hasLearnMore: await this.hasLearnMoreButton(),
      hasBuyButton: await this.hasWhereToByButton(),
    };
  }
}