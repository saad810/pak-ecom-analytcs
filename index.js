import zlib from 'zlib';
import fetchAndExtract from './utils/fetchAndExtract.js';

const url = new URL("https://www.daraz.pk/sitemap-product-all-311.xml.gz");

fetchAndExtract(url)
    .then("done") // first 500 chars
    .catch(err => console.error(err));
