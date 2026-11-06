import { expect, type Page } from '@playwright/test';

// The language menu button in the top bar (app pages and static model pages alike).
export const languageButton = (page: Page) => page.locator('header').first().getByRole('button', { name: /^(Language|言語): / });

// Opens the language menu and picks a language by its own name, e.g. 'English' or '日本語'.
export async function chooseLanguage(page: Page, name: string) {
  await languageButton(page).click();
  const option = page.locator('header').first().getByRole('button', { name, exact: true });
  await expect(option).toBeVisible();
  await option.click();
}
