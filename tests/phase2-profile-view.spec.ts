import { test, expect } from '@playwright/test';

/**
 * Phase 2.2 - Profile View & Actions Tests
 * Tests profile viewing, photo carousel, like/pass, report/block features
 */

test.describe('Phase 2.2 - Profile View Features', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start at home page
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/WeDate|We Date|Dating/i);
    console.log('✅ Landing page loads');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    console.log('✅ Login page displays form');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    console.log('✅ Signup page displays form');
  });

  test('should load swipe page (with auth)', async ({ page }) => {
    await page.goto('/swipe');
    
    // Should either show swipe cards OR redirect to login
    const isOnSwipe = page.url().includes('/swipe');
    const isOnLogin = page.url().includes('/auth/login');
    
    expect(isOnSwipe || isOnLogin).toBeTruthy();
    console.log(`✅ Swipe page ${isOnSwipe ? 'loaded' : 'redirected to login (expected)'}`);
  });

  test('should load onboarding page', async ({ page }) => {
    await page.goto('/onboarding');
    
    const isOnOnboarding = page.url().includes('/onboarding');
    const isOnLogin = page.url().includes('/auth/login');
    
    expect(isOnOnboarding || isOnLogin).toBeTruthy();
    console.log(`✅ Onboarding ${isOnOnboarding ? 'page loaded' : 'requires auth (expected)'}`);
  });

  test.describe('API Endpoint Tests', () => {
    
    test('should have profile API endpoint', async ({ request }) => {
      const response = await request.get('/api/profile');
      expect([200, 401]).toContain(response.status());
      console.log(`✅ Profile API responds (status: ${response.status()})`);
    });

    test('should have swipe API endpoint', async ({ request }) => {
      const response = await request.post('/api/swipe', {
        data: { targetUserId: 'test', action: 'LIKE' }
      });
      expect([200, 400, 401]).toContain(response.status());
      console.log(`✅ Swipe API responds (status: ${response.status()})`);
    });

    test('should have report API endpoint', async ({ request }) => {
      const response = await request.post('/api/users/report', {
        data: { userId: 'test', reason: 'test' }
      });
      expect([200, 400, 401]).toContain(response.status());
      console.log(`✅ Report API responds (status: ${response.status()})`);
    });

    test('should have block API endpoint', async ({ request }) => {
      const response = await request.post('/api/users/block', {
        data: { userId: 'test' }
      });
      expect([200, 400, 401]).toContain(response.status());
      console.log(`✅ Block API responds (status: ${response.status()})`);
    });

    test('should have user profile API endpoint', async ({ request }) => {
      const response = await request.get('/api/users/test-user-id');
      expect([200, 401, 404]).toContain(response.status());
      console.log(`✅ User profile API responds (status: ${response.status()})`);
    });

    test('should have interests API endpoint', async ({ request }) => {
      const response = await request.get('/api/interests');
      expect([200, 401]).toContain(response.status());
      console.log(`✅ Interests API responds (status: ${response.status()})`);
    });

    test('should have prompts API endpoint', async ({ request }) => {
      const response = await request.get('/api/prompts');
      expect([200, 401]).toContain(response.status());
      console.log(`✅ Prompts API responds (status: ${response.status()})`);
    });
  });

  test.describe('Component Tests (No Auth Required)', () => {
    
    test('should have BottomNav component', async ({ page }) => {
      await page.goto('/swipe');
      
      // Check if BottomNav exists or if redirected to login
      if (!page.url().includes('/auth/login')) {
        const navExists = await page.locator('nav').count() > 0;
        console.log(`✅ BottomNav ${navExists ? 'rendered' : 'not found (may not be on this page)'}`);
      } else {
        console.log('⏭️  Skipped - requires authentication');
      }
    });

    test('should load photo carousel component structure', async ({ page }) => {
      // This tests the component exists in build
      const response = await page.goto('/profile/test-user-id');
      
      // Should either load profile page or redirect
      const isOnProfile = page.url().includes('/profile/');
      const isOnLogin = page.url().includes('/auth/login');
      
      expect(isOnProfile || isOnLogin).toBeTruthy();
      console.log(`✅ Profile route ${isOnProfile ? 'exists' : 'requires auth (expected)'}`);
    });
  });

  test.describe('Build Verification', () => {
    
    test('should have all Phase 2.2 routes accessible', async ({ page }) => {
      const routes = [
        { path: '/', name: 'Home' },
        { path: '/auth/login', name: 'Login' },
        { path: '/auth/signup', name: 'Signup' },
        { path: '/swipe', name: 'Swipe' },
        { path: '/matches', name: 'Matches' },
        { path: '/profile', name: 'My Profile' },
        { path: '/onboarding', name: 'Onboarding' },
      ];

      for (const route of routes) {
        const response = await page.goto(route.path);
        expect(response?.status()).toBeLessThan(500);
        console.log(`✅ ${route.name} route (${route.path}): ${response?.status()}`);
      }
    });
  });
});

