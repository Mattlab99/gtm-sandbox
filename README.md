# GTM ecommerce sandbox

A deliberately plain apparel shop for practising GA4 ecommerce tracking with
Google Tag Manager. Four products, size and colour variants, a full funnel from
listing through to order confirmation.

Not a real shop. No payments, no server. The cart lives in `localStorage` and
the order lives in `sessionStorage`, which is all GTM needs to see.

## Setup

1. Create a new public repo on GitHub and push these files to the root.
2. Repo **Settings > Pages**, set source to your `main` branch, root folder.
   Your site appears at `https://<username>.github.io/<repo>/` in a minute or two.
3. Create a GTM account with a **Web** container at tagmanager.google.com.
4. Create a GA4 property with a web data stream at analytics.google.com.
5. Paste the two GTM snippets into all five HTML files, at the two marked spots.
6. Load the site, open **Preview** in GTM, and confirm it connects.

Do not go past step 6 until Preview connects. Everything after depends on it.

## Your job

`assets/shop.js` has seven empty stub functions at the bottom. Each needs a
`dataLayer.push()`. The plumbing that calls them at the right moment is already
written, so all you supply is the push itself.

| Stub | Event | Fires when |
|---|---|---|
| `pushViewItemList` | `view_item_list` | Listing page renders |
| `pushSelectItem` | `select_item` | Product clicked in the list |
| `pushViewItem` | `view_item` | Product page renders |
| `pushAddToCart` | `add_to_cart` | Add to bag clicked |
| `pushViewCart` | `view_cart` | Bag page renders |
| `pushBeginCheckout` | `begin_checkout` | Checkout page renders |
| `pushPurchase` | `purchase` | Confirmation page renders |

Field reference, keep it open the whole time:
https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

## Then wire the tags

1. Data layer variables for the fields you need.
2. Custom Event triggers, one per event name.
3. A Google tag for GA4 plus GA4 event tags for each ecommerce event.
4. Walk the funnel in Preview and confirm each event fires **once** with the
   right parameters.
5. Cross-check the same events in GA4 DebugView.

When Preview and DebugView agree end to end, you have built the thing.

## Checks worth running on yourself

- Does `value` match the sum of `price * quantity` across the items array?
- Does `purchase` fire twice if you refresh the confirmation page? If so, why,
  and what would you do about it in production?
- Does the previous event's `ecommerce` object leak into the next one?
- What happens to `item_variant` when someone buys two sizes of the same SKU?

Those four questions are most of what a tagging audit actually asks.
