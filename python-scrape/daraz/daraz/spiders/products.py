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
            for url in urls[:5]:
                print(f"Scraping URL: {url}")
                yield scrapy.Request(url=url["loc"], callback=self.parse,
                                      meta={
                                          "playwright": True,
                                          "playwright_context": "new",  # creates a fresh context
                                      }
                                      )




    def parse(self, response):

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

        # full price
        full_price = response.css(".pdp-price_type_deleted::text").get()
       
        # sale price
        sale_price = response.css(".pdp-price_type_normal::text").get()
       
        # discount percentage
        discount = response.css(".pdp-product-price__discount::text").get()
        # if no discount
      
        
        brand = response.css(".pdp-product-brand__brand-link::text").get()
        # rating
        is_available = response.css(".quantity-content-warning::text").get()
        seller_info_value = response.css(".seller-info-value::text").getall()

        positive_ratings = seller_info_value[0]
        shipping_on_time = seller_info_value[1]
        chat_response_rate = seller_info_value[2]

        # seller name and link
        seller_name = response.css(".seller-name__detail-name::text").get()
        seller_href = response.css(".seller-name__detail-name::attr(href)").get()
        # rating score average
        seller_rating_average = response.css("span.score-average::text").get()
        seller_rating_total = response.css(".score-max::text").get()

        specs = response.css('pdp-mod-specification')

        item = {}
        for li in specs:
            key = li.css('span.key-title::text').get().strip()
            value = li.css('div.key-value::text').get(default='').strip()
            item[key] = value

        # "What's in the box"
        box_title = response.css('div.box-content span.key-title::text').get(default='').strip()
        box_content = response.css('div.box-content div.box-content-html::text').get(default='').strip()

        item[box_title] = box_content

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
            "specs_title":response.css('.pdp-mod-section-title ').get(),
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
            "seller":{
                "name": seller_name,
                "store_url": seller_href
            },
            "seller_rating": {
                "average": seller_rating_average,
                "total": seller_rating_total,
                "details": rating_details
            },
            "specifications": item,
            "url": response.url
        }


