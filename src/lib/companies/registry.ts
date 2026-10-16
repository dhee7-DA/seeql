// Company Interview Universe — the registry. 8 domains × 26 companies =
// the 208-company matrix (40 flagship + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10 + 24 wave-11).
// Kit authoring lands in waves; a company without an authored kit yet shows
// as "kit in build". Company picks follow interview-report frequency
// (community-sourced tags on the SQL band) + domain diversity, not personal
// endorsement.

import type { CompanyDomain, CompanyKit } from "./types";
import { amazonKit } from "./kits/amazon";
import { flipkartKit } from "./kits/flipkart";
import { alibabaKit } from "./kits/alibaba";
import { shopifyKit } from "./kits/shopify";
import { ebayKit } from "./kits/ebay";
import { uberKit } from "./kits/uber";
import { lyftKit } from "./kits/lyft";
import { olaKit } from "./kits/ola";
import { boltKit } from "./kits/bolt";
import { grabKit } from "./kits/grab";
import { netflixKit } from "./kits/netflix";
import { spotifyKit } from "./kits/spotify";
import { youtubeKit } from "./kits/youtube";
import { metaKit } from "./kits/meta";
import { tiktokKit } from "./kits/tiktok";
import { stripeKit } from "./kits/stripe";
import { paypalKit } from "./kits/paypal";
import { visaKit } from "./kits/visa";
import { revolutKit } from "./kits/revolut";
import { blockKit } from "./kits/block";
import { doordashKit } from "./kits/doordash";
import { swiggyKit } from "./kits/swiggy";
import { zomatoKit } from "./kits/zomato";
import { instacartKit } from "./kits/instacart";
import { deliverooKit } from "./kits/deliveroo";
import { airbnbKit } from "./kits/airbnb";
import { bookingKit } from "./kits/booking";
import { expediaKit } from "./kits/expedia";
import { oyoKit } from "./kits/oyo";
import { makemytripKit } from "./kits/makemytrip";
import { goldmanKit } from "./kits/goldman";
import { jpmorganKit } from "./kits/jpmorgan";
import { capitaloneKit } from "./kits/capitalone";
import { wellsfargoKit } from "./kits/wellsfargo";
import { hsbcKit } from "./kits/hsbc";
import { salesforceKit } from "./kits/salesforce";
import { slackKit } from "./kits/slack";
import { zoomKit } from "./kits/zoom";
import { atlassianKit } from "./kits/atlassian";
import { snowflakeKit } from "./kits/snowflake";
import { walmartKit } from "./kits/walmart";
import { etsyKit } from "./kits/etsy";
import { myntraKit } from "./kits/myntra";
import { didiKit } from "./kits/didi";
import { careemKit } from "./kits/careem";
import { limeKit } from "./kits/lime";
import { redditKit } from "./kits/reddit";
import { pinterestKit } from "./kits/pinterest";
import { linkedinKit } from "./kits/linkedin";
import { adyenKit } from "./kits/adyen";
import { wiseKit } from "./kits/wise";
import { robinhoodKit } from "./kits/robinhood";
import { grubhubKit } from "./kits/grubhub";
import { justeatKit } from "./kits/justeat";
import { dominosKit } from "./kits/dominos";
import { agodaKit } from "./kits/agoda";
import { marriottKit } from "./kits/marriott";
import { ryanairKit } from "./kits/ryanair";
import { amexKit } from "./kits/amex";
import { citiKit } from "./kits/citi";
import { barclaysKit } from "./kits/barclays";
import { hubspotKit } from "./kits/hubspot";
import { datadogKit } from "./kits/datadog";
import { twilioKit } from "./kits/twilio";
import { targetKit } from "./kits/target";
import { wayfairKit } from "./kits/wayfair";
import { temuKit } from "./kits/temu";
import { gettKit } from "./kits/gett";
import { freenowKit } from "./kits/freenow";
import { viaKit } from "./kits/via";
import { twitchKit } from "./kits/twitch";
import { snapchatKit } from "./kits/snapchat";
import { twitterKit } from "./kits/twitter";
import { klarnaKit } from "./kits/klarna";
import { coinbaseKit } from "./kits/coinbase";
import { plaidKit } from "./kits/plaid";
import { starbucksKit } from "./kits/starbucks";
import { mcdonaldsKit } from "./kits/mcdonalds";
import { hellofreshKit } from "./kits/hellofresh";
import { pricelineKit } from "./kits/priceline";
import { trivagoKit } from "./kits/trivago";
import { southwestKit } from "./kits/southwest";
import { bofaKit } from "./kits/bofa";
import { morganstanleyKit } from "./kits/morganstanley";
import { santanderKit } from "./kits/santander";
import { servicenowKit } from "./kits/servicenow";
import { notionKit } from "./kits/notion";
import { mongodbKit } from "./kits/mongodb";
import { zalandoKit } from "./kits/zalando";
import { chewyKit } from "./kits/chewy";
import { sephoraKit } from "./kits/sephora";
import { indriveKit } from "./kits/indrive";
import { blablacarKit } from "./kits/blablacar";
import { yassirKit } from "./kits/yassir";
import { discordKit } from "./kits/discord";
import { bumbleKit } from "./kits/bumble";
import { duolingoKit } from "./kits/duolingo";
import { nubankKit } from "./kits/nubank";
import { chimeKit } from "./kits/chime";
import { rampKit } from "./kits/ramp";
import { woltKit } from "./kits/wolt";
import { blinkitKit } from "./kits/blinkit";
import { zeptoKit } from "./kits/zepto";
import { tripcomKit } from "./kits/tripcom";
import { hiltonKit } from "./kits/hilton";
import { trainlineKit } from "./kits/trainline";
import { ubsKit } from "./kits/ubs";
import { ingKit } from "./kits/ing";
import { iciciKit } from "./kits/icici";
import { dropboxKit } from "./kits/dropbox";
import { zendeskKit } from "./kits/zendesk";
import { canvaKit } from "./kits/canva";
import { asanaKit } from "./kits/asana";
import { figmaKit } from "./kits/figma";
import { gitlabKit } from "./kits/gitlab";
// Wave-9 additions — 3 more per domain, all 8 domains extended to 20 companies.
import { coupangKit } from "./kits/coupang";
import { noonKit } from "./kits/noon";
import { asosKit } from "./kits/asos";
import { cabifyKit } from "./kits/cabify";
import { yangoKit } from "./kits/yango";
import { hertzKit } from "./kits/hertz";
import { stravaKit } from "./kits/strava";
import { whatsappKit } from "./kits/whatsapp";
import { mediumKit } from "./kits/medium";
import { sofiKit } from "./kits/sofi";
import { marqetaKit } from "./kits/marqeta";
import { remitlyKit } from "./kits/remitly";
import { tescoKit } from "./kits/tesco";
import { krogerKit } from "./kits/kroger";
import { kfcKit } from "./kits/kfc";
import { deltaKit } from "./kits/delta";
import { accorKit } from "./kits/accor";
import { amtrakKit } from "./kits/amtrak";
import { hdfcKit } from "./kits/hdfc";
import { lloydsKit } from "./kits/lloyds";
import { mufgKit } from "./kits/mufg";
import { databricksKit } from "./kits/databricks";
import { airtableKit } from "./kits/airtable";
import { miroKit } from "./kits/miro";
import { costcoKit } from "./kits/costco";
import { rakutenKit } from "./kits/rakuten";
import { mercadolibreKit } from "./kits/mercadolibre";
import { gojekKit } from "./kits/gojek";
import { turoKit } from "./kits/turo";
import { zipcarKit } from "./kits/zipcar";
import { quoraKit } from "./kits/quora";
import { telegramKit } from "./kits/telegram";
import { substackKit } from "./kits/substack";
import { monzoKit } from "./kits/monzo";
import { affirmKit } from "./kits/affirm";
import { n26Kit } from "./kits/n26";
import { gopuffKit } from "./kits/gopuff";
import { chipotleKit } from "./kits/chipotle";
import { subwayKit } from "./kits/subway";
import { hyattKit } from "./kits/hyatt";
import { emiratesKit } from "./kits/emirates";
import { getyourguideKit } from "./kits/getyourguide";
import { deutscheKit } from "./kits/deutsche";
import { bnpparibasKit } from "./kits/bnpparibas";
import { standardcharteredKit } from "./kits/standardchartered";
// wave-10 (24 kits, 8 domains × 3)
import { sheinKit } from "./kits/shein";
import { mercariKit } from "./kits/mercari";
import { neweggKit } from "./kits/newegg";
import { sixtKit } from "./kits/sixt";
import { voiKit } from "./kits/voi";
import { beatKit } from "./kits/beat";
import { tumblrKit } from "./kits/tumblr";
import { vimeoKit } from "./kits/vimeo";
import { audibleKit } from "./kits/audible";
import { tinkKit } from "./kits/tink";
import { fireblocksKit } from "./kits/fireblocks";
import { brexKit } from "./kits/brex";
import { blueapronKit } from "./kits/blueapron";
import { waitroseKit } from "./kits/waitrose";
import { dunkinKit } from "./kits/dunkin";
import { radissonKit } from "./kits/radisson";
import { vuelingKit } from "./kits/vueling";
import { flixKit } from "./kits/flix";
import { rabobankKit } from "./kits/rabobank";
import { bmoKit } from "./kits/bmo";
import { natwestKit } from "./kits/natwest";
import { linearKit } from "./kits/linear";
import { gongKit } from "./kits/gong";
import { retoolKit } from "./kits/retool";
// wave-11 (24 kits, 8 domains x 3)
import {bestbuyKit} from "./kits/bestbuy";
import {ikeaKit} from "./kits/ikea";
import {zaraKit} from "./kits/zara";
import {avisKit} from "./kits/avis";
import {enterpriseKit} from "./kits/enterprise";
import {getaroundKit} from "./kits/getaround";
import {soundcloudKit} from "./kits/soundcloud";
import {threadsKit} from "./kits/threads";
import {goodreadsKit} from "./kits/goodreads";
import {afterpayKit} from "./kits/afterpay";
import {paytmKit} from "./kits/paytm";
import {venmoKit} from "./kits/venmo";
import {burgerkingKit} from "./kits/burgerking";
import {chickfilaKit} from "./kits/chickfila";
import {aldiKit} from "./kits/aldi";
import {skyscannerKit} from "./kits/skyscanner";
import {easyjetKit} from "./kits/easyjet";
import {ihgKit} from "./kits/ihg";
import {sbiKit} from "./kits/sbi";
import {axisbankKit} from "./kits/axisbank";
import {usbankKit} from "./kits/usbank";
import {intercomKit} from "./kits/intercom";
import {segmentKit} from "./kits/segment";
import {mailchimpKit} from "./kits/mailchimp";

