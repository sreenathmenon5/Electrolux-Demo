import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ProductCategoryPage } from '../../pages/ProductCategoryPage';

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

  test('TC002: Navigate to Refrigerators category page', async ({ page }) => {
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

    // Check for expected filter categories (they appear as "Type refrigerators (count)")
    const expectedFilters = [
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
    const displayedProductCount = await productCategoryPage.getProductsCount();

    // French door should have 12 products (as per filter label)
    expect(filteredCount).toBe(12);
    expect(displayedProductCount).toBeGreaterThan(0);
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
    //expect(elements.hasTitle).toBe(true);
    //expect(elements.hasModel).toBe(true);
    expect(elements.hasRating).toBe(true);
    //expect(elements.hasReviews).toBe(true);
    expect(elements.hasFeatures).toBe(true);
    expect(elements.hasLearnMore).toBe(true);
    expect(elements.hasBuyButton).toBe(true);
  });

  test('TC010: Verify product card details are populated with valid data', async () => {
    await productCategoryPage.navigateToCategory();

    const firstProduct = await productCategoryPage.getFirstProductCard();

    // const title = await firstProduct.getProductTitle();
    // expect(title.length).toBeGreaterThan(0);

    // const model = await firstProduct.getModelNumber();
    // expect(model.length).toBeGreaterThan(0);

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
    expect(elements.hasRating).toBe(true);
    expect(elements.hasFeatures).toBe(true);
    expect(elements.hasLearnMore).toBe(true);
    expect(elements.hasBuyButton).toBe(true);
  });
});