# Store Account Setup — Simple Step-by-Step Guide

Hi! Thanks for helping set up the store. This guide walks you through creating
the online store accounts and collecting a few pieces of information for the
developer. **You don't need any technical or coding knowledge** — it's all
point-and-click inside websites. It should take about 1–2 hours (plus waiting
time for account approvals).

At the end there's a short **"What to send back"** checklist. As you go, just
copy each value into that list.

---

## The big picture (30-second version)

We're building a jewellery shopping website. Behind the scenes it uses three
services:

1. **Shopify** — stores your products, prices, and handles the payment page.
2. **Razorpay** — lets customers pay by UPI, cards, and EMI (connects inside Shopify).
3. **Shiprocket** — checks delivery availability and ships orders across India.

Your job: create these accounts and copy a few "keys" (think of them as
passwords that let our website talk to Shopify) and send them to the developer.

> 💡 **The web link for the Webhooks step (A6) is:**
> **`https://ezmayjewels.com/api/shopify/webhook`**
> Use this exact link for all five webhooks. (It's already live — nothing more
> to ask the developer for.)

---

## Part A — Shopify (the main store)

### A1. Create the Shopify account

1. Go to **https://www.shopify.com** and click **Start free trial**.
2. Sign up with the business email. Choose a store name (e.g. *EZMAY By Gurleen*).
3. When asked, pick a paid plan — the **Basic** plan is enough.
4. Once inside, go to **Settings** (bottom-left) → **Store details**.
5. Set **Store currency** to **Indian Rupee (INR)**. ✅ *(Important — do this before adding products.)*
6. Set the **Store address / country** to India.

📋 **Write down your store web address.** Go to **Settings → Domains**. You'll
see an address like **`yourname.myshopify.com`**. Copy it — this is **Value #1**.

### A2. Add your products

1. In the left menu click **Products** → **Add product**.
2. For each piece of jewellery, fill in:
   - **Title** (e.g. "Kundan Gold Necklace")
   - **Description**
   - **Media** — upload the photos (Shopify stores them for you)
   - **Price** (in ₹)
   - **Inventory / quantity** — turn on "Track quantity" and enter how many you have
   - **Product type** — this becomes the category (e.g. `Rings`, `Necklaces`,
     `Earrings`, `Bracelets`). Please use these simple category words.
   - **Tags** — if you want a product shown on the homepage's "Featured" section,
     add the tag **`featured`** (all lowercase).
3. Click **Save**. Repeat for each product.

> Optional but nice: to show the material (e.g. "22k Gold, Kundan") on the
> product page, ask the developer whether to set up a "material" field, or just
> include the material in the description for now.

### A3. Get the "Storefront" connection key

This key lets our website read your products from Shopify.

1. Go to **Settings** → **Apps and sales channels**.
2. Click **Develop apps** (top right). If it asks, click **Allow custom app development** and confirm.
3. Click **Create an app**. Give it a name like **`Website Connection`**. Click **Create app**.
4. Open the **Configuration** tab → find **Storefront API integration** → click **Configure**.
5. Tick these boxes (check all that mention products, inventory, and checkouts):
   - Read products and collections
   - Read product inventory
   - Read and write checkouts (carts)
6. Click **Save**, then go to the **API credentials** tab and click **Install app**.
7. Under **Storefront API access token**, click to reveal and **copy the token**.
   It's a long string of letters and numbers.

📋 That token is **Value #2**.

### A4. Turn on payments (Razorpay for UPI / cards / EMI)

*(First create the Razorpay account in **Part B** below, then come back here.)*

1. Go to **Settings** → **Payments**.
2. Find **Razorpay** (search if needed) and click **Activate / Set up**.
3. Log in with your Razorpay account when prompted and follow the steps to connect.
4. Save.

You don't need to send any payment keys to the developer — Shopify and Razorpay
handle payments on their own secure page. ✅ Just confirm it's connected.

### A5. Set up GST (3% for jewellery)