/** Display meta for one company slot in the matrix (kit may come later). */
export interface CompanyMeta {
  id: string;
  name: string;
  tagline: string;
}

export const COMPANY_DOMAINS: CompanyDomain[] = [
  {
    id: "ecom",
    name: "E-commerce & Marketplace",
    blurb:
      "Catalogs, carts, fulfillment and returns at hundred-million-order scale — the richest SQL interview territory there is.",
    companies: ["amazon", "flipkart", "alibaba", "shopify", "ebay", "walmart", "etsy", "myntra", "target", "wayfair", "temu", "zalando", "chewy", "sephora", "costco", "rakuten", "mercadolibre", "coupang", "noon", "asos", "shein", "mercari", "newegg", "bestbuy", "ikea", "zara"],
  },
  {
    id: "mobility",
    name: "Ride-hailing & Mobility",
    blurb:
      "Trips, drivers, surge windows and ETA math — two-sided marketplaces where every row has a timestamp and a geography.",
    companies: ["uber", "lyft", "ola", "bolt", "grab", "didi", "careem", "lime", "gett", "freenow", "via", "indrive", "blablacar", "yassir", "gojek", "turo", "zipcar", "cabify", "yango", "hertz", "sixt", "voi", "beat", "avis", "enterprise", "getaround"],
  },
  {
    id: "media",
    name: "Streaming & Social",
    blurb:
      "Watch time, feeds, engagement streaks and content funnels — the home of session-level window-function questions.",
    companies: ["netflix", "spotify", "youtube", "meta", "tiktok", "reddit", "pinterest", "linkedin", "twitch", "snapchat", "twitter", "discord", "bumble", "duolingo", "quora", "telegram", "substack", "strava", "whatsapp", "medium", "tumblr", "vimeo", "audible", "soundcloud", "threads", "goodreads"],
  },
  {
    id: "fintech",
    name: "Fintech & Payments",
    blurb:
      "Ledgers, authorizations, settlement and fraud — money movement where correctness outranks cleverness.",
    companies: ["stripe", "paypal", "visa", "revolut", "block", "adyen", "wise", "robinhood", "klarna", "coinbase", "plaid", "nubank", "chime", "ramp", "monzo", "affirm", "n26", "sofi", "marqeta", "remitly", "tink", "fireblocks", "brex", "afterpay", "paytm", "venmo"],
  },
  {
    id: "food",
    name: "Food & Quick-commerce",
    blurb:
      "Orders, couriers, delivery SLAs and dark stores — sub-30-minute logistics squeezed through GROUP BY.",
    companies: ["doordash", "swiggy", "zomato", "instacart", "deliveroo", "grubhub", "justeat", "dominos", "starbucks", "mcdonalds", "hellofresh", "wolt", "blinkit", "zepto", "gopuff", "chipotle", "subway", "tesco", "kroger", "kfc", "blueapron", "waitrose", "dunkin", "burgerking", "chickfila", "aldi"],
  },
  {
    id: "travel",
    name: "Travel & Hospitality",
    blurb:
      "Searches, bookings, cancellations and seasonal occupancy — long funnels with heavy drop-off between steps.",
    companies: ["airbnb", "booking", "expedia", "oyo", "makemytrip", "agoda", "marriott", "ryanair", "priceline", "trivago", "southwest", "tripcom", "hilton", "trainline", "hyatt", "emirates", "getyourguide", "delta", "accor", "amtrak", "radisson", "vueling", "flix", "skyscanner", "easyjet", "ihg"],
  },
  {
    id: "banking",
    name: "Banking & Capital Markets",
    blurb:
      "Accounts, balances, transactions and regulatory counts — the traditional finance screen, precise and unforgiving.",
    companies: ["goldman", "jpmorgan", "capitalone", "wellsfargo", "hsbc", "amex", "citi", "barclays", "bofa", "morganstanley", "santander", "ubs", "ing", "icici", "deutsche", "bnpparibas", "standardchartered", "hdfc", "lloyds", "mufg", "rabobank", "bmo", "natwest", "sbi", "axisbank", "usbank"],
  },
  {
    id: "saas",
    name: "SaaS & Enterprise",
    blurb:
      "Subscriptions, retention cohorts, churn and ARR movements — recurring revenue measured in windows.",
    companies: ["salesforce", "slack", "zoom", "atlassian", "snowflake", "hubspot", "datadog", "twilio", "servicenow", "notion", "mongodb", "dropbox", "zendesk", "canva", "asana", "figma", "gitlab", "databricks", "airtable", "miro", "linear", "gong", "retool", "intercom", "segment", "mailchimp"],
  },
];

