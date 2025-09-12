import chalk from "chalk";
import puppeteer from "puppeteer";

// Launch browser once
const browser = await puppeteer.launch({ headless: true });

export async function getProductDatawithPuppeteer(url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for breadcrumb container & product container
    await page.waitForSelector("#J_breadcrumb_list");
    await page.waitForSelector("#container");
    await page.waitForSelector("#module_product_brand_1");
    await page.waitForSelector(".pdp-mod-product-price");
    await page.waitForSelector("#module_product_detail");
    await page.waitForSelector("#module_product_review");

    // Extract product data inside the page context
    const productData = await page.evaluate(() => {
        // --------------------
        // Breadcrumb categories
        // --------------------
        const el = document.querySelector("#J_breadcrumb_list");
        let categories = [];
        if (el) {
            const anchors = el.querySelectorAll("a");
            categories = Array.from(anchors).map(a => ({
                href: a.href,
                text: a.textContent.trim(),
            }));
        }

        // --------------------
        // Product title
        // --------------------
        const productElement = document.querySelector("#container");
        const productTitleEl = productElement?.querySelector(
            ".pdp-mod-product-badge-title"
        );
        const productTitle = productTitleEl
            ? productTitleEl.textContent.trim()
            : null;

        // --------------------
        // Ratings & Questions
        // --------------------
        const ratingsElement = productElement?.querySelector(
            ".pdp-review-summary"
        );
        let ratings = null;
        let questionsAsked = null;

        if (ratingsElement) {
            const ratingAnchors = Array.from(ratingsElement.querySelectorAll("a"));

            if (ratingAnchors.length >= 2) {
                ratings = ratingAnchors[0].textContent.trim();
                questionsAsked = ratingAnchors[1].textContent.trim();

            }
        }

        // brand info

        const brandElement = document.querySelector(".pdp-product-brand");
        let brand = null;
        if (brandElement) {
            const brandAnchor = brandElement.querySelector("a");
            if (brandAnchor) {
                brand = brandAnchor.textContent.trim();
            }
        }

        // pricing

        const priceElement = productElement?.querySelector(".pdp-product-price");
        const salePrice = priceElement.querySelector(".pdp-price_type_normal");
        const fullPrice = priceElement.querySelector(".pdp-price_type_deleted");
        const discountPercentage = priceElement.querySelector(".pdp-product-price__discount");

        const pricing = {
            salePrice: salePrice ? salePrice.textContent.trim() : null,
            fullPrice: fullPrice ? fullPrice.textContent.trim() : null,
            discountPercentage: discountPercentage ? discountPercentage.textContent.trim() : null,
        };

        // description

        


        // reviews

        const reviewEl = document.querySelector("#module_product_review");
       

        return {
            pricing,
            breadcrumbLinks: categories,
            productTitle,
            ratings,
            questionsAsked,
            brand,
        //    scoreSpans
        };
    });

    await page.close();
    return productData;
}

// Example usage:
// const data = await getProductDatawithPuppeteer("https://www.daraz.pk/some-product-url");
// console.log(data);