1. Go to **Settings** → **Taxes and duties** → **India**.
2. Set up a **GST rate of 3%** for your products (jewellery is taxed at 3%).
   If it asks for a split, use **1.5% CGST + 1.5% SGST**.
3. Recommended: turn on the option **"All prices include tax"** (usually under
   Settings → Taxes) so the prices you enter already include GST — this is the
   normal way jewellery is priced in India.

✅ Just confirm GST is set to 3%.

### A6. Set up order notifications ("Webhooks")

This tells our website whenever a new order comes in.

1. Go to **Settings** → **Notifications** → scroll down to **Webhooks**.
2. Click **Create webhook**. For each one below:
   - **Event:** choose the event from the list
   - **Format:** JSON
   - **URL:** `https://ezmayjewels.com/api/shopify/webhook` (the same link for all five)
3. Create **five** webhooks, one for each of these events:
   - Order creation
   - Order payment
   - Order update
   - Order cancellation
   - Order fulfillment
4. Scroll to the **bottom of the Webhooks section**. You'll see a line like
   *"Your webhooks will be signed with a secret key"* with a code next to it.
   **Copy that code.**

📋 That signing secret is **Value #3**.

---

## Part B — Razorpay (payments)

1. Go to **https://razorpay.com** and click **Sign Up**.
2. Complete the business verification (**KYC**) — you'll need business/bank
   details and documents. *(Approval can take 1–2 business days.)*
3. Once approved, in the Razorpay dashboard make sure **UPI** and **EMI /
   No-Cost EMI** are enabled (under **Settings → Payment Methods**). These let
   customers pay by UPI and pay for expensive pieces in instalments.
4. Go back to **Part A4** to connect Razorpay inside Shopify.

You don't need to send Razorpay keys — connecting it inside Shopify (A4) is enough.
✅ Just confirm the account is approved and connected.

---

## Part C — Shiprocket (shipping & delivery checks)

1. Go to **https://www.shiprocket.in** and click **Sign Up**. Complete the setup.
2. Add your **pickup address** (where orders ship from) under **Settings → Pickup Addresses**.
3. Create an **API user** (this lets our website check delivery times):
   - Go to **Settings** → **API** → **Configure**.
   - Click **Create an API User**.
   - Enter an email and a password (you can make a new email/password just for
     this — write them down exactly).
   - Save.

📋 You now have three things to send:
- The API user **email** — **Value #4**
- The API user **password** — **Value #5**
- Your shop's **pickup PIN code** (6 digits, e.g. `110001`) — **Value #6**

---

## ✅ What to send back to me (the developer)

Please copy your values into this list and send it to me. If any step isn't done
yet, just write "not done yet" and we'll finish it together.

```
1. Shopify store web address:        __________________________   (e.g. ezmay.myshopify.com)
2. Shopify Storefront access token:  __________________________   (long letters/numbers from step A3)
3. Shopify webhook signing secret:   __________________________   (code from bottom of step A6)
4. Shiprocket API user email:        __________________________
5. Shiprocket API user password:     __________________________
6. Shop pickup PIN code:             __________________________   (6 digits)

Confirmations (just Yes/No):
- Store currency set to INR?         ____
- Products added?                    ____  (how many? ____)
- Razorpay connected in Shopify?     ____
- GST set to 3%?                     ____
- 5 order webhooks created?          ____
```

### How to send it safely 🔒

These values are like passwords, so please **don't post them publicly**. Send them
to me through a private/secure method I'll tell you (for example a password manager
share link, or a private direct message). Please don't share them in a public
group chat or a public document.

---

## Common terms, in plain English

- **Token / secret / key** — a long code that acts like a password so two
  websites can talk to each other securely.
- **Storefront API** — the "window" that lets our website read your Shopify products.
- **Webhook** — an automatic message Shopify sends us the moment an order happens,
  so the order shows up in the admin.
- **Serviceability** — checking whether we can deliver to a customer's PIN code.
- **KYC** — "Know Your Customer": the identity/business verification that payment
  and shipping companies require by law.

That's everything — thank you! Once I have the six values above, I'll plug them in
and get the store live. 🎉
