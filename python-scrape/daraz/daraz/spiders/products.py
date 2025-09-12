import scrapy, os, json

class ProductsSpider(scrapy.Spider):
    name = "products"
    allowed_domains = ["daraz.pk"]
    
    def start_requests(self):
        base_dir = os.path.dirname(__file__)
        filepath = os.path.join(base_dir, "urls.json")

        with open(filepath) as f:
            urls = json.load(f)
            # urls frm 5 to 10

            for url in urls[:200]:
                print(f"Scraping URL: {url}")
                yield scrapy.Request(url=url["loc"], callback=self.parse,
                                      meta={
                                          "playwright": True,
                                          "playwright_context": "new",  # creates a fresh context
                                      }
                                      )




    def parse(self, response):
        self.logger.info(f"Visited {response.url}")

        if response.status == 404 or response.status == 500 or "Page Not Found" in response.text:
            # yield to pipeline as a special “error” item
            yield {
                'url': response.url,
                'status': response.status,
                'type': 'error'
            }    

        # title
        title = response.css(".pdp-mod-product-badge-title::text").get()
        reviews = response.css(".pdp-review-summary__link::text").getall()
        number_of_reviews = reviews[0] if reviews else "0"
        number_of_questionsAnswers = reviews[1] if len(reviews) > 1 else "0"

        # price
        full_price = response.css(".pdp-price_type_deleted::text").get()
        sale_price = response.css(".pdp-price_type_normal::text").get()
        discount = response.css(".pdp-product-price__discount::text").get()
        
        brand = response.css(".pdp-product-brand__brand-link::text").get()
        is_available = response.css(".quantity-content-warning::text").get()
       
        seller_info_value = response.css(".seller-info-value::text").getall()
        positive_ratings = seller_info_value[0]
        shipping_on_time = seller_info_value[1]
        chat_response_rate = seller_info_value[2]

        # seller name and link
        seller_name = response.css(".seller-name__detail-name::text").get()
        seller_href = response.css(".seller-name__detail-name::attr(href)").get()
        
        # breadcrumbs
        breadcrumbs = response.css(".breadcrumb_item_anchor::attr(title)").getall()

        yield {
            # "specs_title":,
            "title": title,
            "reviews": number_of_reviews,
            "questionsAnswers": number_of_questionsAnswers,
            "breadcrumbs": breadcrumbs,
            "brand": brand,
            "is_available": is_available,
            "pricing":{
                "full_price": full_price,
                "sale_price": sale_price,
                "discount": discount
            },
            "seller_info": {
                "positive_ratings": positive_ratings,
                "shipping_on_time": shipping_on_time,
                "chat_response_rate": chat_response_rate
            },
            "seller_details":{
                "name": seller_name,
                "store_url": seller_href
            },
            "url": response.url,
        }