/** Every company slot, resolved for display (order matters — same as domain arrays). */
export const COMPANY_META: Record<string, CompanyMeta> = {
  amazon: { id: "amazon", name: "Amazon", tagline: "The catalog, the cart, the fulfillment network" },
  flipkart: { id: "flipkart", name: "Flipkart", tagline: "India's marketplace: Big Billion Days at scale" },
  alibaba: { id: "alibaba", name: "Alibaba", tagline: "Singles' Day volumes, Taobao to Tmall" },
  shopify: { id: "shopify", name: "Shopify", tagline: "Merchant analytics for millions of stores" },
  ebay: { id: "ebay", name: "eBay", tagline: "Auctions, listings and buyer-seller trust" },

  uber: { id: "uber", name: "Uber", tagline: "Trips, drivers and the surge clock" },
  lyft: { id: "lyft", name: "Lyft", tagline: "Rideshare economics, ride by ride" },
  ola: { id: "ola", name: "Ola", tagline: "Mobility across India's cities" },
  bolt: { id: "bolt", name: "Bolt", tagline: "European super-app: rides, food, scooters" },
  grab: { id: "grab", name: "Grab", tagline: "Southeast Asia's everyday super-app" },

  netflix: { id: "netflix", name: "Netflix", tagline: "Play events, binge sessions, retention" },
  spotify: { id: "spotify", name: "Spotify", tagline: "Streams, playlists and listening streaks" },
  youtube: { id: "youtube", name: "YouTube", tagline: "Watch time, creators and the recommendation funnel" },
  meta: { id: "meta", name: "Meta", tagline: "Feed engagement, friends graphs, ads delivery" },
  tiktok: { id: "tiktok", name: "TikTok", tagline: "The For You funnel, session by session" },

  stripe: { id: "stripe", name: "Stripe", tagline: "Payments infrastructure, charge by charge" },
  paypal: { id: "paypal", name: "PayPal", tagline: "Two-sided wallets at global scale" },
  visa: { id: "visa", name: "Visa", tagline: "Authorization networks, billions per day" },
  revolut: { id: "revolut", name: "Revolut", tagline: "Neobanking: accounts, cards, crypto" },
  block: { id: "block", name: "Block (Square)", tagline: "Seller tooling and consumer payments" },

  doordash: { id: "doordash", name: "DoorDash", tagline: "Dashers, deliveries and the 30-minute promise" },
  swiggy: { id: "swiggy", name: "Swiggy", tagline: "Food delivery and Instamart quick-commerce" },
  zomato: { id: "zomato", name: "Zomato", tagline: "Restaurant discovery to hyperlocal delivery" },
  instacart: { id: "instacart", name: "Instacart", tagline: "Grocery batches and shopper gig math" },
  deliveroo: { id: "deliveroo", name: "Deliveroo", tagline: "UK/EU delivery, rider shifts and SLAs" },

  airbnb: { id: "airbnb", name: "Airbnb", tagline: "Searches to stays: the long booking funnel" },
  booking: { id: "booking", name: "Booking.com", tagline: "Reservations, occupancy and cancellations" },
  expedia: { id: "expedia", name: "Expedia", tagline: "Packages, flights and hotel demand curves" },
  oyo: { id: "oyo", name: "OYO", tagline: "Standardized budget hotels at network scale" },
  makemytrip: { id: "makemytrip", name: "MakeMyTrip", tagline: "India's travel portal: flights to hotels" },

  goldman: { id: "goldman", name: "Goldman Sachs", tagline: "Markets data, risk counts, the marquee screen" },
  jpmorgan: { id: "jpmorgan", name: "JPMorgan Chase", tagline: "Consumer banking meets institutional scale" },
  capitalone: { id: "capitalone", name: "Capital One", tagline: "The tech-forward bank: data-first interviews" },
  wellsfargo: { id: "wellsfargo", name: "Wells Fargo", tagline: "Retail banking, accounts and audits" },
  hsbc: { id: "hsbc", name: "HSBC", tagline: "Global banking, cross-border flows" },

  salesforce: { id: "salesforce", name: "Salesforce", tagline: "CRM pipelines and pipeline SQL" },
  slack: { id: "slack", name: "Slack", tagline: "Workplace activity and retention telemetry" },
  zoom: { id: "zoom", name: "Zoom", tagline: "Meetings, minutes and usage cohorts" },
  atlassian: { id: "atlassian", name: "Atlassian", tagline: "Dev-tool adoption across Jira and Confluence" },
  snowflake: { id: "snowflake", name: "Snowflake", tagline: "The warehouse itself: usage and credit burn" },

  // Wave-5 additions — 3 new slots per domain (64-company matrix).
  walmart: { id: "walmart", name: "Walmart", tagline: "Omnichannel retail: stores plus marketplace at mass scale" },
  etsy: { id: "etsy", name: "Etsy", tagline: "The handmade marketplace: sellers, listings, GMS" },
  myntra: { id: "myntra", name: "Myntra", tagline: "India's fashion giant: drops, wishlists, returns" },

  didi: { id: "didi", name: "DiDi", tagline: "Asia-LatAm ride-hailing: trips, drivers, safety ops" },
  careem: { id: "careem", name: "Careem", tagline: "MENA super-app: rides, deliveries, payments" },
  lime: { id: "lime", name: "Lime", tagline: "Micromobility: scooters, rides and city permits" },

  reddit: { id: "reddit", name: "Reddit", tagline: "Communities, karma and engagement telemetry" },
  pinterest: { id: "pinterest", name: "Pinterest", tagline: "Visual discovery: pins, boards and save funnels" },
  linkedin: { id: "linkedin", name: "LinkedIn", tagline: "The professional graph: feed, hiring, retention" },

  adyen: { id: "adyen", name: "Adyen", tagline: "Single-stack payments for global enterprises" },
  wise: { id: "wise", name: "Wise", tagline: "Cross-border money movement, fee-transparent" },
  robinhood: { id: "robinhood", name: "Robinhood", tagline: "Retail trading: orders, fills and engagement" },

  grubhub: { id: "grubhub", name: "Grubhub", tagline: "US food marketplace: diners, restaurants, drivers" },
  justeat: { id: "justeat", name: "Just Eat", tagline: "Global food ordering marketplace, UK/EU core" },
  dominos: { id: "dominos", name: "Domino's", tagline: "Pizza at 30-minute scale: orders and store ops" },

  agoda: { id: "agoda", name: "Agoda", tagline: "Asia-Pacific accommodation booking engine" },
  marriott: { id: "marriott", name: "Marriott", tagline: "Global hotel chains: properties, stays, loyalty" },
  ryanair: { id: "ryanair", name: "RyanAir", tagline: "Europe's low-fare airline: yield and ancillaries" },

  amex: { id: "amex", name: "American Express", tagline: "Premium cards, spend and membership" },
  citi: { id: "citi", name: "Citi", tagline: "Global bank: cards, treasury, markets" },
  barclays: { id: "barclays", name: "Barclays", tagline: "UK/US banking and investment banking" },

  hubspot: { id: "hubspot", name: "HubSpot", tagline: "Inbound CRM: pipelines, contacts, growth" },
  datadog: { id: "datadog", name: "Datadog", tagline: "Observability SaaS: usage, hosts, credit burn" },
  twilio: { id: "twilio", name: "Twilio", tagline: "Communications APIs: messages, calls, usage" },

  // Wave-6 additions — 3 more slots per domain (88-company matrix).
  target: { id: "target", name: "Target", tagline: "US big-box retail: stores, circles, same-day fulfillment" },
  wayfair: { id: "wayfair", name: "Wayfair", tagline: "Home goods e-commerce: casts, suppliers, logistics" },
  temu: { id: "temu", name: "Temu", tagline: "Extreme-value marketplace: gamified funnels at scale" },

  gett: { id: "gett", name: "Gett", tagline: "B2B ride-hailing: corporate ground travel" },
  freenow: { id: "freenow", name: "FREE NOW", tagline: "Europe's multi-mobility taxi super-app" },
  via: { id: "via", name: "Via", tagline: "Transit tech: shuttles, routes and utilization" },

  twitch: { id: "twitch", name: "Twitch", tagline: "Live streaming: viewers, chats, subs" },
  snapchat: { id: "snapchat", name: "Snapchat", tagline: "Ephemeral messaging and camera engagement" },
  twitter: { id: "twitter", name: "X (Twitter)", tagline: "Timelines, virality and ads at firehose scale" },

  klarna: { id: "klarna", name: "Klarna", tagline: "BNPL: checkout, pay-later, credit risk" },
  coinbase: { id: "coinbase", name: "Coinbase", tagline: "Crypto exchange: orders, books, custody" },
  plaid: { id: "plaid", name: "Plaid", tagline: "The API layer between banks and fintech apps" },

  starbucks: { id: "starbucks", name: "Starbucks", tagline: "Global coffee: rewards, stores, personalization" },
  mcdonalds: { id: "mcdonalds", name: "McDonald's", tagline: "QSR at planetary scale: menus, stores, promos" },
  hellofresh: { id: "hellofresh", name: "HelloFresh", tagline: "Meal kits: subscriptions, boxes and churn" },

  priceline: { id: "priceline", name: "Priceline", tagline: "Express deals and hotel/flight bundles" },
  trivago: { id: "trivago", name: "Trivago", tagline: "Hotel meta-search: rate funnels" },
  southwest: { id: "southwest", name: "Southwest", tagline: "Low-fare US airline: schedules, boarding, loyalty" },

  bofa: { id: "bofa", name: "Bank of America", tagline: "Consumer banking at scale: accounts, cards, loans" },
  morganstanley: { id: "morganstanley", name: "Morgan Stanley", tagline: "Wealth management and institutional markets" },
  santander: { id: "santander", name: "Santander", tagline: "Global retail bank: UK, Brazil, Spain" },

  servicenow: { id: "servicenow", name: "ServiceNow", tagline: "Enterprise workflow platform: ITSM analytics" },
  notion: { id: "notion", name: "Notion", tagline: "Connected workspace: docs, teams, usage" },
  mongodb: { id: "mongodb", name: "MongoDB", tagline: "The database company: Atlas usage and support" },

  // Wave-7 additions — 3 more slots per domain (112-company matrix).
  zalando: { id: "zalando", name: "Zalando", tagline: "Europe's fashion marketplace: drops, returns, logistics" },
  chewy: { id: "chewy", name: "Chewy", tagline: "Pet e-commerce: autoship, pharmacy, pet profiles" },
  sephora: { id: "sephora", name: "Sephora", tagline: "Beauty omnichannel: rewards, bins and baskets" },

  indrive: { id: "indrive", name: "inDrive", tagline: "Fixed-fare ride-hailing: offers, rides, cities" },
  blablacar: { id: "blablacar", name: "BlaBlaCar", tagline: "Long-distance carpooling: seats, bookings, check-ins" },
  yassir: { id: "yassir", name: "Yassir", tagline: "MENA super-app: rides, delivery, fintech" },

  discord: { id: "discord", name: "Discord", tagline: "Servers, voice rooms and Nitro subscriptions" },
  bumble: { id: "bumble", name: "Bumble", tagline: "Women-first dating: swipes, matches, conversations" },
  duolingo: { id: "duolingo", name: "Duolingo", tagline: "Streaks, lessons and the gamified learning loop" },

  nubank: { id: "nubank", name: "Nubank", tagline: "LatAm neobank: accounts, cards, credit lines" },
  chime: { id: "chime", name: "Chime", tagline: "Fee-free neobanking: spots, deposits, Credit Builder" },
  ramp: { id: "ramp", name: "Ramp", tagline: "Corporate cards and spend management" },

  wolt: { id: "wolt", name: "Wolt", tagline: "DoorDash-owned EU delivery: couriers, markets, SKUs" },
  blinkit: { id: "blinkit", name: "Blinkit", tagline: "India quick-commerce: 10-minute dark stores" },
  zepto: { id: "zepto", name: "Zepto", tagline: "Quick-commerce at Zepto speed: dark stores and SLAs" },

  tripcom: { id: "tripcom", name: "Trip.com", tagline: "Global OTA: flights, hotels and trains in one funnel" },
  hilton: { id: "hilton", name: "Hilton", tagline: "Hotels worldwide: properties, stays, Honors loyalty" },
  trainline: { id: "trainline", name: "Trainline", tagline: "UK/EU rail ticketing: routes, fares, platforms" },

  ubs: { id: "ubs", name: "UBS", tagline: "Global wealth & investment banking, post-CS integration" },
  ing: { id: "ing", name: "ING", tagline: "Dutch retail bank with a data-first culture" },
  icici: { id: "icici", name: "ICICI Bank", tagline: "India's private bank: retail, cards, UPI-scale flows" },

  dropbox: { id: "dropbox", name: "Dropbox", tagline: "Storage SaaS: teams, seats and usage" },
  zendesk: { id: "zendesk", name: "Zendesk", tagline: "Support SaaS: tickets, SLAs, agent workloads" },
  canva: { id: "canva", name: "Canva", tagline: "Design SaaS: teams, templates and usage" },

  // Wave-8 additions — 3 more slots per domain (136-company matrix).
  costco: { id: "costco", name: "Costco", tagline: "Warehouse-club membership economics, pallet by pallet" },
  rakuten: { id: "rakuten", name: "Rakuten", tagline: "Japan's marketplace: loyalty points to logistics" },
  mercadolibre: { id: "mercadolibre", name: "Mercado Libre", tagline: "Latin America's commerce ecosystem, listing to logistics" },

  gojek: { id: "gojek", name: "Gojek", tagline: "Southeast Asia's everything app: rides to payments" },
  turo: { id: "turo", name: "Turo", tagline: "Peer-to-peer car sharing, trip by trip" },
  zipcar: { id: "zipcar", name: "Zipcar", tagline: "Round-trip car sharing, reservation to key fob" },

  quora: { id: "quora", name: "Quora", tagline: "The Q&A graph: questions, answers and expertise" },
  telegram: { id: "telegram", name: "Telegram", tagline: "Messaging at scale: chats, channels and bots" },
  substack: { id: "substack", name: "Substack", tagline: "Writer economics across publications and posts" },

  monzo: { id: "monzo", name: "Monzo", tagline: "Coral-card neobanking, pot by pot" },
  affirm: { id: "affirm", name: "Affirm", tagline: "BNPL underwriting at the checkout" },
  n26: { id: "n26", name: "N26", tagline: "Mobile banking across the eurozone" },

  gopuff: { id: "gopuff", name: "Gopuff", tagline: "Instant delivery from micro-fulfillment clouds" },
  chipotle: { id: "chipotle", name: "Chipotle", tagline: "Digital kitchens, bowls per line-hour" },
  subway: { id: "subway", name: "Subway", tagline: "Sandwich units, franchises and foot-long economics" },

  hyatt: { id: "hyatt", name: "Hyatt", tagline: "Global hospitality portfolio, stay by stay" },
  emirates: { id: "emirates", name: "Emirates", tagline: "Long-haul economics out of the Dubai hub" },
  getyourguide: { id: "getyourguide", name: "GetYourGuide", tagline: "Travel activities: supply to booking funnel" },

  deutsche: { id: "deutsche", name: "Deutsche Bank", tagline: "Frankfurt's universal bank, trade to balance sheet" },
  bnpparibas: { id: "bnpparibas", name: "BNP Paribas", tagline: "Europe's universal bank, desk to ledger" },
  standardchartered: { id: "standardchartered", name: "Standard Chartered", tagline: "Asia-Africa corridors, trade to treasury" },

  asana: { id: "asana", name: "Asana", tagline: "Work management graphs, tasks to goals" },
  figma: { id: "figma", name: "Figma", tagline: "Design files, components and multiplayer canvases" },
  gitlab: { id: "gitlab", name: "GitLab", tagline: "DevOps pipelines from idea to production" },

  // Wave-9 additions — 3 more slots per domain (160-company matrix).
  coupang: { id: "coupang", name: "Coupang", tagline: "Rocket-fast fulfillment economics, WOW-membership retention" },
  noon: { id: "noon", name: "noon", tagline: "GCC marketplace ops: three markets, one sun" },
  asos: { id: "asos", name: "ASOS", tagline: "Fashion's returns economy, size curves and drop cadence" },
  cabify: { id: "cabify", name: "Cabify", tagline: "Quality-first ride-hailing: tiers, corporate travel, city ops" },
  yango: { id: "yango", name: "Yango", tagline: "New-city launch playbooks, driver-supply economics" },
  hertz: { id: "hertz", name: "Hertz", tagline: "Fleet rotation from counter to return" },
  strava: { id: "strava", name: "Strava", tagline: "Activity uploads, segments and the kudos loop" },
  whatsapp: { id: "whatsapp", name: "WhatsApp", tagline: "The world's messenger, billed by the conversation" },
  medium: { id: "medium", name: "Medium", tagline: "The read-time economy behind the metered paywall" },
  sofi: { id: "sofi", name: "SoFi", tagline: "Loan-book economics behind one-stop membership finance" },
  marqeta: { id: "marqeta", name: "Marqeta", tagline: "Modern card issuing: programs, JIT funding, controls" },
  remitly: { id: "remitly", name: "Remitly", tagline: "Consumer remittances: corridor economics at speed-tier grain" },
  tesco: { id: "tesco", name: "Tesco", tagline: "UK grocery at format scale — Clubcard, vans, aisles" },
  kroger: { id: "kroger", name: "Kroger", tagline: "Own-brand shelf economics, fuel points, pickup & delivery" },
  kfc: { id: "kfc", name: "KFC", tagline: "Fried chicken at planetary scale: buckets, franchisees, digital orders" },
  delta: { id: "delta", name: "Delta Air Lines", tagline: "Premium network yield out of the Atlanta hub" },
  accor: { id: "accor", name: "Accor", tagline: "The brand-portfolio ladder, Ibis to Sofitel" },
  amtrak: { id: "amtrak", name: "Amtrak", tagline: "America's operator: corridor yield, overnight sleepers, on-time performance" },
  hdfc: { id: "hdfc", name: "HDFC Bank", tagline: "India-scale retail banking: cards, UPI flows, the deposit franchise" },
  lloyds: { id: "lloyds", name: "Lloyds Bank", tagline: "UK retail banking at mass scale: mortgages, apps, branch economics" },
  mufg: { id: "mufg", name: "MUFG", tagline: "Japan's megabank: corridors, rails, the rate pivot" },
  databricks: { id: "databricks", name: "Databricks", tagline: "Lakehouse consumption economics: DBUs, Delta, Unity Catalog" },
  airtable: { id: "airtable", name: "Airtable", tagline: "The database for everyone: bases, records, automation runs" },
  miro: { id: "miro", name: "Miro", tagline: "Visual collaboration: boards, workshops, seat expansion" },
  // wave-10
  shein: { id: "shein", name: "SHEIN", tagline: "Micro-batch drops, cart-size economics, cross-border speed" },
  mercari: { id: "mercari", name: "Mercari", tagline: "Japan's C2C app marketplace: seller liquidity, trust scores, the flat take rate" },
  newegg: { id: "newegg", name: "Newegg", tagline: "PC-builder commerce: spec ladders, combo deals, the RMA desk" },
  sixt: { id: "sixt", name: "SIXT", tagline: "Premium car rental: fleet turnover, station P&L, the orange counter" },
  voi: { id: "voi", name: "Voi", tagline: "European e-scooter cities: permits, utilization, charging swaps" },
  beat: { id: "beat", name: "BEAT", tagline: "Greek ride-hail: rating gates, dense-city liquidity, surge windows" },
  tumblr: { id: "tumblr", name: "Tumblr", tagline: "The reblog graph: fandom depth, Post+ and the ad load" },
  vimeo: { id: "vimeo", name: "Vimeo", tagline: "Pro-grade video hosting: the plan ladder, the bandwidth bill, the OTT book" },
  audible: { id: "audible", name: "Audible", tagline: "Credit-bank economics: rollover credits, listening depth, catalog churn" },
  tink: { id: "tink", name: "Tink", tagline: "European open-banking rails: coverage, aggregation, payment initiation" },
  fireblocks: { id: "fireblocks", name: "Fireblocks", tagline: "Digital-asset custody & the settlement network: vaults, quorums, rails" },
  brex: { id: "brex", name: "Brex", tagline: "Startup corporate cards: limit underwriting, policy controls, bill pay" },
  blueapron: { id: "blueapron", name: "Blue Apron", tagline: "Weekly box economics at per-portion grain" },
  waitrose: { id: "waitrose", name: "Waitrose", tagline: "Premium UK grocery: own-brand mix, myWaitrose, branches" },
  dunkin: { id: "dunkin", name: "Dunkin'", tagline: "Value daypart ladders, drive-thru windows, franchise royalties" },
  radisson: { id: "radisson", name: "Radisson", tagline: "The Blu ladder and the Rewards book" },
  vueling: { id: "vueling", name: "Vueling", tagline: "Barcelona's low-fare hub: attach rates and fare-family ladders" },
  flix: { id: "flix", name: "FlixBus", tagline: "Green intercity coach network: partner fleets, seat-km yield, dynamic fares" },
  rabobank: { id: "rabobank", name: "Rabobank", tagline: "The food & agri cooperative bank: corridors, seasons, member capital" },
  bmo: { id: "bmo", name: "BMO", tagline: "The US-Canada cross-border bank: corridor books, commercial lending, integration synergy" },
  natwest: { id: "natwest", name: "NatWest", tagline: "UK commercial banking: business books, app-first retail, the rate-reset cycle" },
  linear: { id: "linear", name: "Linear", tagline: "Issue tracking at cycle speed: triage, velocity, seats" },
  gong: { id: "gong", name: "Gong", tagline: "Revenue intelligence: deal risk, engagement, forecast calls" },
  retool: { id: "retool", name: "Retool", tagline: "Internal tools in hours: apps on live data, seat expansion, governance" },
  // wave-11
  bestbuy: { id: "bestbuy", name: "Best Buy", tagline: "Big-ticket electronics retail: attach economics, price-match windows, member tiers" },
  ikea: { id: "ikea", name: "IKEA", tagline: "Flat-pack retail: range discipline, stock cover, the pickup funnel" },
  zara: { id: "zara", name: "Zara", tagline: "Design-to-shelf in two weeks: drop clocks, sell-through speed, markdown windows" },
  avis: { id: "avis", name: "Avis", tagline: "We Try Harder SQL: the reservation funnel, no-show leak and fleet-partner book" },
  enterprise: { id: "enterprise", name: "Enterprise", tagline: "Neighborhood branches, corporate accounts: branch P&L, replacement billing" },
  getaround: { id: "getaround", name: "Getaround", tagline: "Instant-key car sharing: utilization, host earnings, no-show economics" },
  soundcloud: { id: "soundcloud", name: "SoundCloud", tagline: "Creator-first audio: plays-to-payout funnels, Next Pro tiers, royalty rails" },
  threads: { id: "threads", name: "Threads", tagline: "Growth-loop velocity on the Instagram graph: ramp, retention, creator rollout" },
  goodreads: { id: "goodreads", name: "Goodreads", tagline: "Reading depth by SQL: shelf funnels, challenge ladders, publisher benches" },
  afterpay: { id: "afterpay", name: "Afterpay", tagline: "The 4-pay installment clock: approval funnel, merchant fees, split rails" },
  paytm: { id: "paytm", name: "Paytm", tagline: "Wallet + UPI rails at super-app scale: bill-pay, recharge, QR acquiring" },
  venmo: { id: "venmo", name: "Venmo", tagline: "Split-the-bill SQL: split legs, balance float, feed engagement" },
  burgerking: { id: "burgerking", name: "Burger King", tagline: "Franchisee economics at the flame grill: royalties, remittances, coupon traffic" },
  chickfila: { id: "chickfila", name: "Chick-fil-A", tagline: "Drive-thru density: six-day weeks, sixteen SKUs, per-unit revenue" },
  aldi: { id: "aldi", name: "ALDI", tagline: "Hard-discount leanness: one-deep aisles, own-label concentration, basket depth" },
  skyscanner: { id: "skyscanner", name: "Skyscanner", tagline: "Flight metasearch: query-to-click funnels, partner share, fare-alert pulse" },
  easyjet: { id: "easyjet", name: "easyJet", tagline: "Ancillary attach by SQL: fee bands, fare classes, the unbundled P&L" },
  ihg: { id: "ihg", name: "IHG", tagline: "The franchise lever: rate bands, RevPAR folds, royalty checks" },
  sbi: { id: "sbi", name: "SBI", tagline: "Public-sector banking at scale: branch censuses, priority-sector books, the deposit spine" },
  axisbank: { id: "axisbank", name: "Axis Bank", tagline: "Cards and retail-lending growth, read through limit bands and the dunning book" },
  usbank: { id: "usbank", name: "U.S. Bank", tagline: "The regional network bank: branch markets, rails discipline, settlement coverage" },
  intercom: { id: "intercom", name: "Intercom", tagline: "Customer messaging SQL: resolution funnels, Fin containment, honest denominators" },
  segment: { id: "segment", name: "Segment", tagline: "One source, many destinations: MTU billing and schema discipline" },
  mailchimp: { id: "mailchimp", name: "Mailchimp", tagline: "Email marketing by SQL: send funnels, contact tiers, deliverability denominators" },
};

