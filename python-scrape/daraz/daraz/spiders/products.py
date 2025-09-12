import scrapy, os, json


class ProductsSpider(scrapy.Spider):
    name = "products"
    allowed_domains = ["daraz.pk"]
    
    def start_requests(self):
        # urls = [
        #     "https://www.daraz.pk/products/hwm-85-1269s6-haier-85-10-i315906295-s3915738800.html",
        #     "https://www.daraz.pk/products/samsung-galaxy-a24-8gb128gb-i427414634-s2030038839.html",
        # ]

        # for url in urls:
        #     yield scrapy.Request(url=url, callback=self.parse, meta={"playwright": True})
        base_dir = os.path.dirname(__file__)
        filepath = os.path.join(base_dir, "urls.json")

        with open(filepath) as f:
            urls = json.load(f)
            for url in urls[:15]:
                print(f"Scraping URL: {url}")
                yield scrapy.Request(url=url["loc"], callback=self.parse, meta={"playwright": True})



    def parse(self, response):
        # title
        title = response.css(".pdp-mod-product-badge-title::text").get()
        reviews = response.css(".pdp-review-summary__link::text").getall()

        # full price
        full_price = response.css(".pdp-price_type_deleted::text").get()
        # sale price
        sale_price = response.css(".pdp-price_type_normal::text").get()
        # discount percentage
        discount = response.css(".pdp-product-price__discount::text").get()
        
        brand = response.css(".pdp-product-brand__brand-link::text").get()
        # rating
        is_available = response.css(".quantity-content-warning::text").get()
        seller_info_value = response.css(".seller-info-value::text").getall()

        # seller name and link
        seller_name = response.css(".seller-name__detail-name::text").get()
        seller_href = response.css(".seller-name__detail-name::attr(href)").get()
        # rating score average
        seller_rating_average = response.css("span.score-average::text").get()
        seller_rating_total = response.css(".score-max::text").get()

        rating_details = []
        for li in response.css('div.detail ul li'):
            stars = li.css('div.container-star img.star::attr(src)').getall()
            filled = sum(1 for s in stars if 'TB19' in s)  # 5 filled stars etc.
            count = li.css('span.percent::text').get()

            rating_details.append({
                "stars": filled,
                "count": int(count)
            })

        # breadcrumbs
        # breadcrumbs = response.css("ul.breadcrumb li.breadcrumb_item a.breadcrumb_item_anchor::text").getall()
        breadcrumbs = response.css(".breadcrumb_item_anchor::attr(title)").getall()

        yield {
            "title": title,
            "reviews": reviews,
            "full_price": full_price,
            "sale_price": sale_price,
            "discount": discount,
            "breadcrumbs": breadcrumbs,
            "brand": brand,
            "is_available": is_available,
            "seller_info": seller_info_value,
            "seller":{
                "name": seller_name,
                "store_url": seller_href
            },
            "seller_rating": {
                "average": seller_rating_average,
                "total": seller_rating_total,
                "details": rating_details
            },
            "url": response.url
        }


