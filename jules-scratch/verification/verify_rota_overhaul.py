from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the local index.html file
        page.goto("file:///app/index.html")

        # Log in
        page.get_by_placeholder("Email").fill("peacockillustrated@gmail.com")
        page.get_by_placeholder("Password").fill("FNB-STAFF!")
        page.get_by_role("button", name="Login with Email").click()

        # Select a location
        page.get_by_label("Select Your Location").select_option("consett")
        page.get_by_role("button", name="Confirm Location").click()

        # Click on the Rota navigation link
        rota_link = page.get_by_role("link", name="Rota")
        rota_link.click()

        # Wait for the "Weekly Rota" heading to be visible
        heading = page.get_by_role("heading", name="Weekly Rota")
        expect(heading).to_be_visible(timeout=10000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()


with sync_playwright() as playwright:
    run(playwright)
