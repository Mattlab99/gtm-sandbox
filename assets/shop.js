/* ==========================================================================
   Harbourline sandbox shop
   --------------------------------------------------------------------------
   The plumbing below is done for you: catalogue, cart, rendering, routing.
   The dataLayer pushes are NOT. They are stubs near the bottom of this file.
   That is the part of this exercise that teaches you the job, so write them.

   Spec to check every field against:
   https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
   ========================================================================== */

var CURRENCY = 'AUD';
var BRAND = 'Harbourline';

var CATALOGUE = [
  {
    sku: 'HL-TEE-001',
    name: 'Classic Cotton Tee',
    category: 'Tops',
    category2: 'T-Shirts',
    price: 29.95,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Navy', 'White', 'Black'],
    blurb: 'Mid-weight cotton jersey. Cut a little longer in the body.'
  },
  {
    sku: 'HL-UND-014',
    name: 'Everyday Trunk 3 Pack',
    category: 'Underwear',
    category2: 'Trunks',
    price: 39.95,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Assorted', 'Black'],
    blurb: 'Three per pack. Soft waistband, no tag at the back.'
  },
  {
    sku: 'HL-SCK-022',
    name: 'Cushioned Crew Sock 5 Pack',
    category: 'Socks',
    category2: 'Crew',
    price: 24.95,
    sizes: ['6-10', '11-14'],
    colours: ['White', 'Grey Marle'],
    blurb: 'Reinforced heel and toe. Five pairs.'
  },
  {
    sku: 'HL-HOO-008',
    name: 'Fleece Hoodie',
    category: 'Tops',
    category2: 'Hoodies',
    price: 79.95,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Charcoal', 'Oatmeal'],
    blurb: 'Brushed fleece inside. Kangaroo pocket.'
  }
];

/* ---------- small helpers ------------------------------------------------ */

function money(n) {
  return '$' + n.toFixed(2);
}

function findProduct(sku) {
  for (var i = 0; i < CATALOGUE.length; i++) {
    if (CATALOGUE[i].sku === sku) return CATALOGUE[i];
  }
  return null;
}

function queryParam(name) {
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
}

/* ---------- cart state (localStorage) ------------------------------------ */

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('hl_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem('hl_cart', JSON.stringify(cart));
  paintCartCount();
}

function cartTotal(cart) {
  return cart.reduce(function (sum, line) {
    return sum + line.price * line.quantity;
  }, 0);
}

function paintCartCount() {
  var el = document.getElementById('cart-count');
  if (!el) return;
  var count = getCart().reduce(function (n, l) { return n + l.quantity; }, 0);
  el.textContent = count;
}

function addToCart(product, size, colour) {
  var cart = getCart();
  var variant = colour + ' / ' + size;
  var existing = null;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].sku === product.sku && cart[i].variant === variant) existing = cart[i];
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      sku: product.sku,
      name: product.name,
      category: product.category,
      category2: product.category2,
      price: product.price,
      variant: variant,
      quantity: 1
    });
  }

  setCart(cart);
  return cart;
}

/* ---------- page rendering ----------------------------------------------- */

function renderListing() {
  var wrap = document.getElementById('listing');
  if (!wrap) return;

  CATALOGUE.forEach(function (p, index) {
    var card = document.createElement('a');
    card.className = 'card';
    card.href = 'product.html?sku=' + p.sku;
    card.innerHTML =
      '<div class="thumb">' + p.category + '</div>' +
      '<div class="card-name">' + p.name + '</div>' +
      '<div class="card-price">' + money(p.price) + '</div>';

    card.addEventListener('click', function () {
      // Fires when a customer clicks a product in the list.
      pushSelectItem(p, index, 'Homepage listing');
    });

    wrap.appendChild(card);
  });

  // Fires once, when the list of products is displayed.
  pushViewItemList(CATALOGUE, 'Homepage listing');
}

function renderProduct() {
  var wrap = document.getElementById('product');
  if (!wrap) return;

  var product = findProduct(queryParam('sku'));
  if (!product) {
    wrap.innerHTML = '<p>Product not found. <a href="index.html">Back to the shop</a></p>';
    return;
  }

  var sizeOpts = product.sizes.map(function (s) {
    return '<option value="' + s + '">' + s + '</option>';
  }).join('');

  var colourOpts = product.colours.map(function (c) {
    return '<option value="' + c + '">' + c + '</option>';
  }).join('');

  wrap.innerHTML =
    '<div class="thumb large">' + product.category + '</div>' +
    '<h1>' + product.name + '</h1>' +
    '<p class="sku">' + product.sku + ' &middot; ' + BRAND + '</p>' +
    '<p class="price">' + money(product.price) + '</p>' +
    '<p>' + product.blurb + '</p>' +
    '<label>Colour <select id="colour">' + colourOpts + '</select></label>' +
    '<label>Size <select id="size">' + sizeOpts + '</select></label>' +
    '<button id="add" class="primary">Add to bag</button>' +
    '<p id="added" class="note" hidden>Added to your bag. <a href="cart.html">View bag</a></p>';

  document.getElementById('add').addEventListener('click', function () {
    var size = document.getElementById('size').value;
    var colour = document.getElementById('colour').value;
    addToCart(product, size, colour);
    document.getElementById('added').hidden = false;

    // Fires when a customer adds an item to the bag.
    pushAddToCart(product, size, colour, 1);
  });

  // Fires once, when the product detail page is displayed.
  pushViewItem(product);
}

