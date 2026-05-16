import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly baseURL = 'https://www.electrolux.in/';
  readonly refrigeratorsURL = 'https://www.electrolux.in/appliances/refrigerators/';

  // Locators
  private get pageHeading(): Locator {
    return this.page.locator('h1, h2').first();
  }

  // Methods
  async navigateToHome(): Promise<void> {
    await this.goto(this.baseURL);
    await this.page.waitForLoadState('domcontentloaded',{timeout: 60000});
  }

  async clickOnRefrigeratorCategory(): Promise<void> {
    // Navigate directly to refrigerators page
    await this.goto(this.refrigeratorsURL);
    await this.page.waitForLoadState('domcontentloaded',{timeout: 60000});
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