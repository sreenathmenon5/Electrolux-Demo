import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductCard } from './ProductCard';

export class ProductCategoryPage extends BasePage {
  readonly categoryURL = 'https://www.electrolux.in/appliances/refrigerators/';

  // Locators
  private get categoryHeading(): Locator {
    return this.page.locator('h1').filter({ hasText: /refrigerators/i });
  }

  private get productCountIndicator(): Locator {
    return this.page.locator('text=/\\d+\\s+Product\\(s\\)/i');
  }

  private get filterContainer(): Locator {
    return this.page.locator('[data-testid="filters"], .filters, [class*="filter"]').first();
  }

  private get fridgeTypeFilters(): Locator {
    // Match specific filter text patterns with counts
    return this.page.locator('a, button').filter({
      hasText: /refrigerators?\s*\(\d+\)/i,
    });
  }

  private get frenchDoorFilterLink(): Locator {
    // Match "French door refrigerators (12)" text
    return this.page.locator('a, button').filter({ 
      hasText: /french\s+door\s+refrigerators/i 
    }).first();
  }

  private get productCards(): Locator {
    return this.page.locator('[data-testid="product-card"], .product-card, [class*="product-item"], article');
  }

  // Methods
  async navigateToCategory(): Promise<void> {
    await this.goto(this.categoryURL);
    await this.page.waitForLoadState('networkidle',{timeout: 60000});
  }

  async isCategoryPageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.categoryHeading, 10000);
      return true;
    } catch {
      return false;
    }
  }

  async getCategoryHeading(): Promise<string> {
    return this.getText(this.categoryHeading);
  }

  async getProductCount(): Promise<number> {
    const countText = await this.getText(this.productCountIndicator);
    const match = countText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getProductCountText(): Promise<string> {
    return this.getText(this.productCountIndicator);
  }

  async areFilterLinksDisplayed(): Promise<boolean> {
    try {
      const count = await this.fridgeTypeFilters.count();
      return count >= 5;
    } catch {
      return false;
    }
  }

  async getFilterLinksText(): Promise<string[]> {
    const count = await this.fridgeTypeFilters.count();
    const filters: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this.fridgeTypeFilters.nth(i).textContent();
      if (text) filters.push(text.trim());
    }

    return filters;
  }

  async clickFrenchDoorFilter(): Promise<void> {
    await this.waitForElement(this.frenchDoorFilterLink);
    await this.clickElement(this.frenchDoorFilterLink);
    await this.page.waitForLoadState('networkidle',{timeout: 60000});
  }

  async clickAllFilter(): Promise<void> {
    // Navigate back to the main refrigerators page (equivalent to "All" filter)
    await this.goto(this.categoryURL);
    await this.page.waitForLoadState('networkidle',{timeout: 60000});
  }

  async getFilteredProductCount(): Promise<number> {
    return this.getProductCount();
  }

  async getProductsCount(): Promise<number> {
    return this.productCards.count();
  }

  async getFirstProductCard(): Promise<ProductCard> {
    const firstCard = this.productCards.first();
    await this.waitForElement(firstCard);
    console.log('First product card found');
    return new ProductCard(this.page, firstCard);
  }

  async getAllProductCards(): Promise<ProductCard[]> {
    const count = await this.productCards.count();
    const cards: ProductCard[] = [];

    for (let i = 0; i < count; i++) {
      cards.push(new ProductCard(this.page, this.productCards.nth(i)));
    }

    return cards;
  }

  async getPageURLPath(): Promise<string> {
    return this.getUrl();
  }

  async isFrenchDoorFilterApplied(): Promise<boolean> {
    const url = await this.getPageURLPath();
    return url.includes('french-door');
  }

  async isFrenchDoorFilterInURL(): Promise<boolean> {
    return this.isFrenchDoorFilterApplied();
  }
}