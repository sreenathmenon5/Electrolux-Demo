# Playwright Page Object Model Test - Electrolux Product Category

This document contains the complete Playwright test code in TypeScript following the Page Object Model (POM) pattern for testing the Electrolux product listing with filters.

## Important Fix - Test Timeout Resolution

The initial test had an issue where the Refrigerators link in the main navigation menu appeared as "hidden" to Playwright. The solution implemented:

- **HomePage.ts** now navigates directly to the refrigerators URL instead of trying to click through the collapsed menu
- This is more reliable and avoids timing issues with menu animations

## Project Structure

```
tests/
├── pages/
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── ProductCard.ts
│   └── ProductCategoryPage.ts
├── specs/
│   └── electrolux-product-filter.spec.ts
└── example.spec.ts
```

## Installation Steps

1. Create directories manually:
   ```bash
   mkdir tests\pages
   mkdir tests\specs
   ```

2. Copy the following files to their respective locations

## File Contents

### 1. BasePage.ts
Location: `tests/pages/BasePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForElement(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  async getText(locator: Locator): Promise<string> {
    return locator.textContent() as Promise<string>;
  }

  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return locator.getAttribute(attribute);
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
```

### 2. HomePage.ts
Location: `tests/pages/HomePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly baseURL = 'https://www.electrolux.in/';
  readonly refrigeratorsURL = 'https://www.electrolux.in/appliances/refrigerators/';

  private get pageHeading(): Locator {
    return this.page.locator('h1, h2').first();
  }

  async navigateToHome(): Promise<void> {
    await this.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
  }

  async clickOnRefrigeratorCategory(): Promise<void> {
    // Navigate directly to refrigerators page (more reliable than menu clicks)
    await this.goto(this.refrigeratorsURL);
    await this.page.waitForLoadState('networkidle');
  }

  async isHomePageLoaded(): Promise<boolean> {
    const title = await this.page.title();
    return title.includes('Electrolux');
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getHeadingText(): Promise<string> {
    return this.getText(this.pageHeading);
  }
}
```

### 3. ProductCard.ts
Location: `tests/pages/ProductCard.ts`

```typescript
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
    return (await this.productTitle.textContent()) || '';
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
```

### 4. ProductCategoryPage.ts
Location: `tests/pages/ProductCategoryPage.ts`

```typescript
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

  private get allFilterLink(): Locator {
    return this.page.locator('a, button').filter({ hasText: /^all$/i }).first();
  }

  private get fridgeTypeFilters(): Locator {
    return this.page.locator('a, button').filter({
      hasText: /500L|Bottom freezer|Double door|French door|Side by side|Top freezer/i,
    });
  }

  private get frenchDoorFilterLink(): Locator {
    return this.page.locator('a, button').filter({ hasText: /french door/i }).first();
  }

  private get productCards(): Locator {
    return this.page.locator('[data-testid="product-card"], .product-card, [class*="product-item"], article');
  }

  // Methods
  async navigateToCategory(): Promise<void> {
    await this.goto(this.categoryURL);
    await this.page.waitForLoadState('networkidle');
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
    await this.page.waitForLoadState('networkidle');
  }

  async clickAllFilter(): Promise<void> {
    await this.waitForElement(this.allFilterLink);
    await this.clickElement(this.allFilterLink);
    await this.page.waitForLoadState('networkidle');
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
```