function renderCart() {
  var wrap = document.getElementById('cart');
  if (!wrap) return;

  var cart = getCart();
  if (!cart.length) {
    wrap.innerHTML = '<p>Your bag is empty. <a href="index.html">Keep shopping</a></p>';
    return;
  }

  var rows = cart.map(function (l) {
    return '<tr><td>' + l.name + '<br><span class="sku">' + l.variant + '</span></td>' +
           '<td>' + l.quantity + '</td>' +
           '<td>' + money(l.price * l.quantity) + '</td></tr>';
  }).join('');

  wrap.innerHTML =
    '<table><tbody>' + rows + '</tbody></table>' +
    '<p class="price">Total ' + money(cartTotal(cart)) + '</p>' +
    '<a href="checkout.html" class="primary button">Checkout</a>';

  // Fires once, when the bag is displayed.
  pushViewCart(cart);
}

function renderCheckout() {
  var wrap = document.getElementById('checkout');
  if (!wrap) return;

  var cart = getCart();
  if (!cart.length) {
    wrap.innerHTML = '<p>Nothing to check out. <a href="index.html">Keep shopping</a></p>';
    return;
  }

  wrap.innerHTML =
    '<p class="price">Order total ' + money(cartTotal(cart)) + '</p>' +
    '<label>Email <input type="email" value="test@example.com"></label>' +
    '<label>Delivery <select id="shipping">' +
      '<option value="Standard">Standard</option>' +
      '<option value="Express">Express</option>' +
    '</select></label>' +
    '<button id="place" class="primary">Place order</button>';

  document.getElementById('place').addEventListener('click', function () {
    var orderId = 'HL' + Date.now();
    sessionStorage.setItem('hl_order', JSON.stringify({
      orderId: orderId,
      cart: cart,
      shipping: document.getElementById('shipping').value
    }));
    localStorage.removeItem('hl_cart');
    window.location.href = 'confirmation.html';
  });

  // Fires once, when the checkout is displayed.
  pushBeginCheckout(cart);
}

function renderConfirmation() {
  var wrap = document.getElementById('confirmation');
  if (!wrap) return;

  var order = null;
  try {
    order = JSON.parse(sessionStorage.getItem('hl_order'));
  } catch (e) {}

  if (!order) {
    wrap.innerHTML = '<p>No recent order. <a href="index.html">Start again</a></p>';
    return;
  }

  wrap.innerHTML =
    '<h1>Thanks, your order is confirmed</h1>' +
    '<p class="sku">Order ' + order.orderId + '</p>' +
    '<p class="price">' + money(cartTotal(order.cart)) + '</p>' +
    '<p><a href="index.html">Keep shopping</a></p>';

  // Fires once, when the order is confirmed. The one that pays the bills.
  pushPurchase(order);
}

/* ==========================================================================
   YOUR WORK STARTS HERE
   --------------------------------------------------------------------------
   Seven stubs. Each one needs a dataLayer.push().

   Before you write any of them, read the spec and note two habits that
   catch people out:
     1. Push a null ecommerce object before each ecommerce event, so values
        from the previous event do not leak into the next one.
     2. Field names are exact. item_id is not itemId or id.

   Check every field name against:
   https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

   A note on why these are empty: you are about to own the tagging for five
   brands. Typing an items array from the spec, getting a field name wrong,
   and finding it in DebugView is the exact loop you will run at work. Watching
   someone else's finished code does not build that.
   ========================================================================== */

function pushViewItemList(products, listName) {
  // Event: view_item_list
  // Needs: item_list_id, item_list_name, items[]
  // Each item: item_id, item_name, item_brand, item_category, price, index
  // TODO
}

function pushSelectItem(product, index, listName) {
  // Event: select_item
  // Needs: item_list_id, item_list_name, items[] (one item, with its index)
  // TODO
}

function pushViewItem(product) {
  // Event: view_item
  // Needs: currency, value, items[]
  // TODO
}

function pushAddToCart(product, size, colour, quantity) {
  // Event: add_to_cart
  // Needs: currency, value, items[]
  // Think about what item_variant should hold, and what value equals
  // when quantity is more than one.
  // TODO
}

function pushViewCart(cart) {
  // Event: view_cart
  // Needs: currency, value, items[] (every line in the bag)
  // TODO
}

function pushBeginCheckout(cart) {
  // Event: begin_checkout
  // Needs: currency, value, items[]
  // Optional but worth adding: coupon
  // TODO
}

function pushPurchase(order) {
  // Event: purchase
  // Needs: transaction_id, currency, value, items[]
  // Also worth adding: shipping, tax
  // transaction_id is what stops duplicate orders being counted twice,
  // so work out where yours comes from.
  // TODO
}

/* ---------- boot ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function () {
  paintCartCount();
  renderListing();
  renderProduct();
  renderCart();
  renderCheckout();
  renderConfirmation();
});
