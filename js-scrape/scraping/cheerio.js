import * as cheerio from 'cheerio';



export default async function getProductData(html) {
    // const $ = cheerio.load(html);
    console.log("In getProductData");
    // console.log($('.breadcrumb_list'));
    const product = {};




    return product;
}

export function bodyOnly(html) {
    const $ = cheerio.load(html);
    $("script, style").remove();
    const body = $('body').html();
    if (body) {
        return body;
    }

    return null;
}