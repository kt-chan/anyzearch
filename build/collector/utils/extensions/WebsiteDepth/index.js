const { v4 } = require("uuid");
const {
  PuppeteerWebBaseLoader,
} = require("langchain/document_loaders/web/puppeteer");
const { default: slugify } = require("slugify");
const { parse } = require("node-html-parser");
const { writeToSourceDocuments, writeToServerDocuments } = require("../../files");
const { tokenizeString } = require("../../tokenizer");
const path = require("path");
const fs = require("fs");

async function discoverLinks(startUrl, depth = 1, maxLinks = 20) {
  const baseUrl = new URL(startUrl);
  const discoveredLinks = new Set();
  const pendingLinks = [startUrl];
  let currentLevel = 0;
  depth = depth < 1 ? 1 : depth;
  maxLinks = maxLinks < 1 ? 1 : maxLinks;

  // Check depth and if there are any links left to scrape
  while (currentLevel < depth && pendingLinks.length > 0) {
    const newLinks = await getPageLinks(pendingLinks[0], baseUrl);
    pendingLinks.shift();

    for (const link of newLinks) {
      if (!discoveredLinks.has(link)) {
        discoveredLinks.add(link);
        pendingLinks.push(link);
      }

      // Exit out if we reach maxLinks
      if (discoveredLinks.size >= maxLinks) {
        return Array.from(discoveredLinks).slice(0, maxLinks);
      }
    }

    if (pendingLinks.length === 0) {
      currentLevel++;
    }
  }
  console.log(`discoveredLinks = ${discoveredLinks.size}`)
  return Array.from(discoveredLinks);
}

async function getPageLinks(url, baseUrl) {
  try {
    let loader;
    let http_proxy = process.env.HTTP_PROXY || process.env.http_proxy;

    if (!!http_proxy) {
      console.log('@Debug PuppeteerWebBaseLoader:getPageLinks .... 1 / HTTP_PROXY: ' + http_proxy);
      loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: { headless: "new", args: [`--proxy-server=https=${http_proxy}`, '--no-sandbox'], ignoreHTTPSErrors: true },
        gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
        async evaluate(page, browser) {
          const result = await page.evaluate(() => document.documentElement.outerHTML);
          await browser.close();
          return result;
        },
      });
    }
    else {
      console.log('@Debug PuppeteerWebBaseLoader:getPageLinks .... 2 / NO_PROXY');
      loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: { headless: "new" },
        gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
        async evaluate(page, browser) {
          const result = await page.evaluate(() => document.documentElement.outerHTML);
          await browser.close();
          return result;
        },
      });
    }
    const docs = await loader.load();
    const html = docs[0].pageContent;
    const links = extractLinks(html, baseUrl);
    return links;
  } catch (error) {
    console.error(`Failed to get page links from ${url}.`, error);
    return [];
  }
}

function extractLinks(html, baseUrl) {
  //console.log(`@DEBUG PuppeteerWebBaseLoader:extractLinks html: ${html}`);
  const root = parse(html);
  const links = root.querySelectorAll("a");
  const extractedLinks = new Set();
  for (const link of links) {
    const href = link.getAttribute("href");
    if (href) {
      const absoluteUrl = new URL(href, baseUrl.href).href;
      let baselink = baseUrl.origin + baseUrl.pathname.split("/").slice(0, -1).join("/");
      let basehost = new URL(baselink).hostname.replace("www.", "");
      if (absoluteUrl.match(basehost)) {
        extractedLinks.add(absoluteUrl);
      }
    }
  }

  return Array.from(extractedLinks);
}

async function bulkScrapePages(links, outFolderPath) {
  const scrapedData = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`Scraping ${i + 1}/${links.length}: ${link}`);
    let loader;

    try {
      let http_proxy = process.env.HTTP_PROXY || process.env.http_proxy;

      if (!!http_proxy) {
        console.log('@Debug PuppeteerWebBaseLoader:bulkScrapePages .... 1 / HTTP_PROXY: ' + http_proxy);
        loader = new PuppeteerWebBaseLoader(link, {
          launchOptions: { headless: "new", args: [`--proxy-server=https=${http_proxy}`, '--no-sandbox'], ignoreHTTPSErrors: true },
          gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
          async evaluate(page, browser) {
            const result = await page.evaluate(() => document.body.innerText);
            await browser.close();
            return result;
          },
        })
      }
      else {
        console.log('@Debug PuppeteerWebBaseLoader:bulkScrapePages .... 2 / NO_PROXY');
        loader = new PuppeteerWebBaseLoader(link, {
          launchOptions: { headless: "new" },
          gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
          async evaluate(page, browser) {
            const result = await page.evaluate(() => {
              return JSON.stringify({
                text: document.body.innerText,
                html: document.body.innerHTML,
              });
            });
            await browser.close();
            return result;
          },
        });
      }

      const docs = await loader.load();
      const content = JSON.parse(docs[0].pageContent);
      const textContent = content.text;
      const htmlContent = content.html;

      if (!docs.length) {
        console.warn(`Empty content for ${link}. Skipping.`);
        continue;
      }

      const url = new URL(link);
      const filename = (url.host + "-" + url.pathname).replace(".", "_");

      const data = {
        id: v4(),
        url: "link://" + slugify(filename) + ".html",
        title: slugify(filename) + ".html",
        docAuthor: "no author found",
        description: "No description found.",
        docSource: "URL link uploaded by the user.",
        chunkSource: `link://${link}`,
        published: new Date().toLocaleString(),
        wordCount: textContent.split(" ").length,
        pageContent: textContent,
        htmlContent: htmlContent,
        token_count_estimate: tokenizeString(textContent).length,
      };

      // @DEBUG @ktchan @webScraper
      let document = writeToSourceDocuments(data, data.title, null, outFolderPath);
      document = writeToServerDocuments(document, document.title, ".json", outFolderPath);
      scrapedData.push(document);
      console.log(`Successfully scraped ${link}.`);
    } catch (error) {
      console.error(`Failed to scrape ${link}.`, error);
    }
  }

  return scrapedData;
}

async function websiteScraper(startUrl, depth = 1, maxLinks = 20) {
  const websiteName = new URL(startUrl).hostname;
  const outFolder = slugify(
    `${slugify(websiteName)}-${v4().slice(0, 4)}`
  ).toLowerCase();

  console.log("Discovering links...");
  const linksToScrape = await discoverLinks(startUrl, depth, maxLinks);
  console.log(`Found ${linksToScrape.length} links to scrape.`);

  console.log("Starting bulk scraping...");
  const scrapedData = await bulkScrapePages(linksToScrape, outFolder);
  console.log(`Scraped ${scrapedData.length} pages.`);

  return scrapedData;
}

module.exports = websiteScraper;