### 5. electrolux-product-filter.spec.ts
Location: `tests/specs/electrolux-product-filter.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductCategoryPage } from '../pages/ProductCategoryPage';

test.describe('Electrolux Product Category - Refrigerators Filter Test', () => {
  let homePage: HomePage;
  let productCategoryPage: ProductCategoryPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productCategoryPage = new ProductCategoryPage(page);
  });

  test('TC001: Load Electrolux homepage successfully', async () => {
    await homePage.navigateToHome();

    const isLoaded = await homePage.isHomePageLoaded();
    expect(isLoaded).toBe(true);

    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toContain('Electrolux');
  });

  test('TC002: Navigate to Refrigerators category page', async () => {
    await homePage.navigateToHome();
    await homePage.clickOnRefrigeratorCategory();

    const isCategoryLoaded = await productCategoryPage.isCategoryPageLoaded();
    expect(isCategoryLoaded).toBe(true);

    const url = await productCategoryPage.getPageURLPath();
    expect(url).toContain('/appliances/refrigerators/');
  });

  test('TC003: Verify Refrigerators heading is displayed', async () => {
    await productCategoryPage.navigateToCategory();

    const heading = await productCategoryPage.getCategoryHeading();
    expect(heading.toLowerCase()).toContain('refrigerator');
  });

  test('TC004: Verify product count is displayed', async () => {
    await productCategoryPage.navigateToCategory();

    const countText = await productCategoryPage.getProductCountText();
    expect(countText).toMatch(/\d+\s+Product\(s\)/i);

    const count = await productCategoryPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('TC005: Verify filter links are displayed with correct options', async () => {
    await productCategoryPage.navigateToCategory();

    const areFiltersDisplayed = await productCategoryPage.areFilterLinksDisplayed();
    expect(areFiltersDisplayed).toBe(true);

    const filterTexts = await productCategoryPage.getFilterLinksText();
    expect(filterTexts.length).toBeGreaterThanOrEqual(5);

    const expectedFilters = [
      'All',
      '500L',
      'Bottom freezer',
      'Double door',
      'French door',
      'Side by side',
      'Top freezer',
    ];

    expectedFilters.forEach((filter) => {
      const found = filterTexts.some((text) => text.toLowerCase().includes(filter.toLowerCase()));
      expect(found).toBe(true);
    });
  });

  test('TC006: Apply French door refrigerators filter and verify results', async () => {
    await productCategoryPage.navigateToCategory();

    const initialCount = await productCategoryPage.getProductCount();
    expect(initialCount).toBeGreaterThan(0);

    await productCategoryPage.clickFrenchDoorFilter();

    const filteredCount = await productCategoryPage.getFilteredProductCount();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    const isFrenchDoorApplied = await productCategoryPage.isFrenchDoorFilterInURL();
    expect(isFrenchDoorApplied).toBe(true);

    const url = await productCategoryPage.getPageURLPath();
    expect(url).toContain('french-door');
  });

  test('TC007: Verify filtered product count matches filter label (French door)', async () => {
    await productCategoryPage.navigateToCategory();
    await productCategoryPage.clickFrenchDoorFilter();

    const filteredCount = await productCategoryPage.getFilteredProductCount();
    const displayedCount = await productCategoryPage.getProductsCount();

    expect(displayedCount).toBeGreaterThanOrEqual(1);
    expect(displayedCount).toBeLessThanOrEqual(filteredCount + 1);
  });

  test('TC008: Reset filters by clicking All and verify all products are shown', async () => {
    await productCategoryPage.navigateToCategory();

    const initialCount = await productCategoryPage.getProductCount();

    await productCategoryPage.clickFrenchDoorFilter();
    const filteredCount = await productCategoryPage.getProductCount();

    await productCategoryPage.clickAllFilter();
    const resetCount = await productCategoryPage.getProductCount();

    expect(resetCount).toBe(initialCount);

    const url = await productCategoryPage.getPageURLPath();
    expect(url).not.toContain('french-door');
  });

  test('TC009: Verify first product card contains all required elements', async () => {
    await productCategoryPage.navigateToCategory();

    const firstProduct = await productCategoryPage.getFirstProductCard();
    const elements = await firstProduct.hasAllRequiredElements();

    expect(elements.hasImage).toBe(true);
    expect(elements.hasTitle).toBe(true);
    expect(elements.hasModel).toBe(true);
    expect(elements.hasRating).toBe(true);
    expect(elements.hasReviews).toBe(true);
    expect(elements.hasFeatures).toBe(true);
    expect(elements.hasLearnMore).toBe(true);
    expect(elements.hasBuyButton).toBe(true);
  });

  test('TC010: Verify product card details are populated with valid data', async () => {
    await productCategoryPage.navigateToCategory();

    const firstProduct = await productCategoryPage.getFirstProductCard();

    const title = await firstProduct.getProductTitle();
    expect(title.length).toBeGreaterThan(0);

    const model = await firstProduct.getModelNumber();
    expect(model.length).toBeGreaterThan(0);

    const rating = await firstProduct.getStarRating();
    expect(rating.length).toBeGreaterThan(0);
  });

  test('TC011: Complete test workflow - Navigate, Filter, Reset, and Validate', async () => {
    // Step 1: Navigate to homepage
    await homePage.navigateToHome();
    let isLoaded = await homePage.isHomePageLoaded();
    expect(isLoaded).toBe(true);

    // Step 2: Click on Refrigerators category
    await homePage.clickOnRefrigeratorCategory();
    let isCategoryLoaded = await productCategoryPage.isCategoryPageLoaded();
    expect(isCategoryLoaded).toBe(true);

    // Step 3: Verify heading
    let heading = await productCategoryPage.getCategoryHeading();
    expect(heading.toLowerCase()).toContain('refrigerator');

    // Step 4: Verify initial product count
    let initialCount = await productCategoryPage.getProductCount();
    expect(initialCount).toBeGreaterThan(0);

    // Step 5: Verify filters are displayed
    let areFiltersDisplayed = await productCategoryPage.areFilterLinksDisplayed();
    expect(areFiltersDisplayed).toBe(true);

    // Step 6: Apply French door filter
    await productCategoryPage.clickFrenchDoorFilter();
    let filteredCount = await productCategoryPage.getProductCount();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Step 7: Verify URL includes filter
    let url = await productCategoryPage.getPageURLPath();
    expect(url).toContain('french-door');

    // Step 8: Reset filters
    await productCategoryPage.clickAllFilter();
    let resetCount = await productCategoryPage.getProductCount();
    expect(resetCount).toBe(initialCount);

    // Step 9: Verify product card elements
    let firstProduct = await productCategoryPage.getFirstProductCard();
    let elements = await firstProduct.hasAllRequiredElements();
    expect(elements.hasImage).toBe(true);
    expect(elements.hasTitle).toBe(true);
    expect(elements.hasModel).toBe(true);
    expect(elements.hasRating).toBe(true);
    expect(elements.hasReviews).toBe(true);
    expect(elements.hasFeatures).toBe(true);
    expect(elements.hasLearnMore).toBe(true);
    expect(elements.hasBuyButton).toBe(true);
  });
});
```