/** Authored kits — keyed by company id. ALL 208 slots live: 40 flagship
 *  (batches A–I) + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10 + 24 wave-11 additions. */
export const COMPANY_KITS: Record<string, CompanyKit> = {
  amazon: amazonKit,
  flipkart: flipkartKit,
  alibaba: alibabaKit,
  shopify: shopifyKit,
  ebay: ebayKit,
  uber: uberKit,
  lyft: lyftKit,
  ola: olaKit,
  bolt: boltKit,
  grab: grabKit,
  netflix: netflixKit,
  spotify: spotifyKit,
  youtube: youtubeKit,
  meta: metaKit,
  tiktok: tiktokKit,
  stripe: stripeKit,
  paypal: paypalKit,
  visa: visaKit,
  revolut: revolutKit,
  block: blockKit,
  doordash: doordashKit,
  swiggy: swiggyKit,
  zomato: zomatoKit,
  instacart: instacartKit,
  deliveroo: deliverooKit,
  airbnb: airbnbKit,
  booking: bookingKit,
  expedia: expediaKit,
  oyo: oyoKit,
  makemytrip: makemytripKit,
  goldman: goldmanKit,
  jpmorgan: jpmorganKit,
  capitalone: capitaloneKit,
  wellsfargo: wellsfargoKit,
  hsbc: hsbcKit,
  salesforce: salesforceKit,
  slack: slackKit,
  zoom: zoomKit,
  atlassian: atlassianKit,
  snowflake: snowflakeKit,

  // Wave-5 additions — 3 per domain, all 8 domains extended to 8 companies.
  walmart: walmartKit,
  etsy: etsyKit,
  myntra: myntraKit,
  didi: didiKit,
  careem: careemKit,
  lime: limeKit,
  reddit: redditKit,
  pinterest: pinterestKit,
  linkedin: linkedinKit,
  adyen: adyenKit,
  wise: wiseKit,
  robinhood: robinhoodKit,
  grubhub: grubhubKit,
  justeat: justeatKit,
  dominos: dominosKit,
  agoda: agodaKit,
  marriott: marriottKit,
  ryanair: ryanairKit,
  amex: amexKit,
  citi: citiKit,
  barclays: barclaysKit,
  hubspot: hubspotKit,
  datadog: datadogKit,
  twilio: twilioKit,

  // Wave-6 additions — 3 more per domain, all 8 domains extended to 11 companies.
  target: targetKit,
  wayfair: wayfairKit,
  temu: temuKit,
  gett: gettKit,
  freenow: freenowKit,
  via: viaKit,
  twitch: twitchKit,
  snapchat: snapchatKit,
  twitter: twitterKit,
  klarna: klarnaKit,
  coinbase: coinbaseKit,
  plaid: plaidKit,
  starbucks: starbucksKit,
  mcdonalds: mcdonaldsKit,
  hellofresh: hellofreshKit,
  priceline: pricelineKit,
  trivago: trivagoKit,
  southwest: southwestKit,
  bofa: bofaKit,
  morganstanley: morganstanleyKit,
  santander: santanderKit,
  servicenow: servicenowKit,
  notion: notionKit,
  mongodb: mongodbKit,

  // Wave-7 additions — 3 more per domain, all 8 domains extended to 14 companies.
  zalando: zalandoKit,
  chewy: chewyKit,
  sephora: sephoraKit,
  indrive: indriveKit,
  blablacar: blablacarKit,
  yassir: yassirKit,
  discord: discordKit,
  bumble: bumbleKit,
  duolingo: duolingoKit,
  nubank: nubankKit,
  chime: chimeKit,
  ramp: rampKit,
  wolt: woltKit,
  blinkit: blinkitKit,
  zepto: zeptoKit,
  tripcom: tripcomKit,
  hilton: hiltonKit,
  trainline: trainlineKit,
  ubs: ubsKit,
  ing: ingKit,
  icici: iciciKit,
  dropbox: dropboxKit,
  zendesk: zendeskKit,
  canva: canvaKit,

  // Wave-8 additions — 3 more per domain, all 8 domains extended to 17 companies.
  costco: costcoKit,
  rakuten: rakutenKit,
  mercadolibre: mercadolibreKit,
  gojek: gojekKit,
  turo: turoKit,
  zipcar: zipcarKit,
  quora: quoraKit,
  telegram: telegramKit,
  substack: substackKit,
  monzo: monzoKit,
  affirm: affirmKit,
  n26: n26Kit,
  gopuff: gopuffKit,
  chipotle: chipotleKit,
  subway: subwayKit,
  hyatt: hyattKit,
  emirates: emiratesKit,
  getyourguide: getyourguideKit,
  deutsche: deutscheKit,
  bnpparibas: bnpparibasKit,
  standardchartered: standardcharteredKit,
  asana: asanaKit,
  figma: figmaKit,
  gitlab: gitlabKit,

  // Wave-9 additions — 3 per domain, all 8 domains extended to 20 companies.
  coupang: coupangKit,
  noon: noonKit,
  asos: asosKit,
  cabify: cabifyKit,
  yango: yangoKit,
  hertz: hertzKit,
  strava: stravaKit,
  whatsapp: whatsappKit,
  medium: mediumKit,
  sofi: sofiKit,
  marqeta: marqetaKit,
  remitly: remitlyKit,
  tesco: tescoKit,
  kroger: krogerKit,
  kfc: kfcKit,
  delta: deltaKit,
  accor: accorKit,
  amtrak: amtrakKit,
  hdfc: hdfcKit,
  lloyds: lloydsKit,
  mufg: mufgKit,
  databricks: databricksKit,
  airtable: airtableKit,
  miro: miroKit,
  // wave-10
  shein: sheinKit,
  mercari: mercariKit,
  newegg: neweggKit,
  sixt: sixtKit,
  voi: voiKit,
  beat: beatKit,
  tumblr: tumblrKit,
  vimeo: vimeoKit,
  audible: audibleKit,
  tink: tinkKit,
  fireblocks: fireblocksKit,
  brex: brexKit,
  blueapron: blueapronKit,
  waitrose: waitroseKit,
  dunkin: dunkinKit,
  radisson: radissonKit,
  vueling: vuelingKit,
  flix: flixKit,
  rabobank: rabobankKit,
  bmo: bmoKit,
  natwest: natwestKit,
  linear: linearKit,
  gong: gongKit,
  retool: retoolKit,
  // wave-11
  bestbuy: bestbuyKit,
  ikea: ikeaKit,
  zara: zaraKit,
  avis: avisKit,
  enterprise: enterpriseKit,
  getaround: getaroundKit,
  soundcloud: soundcloudKit,
  threads: threadsKit,
  goodreads: goodreadsKit,
  afterpay: afterpayKit,
  paytm: paytmKit,
  venmo: venmoKit,
  burgerking: burgerkingKit,
  chickfila: chickfilaKit,
  aldi: aldiKit,
  skyscanner: skyscannerKit,
  easyjet: easyjetKit,
  ihg: ihgKit,
  sbi: sbiKit,
  axisbank: axisbankKit,
  usbank: usbankKit,
  intercom: intercomKit,
  segment: segmentKit,
  mailchimp: mailchimpKit,
};

export const companyKit = (id: string): CompanyKit | undefined => COMPANY_KITS[id];
export const isKitLive = (id: string): boolean => COMPANY_KITS[id] !== undefined;