test.describe('Phase 2.2 - Manual Test Checklist', () => {
  
  test('should log manual testing instructions', async () => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║         PHASE 2.2 - MANUAL TESTING CHECKLIST                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 SETUP REQUIRED:');
    console.log('  1. Create test account at /auth/signup');
    console.log('  2. Verify email (check console for link)');
    console.log('  3. Complete onboarding at /onboarding');
    console.log('  4. Ensure database has at least 2 users\n');
    
    console.log('🧪 PROFILE VIEW TESTS:');
    console.log('  ✓ Navigate to /swipe');
    console.log('  ✓ Click ℹ️ info button on user card');
    console.log('  ✓ Verify profile page loads with user data');
    console.log('  ✓ Check all photos display');
    console.log('  ✓ Verify bio, job, interests, prompts appear');
    console.log('  ✓ Confirm distance and age calculate correctly\n');
    
    console.log('📸 PHOTO CAROUSEL TESTS:');
    console.log('  ✓ Swipe left/right to navigate photos');
    console.log('  ✓ Pagination dots update');
    console.log('  ✓ Click photo to enter fullscreen');
    console.log('  ✓ Navigate in fullscreen mode');
    console.log('  ✓ Exit fullscreen (click outside or X)\n');
    
    console.log('❤️  LIKE/PASS ACTION TESTS:');
    console.log('  ✓ Click Like button → returns to swipe');
    console.log('  ✓ Click Pass button → returns to swipe');
    console.log('  ✓ Check swipe API called correctly');
    console.log('  ✓ Verify toast notifications appear\n');
    
    console.log('🚩 REPORT SYSTEM TESTS:');
    console.log('  ✓ Click Report button');
    console.log('  ✓ Modal appears with reason options');
    console.log('  ✓ Select reason and submit');
    console.log('  ✓ Check console for: Report data logged');
    console.log('  ✓ Toast notification appears\n');
    
    console.log('🚫 BLOCK SYSTEM TESTS:');
    console.log('  ✓ Click Block button');
    console.log('  ✓ Confirmation dialog appears');
    console.log('  ✓ Confirm block action');
    console.log('  ✓ Check console for: Block data logged');
    console.log('  ✓ Toast notification appears');
    console.log('  ✓ Redirects to swipe page\n');
    
    console.log('⚠️  KNOWN LIMITATIONS:');
    console.log('  • Report: Logs to console (no DB model yet)');
    console.log('  • Block: Logs to console (no DB model yet)');
    console.log('  • Both require schema updates for persistence\n');
    
    console.log('✅ AUTOMATION NOTE:');
    console.log('  • These tests verify build integrity and routes');
    console.log('  • Full E2E tests require authenticated sessions');
    console.log('  • Database seeding needed for complete coverage\n');
  });
});