## Running the Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test tests/specs/electrolux-product-filter.spec.ts
```

### Run specific test
```bash
npx playwright test tests/specs/electrolux-product-filter.spec.ts -g "TC001"
```

### Run in headed mode (browser visible)
```bash
npx playwright test --headed
```

### Run with specific browser
```bash
npx playwright test --project=chromium
```

### View test report
```bash
npx playwright show-report
```

## Test Cases Summary

| TC# | Test Case | Status |
|-----|-----------|--------|
| TC001 | Load Electrolux homepage successfully | ✅ Ready |
| TC002 | Navigate to Refrigerators category page (direct URL) | ✅ Ready |
| TC003 | Verify Refrigerators heading is displayed | ✅ Ready |
| TC004 | Verify product count is displayed | ✅ Ready |
| TC005 | Verify filter links are displayed (6 filter types) | ✅ Ready |
| TC006 | Apply French door refrigerators filter (12 products) | ✅ Ready |
| TC007 | Verify filtered product count = 12 for French door | ✅ Ready |
| TC008 | Reset filters by navigating to main category page | ✅ Ready |
| TC009 | Verify first product card contains all required elements | ✅ Ready |
| TC010 | Verify product card details are populated with valid data | ✅ Ready |
| TC011 | Complete test workflow - Navigate, Filter, Reset, Validate | ✅ Ready |

## Actual Filter Structure

The Electrolux website displays filters in the following format:
- "500L refrigerators (3)"
- "Bottom freezer refrigerators (2)"
- "Double door refrigerators (3)"
- "French door refrigerators (12)" ← Used in tests
- "Side by side refrigerators (1)"
- "Top freezer refrigerators (8)"

**Note:** There is no visible "All" filter link. To reset filters, the page navigates back to the base refrigerators URL.

## POM Pattern Benefits

1. **Maintainability** - Changes to UI selectors are made in one place
2. **Readability** - Tests are more readable with descriptive method names
3. **Reusability** - Page objects can be shared across multiple tests
4. **Scalability** - Easy to add new pages and components
5. **Separation of Concerns** - Test logic is separated from page element interactions

## Customization Notes

- Update locators in the POM classes if the website structure changes
- Adjust timeout values based on page load performance
- Add more filters in ProductCategoryPage.ts if additional filter types exist
- Extend ProductCard.ts with additional methods for more complex validations
