"""
Generates USER_MANUAL.pdf at the project root.
Run from anywhere: `python scripts/build_user_manual.py`
"""
from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem,
)

OUTPUT = Path(__file__).resolve().parent.parent / "USER_MANUAL.pdf"

# ── Colors (match the app's design tokens, light mode) ────────────
FG1     = HexColor("#08060d")   # primary text
FG2     = HexColor("#6b6375")   # secondary text
BORDER  = HexColor("#e5e4e7")
BG2     = HexColor("#f4f3ec")   # warm cream surface
ACCENT  = HexColor("#08060d")
DANGER  = HexColor("#c53030")

# ── Styles ────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontName="Helvetica-Bold", fontSize=28, leading=34,
    textColor=FG1, spaceAfter=4,
)
SUBTITLE = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontName="Helvetica", fontSize=12, leading=16,
    textColor=FG2, spaceAfter=24,
)
H1 = ParagraphStyle(
    "H1", parent=styles["Heading1"],
    fontName="Helvetica-Bold", fontSize=20, leading=24,
    textColor=FG1, spaceBefore=18, spaceAfter=10,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontName="Helvetica-Bold", fontSize=14, leading=18,
    textColor=FG1, spaceBefore=14, spaceAfter=6,
)
BODY = ParagraphStyle(
    "Body", parent=styles["BodyText"],
    fontName="Helvetica", fontSize=11, leading=16,
    textColor=FG1, spaceAfter=8, alignment=TA_LEFT,
)
MUTED = ParagraphStyle(
    "Muted", parent=BODY,
    fontSize=10, textColor=FG2,
)
BULLET = ParagraphStyle(
    "Bullet", parent=BODY,
    leftIndent=14, spaceAfter=4,
)
CODE = ParagraphStyle(
    "Code", parent=BODY,
    fontName="Courier", fontSize=10, leading=14,
    textColor=FG1, backColor=BG2,
    borderColor=BORDER, borderWidth=0.5,
    borderPadding=6, spaceAfter=10,
)
CALLOUT = ParagraphStyle(
    "Callout", parent=BODY,
    leftIndent=12, rightIndent=12, fontSize=10, leading=14,
    textColor=FG2, backColor=BG2,
    borderColor=BORDER, borderWidth=0.5,
    borderPadding=10, spaceBefore=4, spaceAfter=10,
)


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(t, BODY), leftIndent=14) for t in items],
        bulletType="bullet",
        bulletChar="•",     # actual round bullet glyph
        leftIndent=18,
        bulletFontSize=9,
        bulletColor=FG1,
    )


def table(headers, rows, col_widths=None):
    data = [headers] + rows
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",  (0, 0), (-1, 0), FG1),
        ("TEXTCOLOR",  (0, 1), (-1, -1), FG1),
        ("BACKGROUND", (0, 0), (-1, 0), BG2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("LINEBELOW",  (0, 0), (-1, 0), 0.75, BORDER),
        ("LINEBELOW",  (0, 1), (-1, -2), 0.25, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(FG2)
    canvas.drawString(0.75 * inch, 0.5 * inch, "SoleStore — Operator's Manual")
    canvas.drawRightString(LETTER[0] - 0.75 * inch, 0.5 * inch,
                           f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


def build():
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        title="SoleStore — Operator's Manual",
        author="SoleStore",
    )
    s = []

    # ── Cover ──────────────────────────────────────────────────
    s.append(Spacer(1, 1.2 * inch))
    s.append(Paragraph("SoleStore", TITLE))
    s.append(Paragraph("Operator's Manual", SUBTITLE))
    s.append(Paragraph(
        "Everything you need to run the day-to-day of your SoleStore — "
        "from uploading product photos to checking your weekly revenue. "
        "No technical background required.",
        BODY))
    s.append(Spacer(1, 0.2 * inch))
    s.append(Paragraph(
        "This guide assumes the site is already installed and running. "
        "If you need to set it up or change how it works under the hood, "
        "see <b>README.md</b> in the project folder.",
        MUTED))
    s.append(PageBreak())

    # ── Table of contents ──────────────────────────────────────
    s.append(Paragraph("Contents", H1))
    toc = [
        "1. Getting started",
        "2. Product photo guidelines",
        "3. Managing inventory",
        "4. Bundles & promos",
        "5. Sales & discounts",
        "6. The home page (Display)",
        "7. Orders",
        "8. Audit — what's happening and what you've earned",
        "9. Keeping the site looking uniform",
        "10. Resetting & troubleshooting",
    ]
    for item in toc:
        s.append(Paragraph(item, BODY))
    s.append(PageBreak())

    # ── 1. Getting started ─────────────────────────────────────
    s.append(Paragraph("1. Getting started", H1))

    s.append(Paragraph("Opening the storefront", H2))
    s.append(Paragraph(
        "The customer-facing store is at the site's main address. "
        "On a developer's laptop running the app locally, that's:",
        BODY))
    s.append(Paragraph("http://localhost:5173", CODE))
    s.append(Paragraph(
        "Once the site is deployed, this will be your real domain (for "
        "example, <i>www.your-store.com</i>). The customer never needs to "
        "know anything else.",
        BODY))

    s.append(Paragraph("Opening the admin portal", H2))
    s.append(Paragraph(
        "Add <b>/admin</b> to the end of your site address. So locally:",
        BODY))
    s.append(Paragraph("http://localhost:5173/admin", CODE))
    s.append(Paragraph(
        "You'll land on the <b>Dashboard</b>. The left sidebar takes you "
        "between the four admin areas: Dashboard, Orders, Stock, and Audit. "
        "There's also a <b>Back to Store</b> link at the bottom of the "
        "sidebar to jump back to the customer view at any time.",
        BODY))
    s.append(Paragraph(
        "Heads up: the admin portal is open to anyone who knows the URL. "
        "There's no login screen. If you publish the site, treat the "
        "/admin link as a private bookmark and only share it with people "
        "you trust to make changes.",
        CALLOUT))

    s.append(Paragraph("What you'll see on first visit", H2))
    s.append(Paragraph(
        "The site ships with a small set of demo data so it doesn't look "
        "empty on day one:",
        BODY))
    s.append(bullets([
        "Five sample products (Travis Scott Jordan, BADBO 1.0, Kobe Proto, Force 1, Foamposite Pro)",
        "Twenty sample orders spread across the past two months",
        "One item already in the cart and two on the wishlist",
        "A filled-in customer profile",
        "Ten sample admin actions in the activity log",
    ]))
    s.append(Paragraph(
        "All of this is real, editable data — you can change or remove "
        "any of it. When you're ready to start fresh, see Section 10.",
        BODY))
    s.append(PageBreak())

    # ── 2. Image guidelines ────────────────────────────────────
    s.append(Paragraph("2. Product photo guidelines", H1))
    s.append(Paragraph(
        "Good product photos are the single biggest factor in how "
        "professional the storefront looks. The site automatically "
        "resizes and compresses what you upload, but it can't fix "
        "bad framing or inconsistent backgrounds. Use these rules and "
        "your store will look polished no matter how many shoes you add.",
        BODY))

    s.append(Paragraph("At a glance", H2))
    s.append(table(
        ["Setting", "Recommendation"],
        [
            ["Shape",           "Square (1:1 ratio)"],
            ["Size",            "1000 × 1000 pixels or larger"],
            ["File type",       "JPEG for normal photos, PNG if you need a transparent background"],
            ["Background",      "Plain white, light grey, or transparent"],
            ["Framing",         "Shoe centered with 10–20% breathing room around it"],
            ["File size",       "Up to about 2 MB per image (larger files still work but take longer to upload)"],
            ["Images per item", "Up to 5"],
        ],
        col_widths=[1.6 * inch, 4.6 * inch],
    ))

    s.append(Paragraph("Why square?", H2))
    s.append(Paragraph(
        "The store grid uses tiles of different sizes — some tall, some "
        "wide, some small squares. A square source image fills every "
        "tile shape cleanly without awkward cropping. Tall (portrait) "
        "or wide (landscape) photos can also work, but they may get "
        "cropped on certain tile sizes.",
        BODY))

    s.append(Paragraph("What happens after you upload", H2))
    s.append(Paragraph(
        "The site automatically:",
        BODY))
    s.append(bullets([
        "Shrinks the photo so the longest side is 900 pixels (no smaller, but no larger either)",
        "Re-saves it as a JPEG at about 78% quality (so it loads fast on slow connections)",
        "Stores it in the site's local memory — there's no separate upload server",
    ]))
    s.append(Paragraph(
        "A 2 MB photo typically ends up at around 60–120 KB after this. "
        "You don't need to do any of this yourself — just upload the "
        "best version you have.",
        BODY))

    s.append(Paragraph("The bundled default images", H2))
    s.append(Paragraph(
        "The five starting products come with default photos that ship "
        "with the site. When you open an item in the admin Inventory tab, "
        "you'll see a small <i>Default</i> tag under the image — that's "
        "the built-in photo. To replace it, click the <b>+</b> button "
        "and upload your own. Your upload will take over wherever the "
        "default was shown.",
        BODY))
    s.append(Paragraph("Tips for consistency", H2))
    s.append(bullets([
        "Photograph every shoe on the same surface and against the same background",
        "Use the same angle for the main image of every product (most stores use a side profile)",
        "If you use multiple photos per product, put them in the same order each time (main, top, sole, side, detail)",
        "Avoid photos with text, watermarks, or price stickers — those will compete with the prices the site already shows",
    ]))
    s.append(PageBreak())

    # ── 3. Inventory ───────────────────────────────────────────
    s.append(Paragraph("3. Managing inventory", H1))
    s.append(Paragraph(
        "Everything in this section lives under <b>Stock → Inventory</b> "
        "in the admin sidebar.",
        BODY))

    s.append(Paragraph("Adding a new product", H2))
    s.append(Paragraph(
        "Click <b>+ Add Item</b> at the top right of the Inventory table. "
        "A form drops down with these fields:",
        BODY))
    s.append(table(
        ["Field", "Required?", "What to put"],
        [
            ["Brand",       "Required",  "The maker (e.g. Nike, Adidas, Travis Scott x Air Jordan)"],
            ["Name",        "Required",  "The model name (e.g. Air Force 1 Low)"],
            ["Colorway",    "Optional",  "The colorway in quotes (e.g. 'Triple White')"],
            ["Price",       "Optional",  "Regular price in dollars; leave blank to enter later"],
            ["Stock",       "Optional",  "How many you have in inventory right now"],
            ["Tag",         "Optional",  "A short label like New Arrival, Best Seller, Limited Edition"],
            ["Description", "Optional",  "1–2 sentence sales pitch shown on the item page"],
            ["Accent",      "Optional",  "A color that matches the shoe; used as a highlight throughout the site"],
            ["Tile size",   "Optional",  "How big this product's tile is on the store grid (see below)"],
            ["Images",      "Optional",  "Upload up to 5 photos (see Section 2)"],
        ],
        col_widths=[1.2 * inch, 0.9 * inch, 4.1 * inch],
    ))

    s.append(Paragraph("Tile sizes — what they mean", H2))
    s.append(table(
        ["Tile size", "Visual impact", "Best for"],
        [
            ["Small",  "Takes 1 column, 1 row",   "Most products"],
            ["Medium", "Takes 1 column, 2 rows",  "Mid-priority products you want to feature a bit"],
            ["Big",    "Takes 2 columns, 3 rows", "Hero products, limited editions, anything you really want to push"],
        ],
        col_widths=[0.9 * inch, 2.0 * inch, 3.3 * inch],
    ))
    s.append(Paragraph(
        "A good rule of thumb: <b>1 big tile</b>, <b>2 mediums</b>, and the "
        "rest <b>small</b>. That's how the starter store is set up, and it "
        "creates a clean mosaic. Too many bigs and the grid feels noisy; "
        "all smalls and nothing stands out.",
        BODY))

    s.append(Paragraph("Editing existing products", H2))
    s.append(Paragraph(
        "Click <b>Edit</b> on any row. Every field becomes editable in "
        "place. Changes save automatically when you click out of a field "
        "(no <b>Save</b> button needed). Click <b>Done</b> to leave edit mode.",
        BODY))

    s.append(Paragraph("Stock controls", H2))
    s.append(Paragraph(
        "The <b>−</b> and <b>+</b> buttons next to the stock number "
        "decrease or increase the count by one. The count goes red when "
        "stock drops to 3 or fewer — that same item will also show up in "
        "the <b>Low Stock</b> list on the Dashboard.",
        BODY))

    s.append(Paragraph("Removing a product", H2))
    s.append(Paragraph(
        "Click <b>Remove</b> on any row. The product is deleted "
        "immediately. If the product was part of a bundle, it's also "
        "automatically removed from that bundle. If it was on the home "
        "carousel, its slot is freed up.",
        BODY))
    s.append(Paragraph(
        "There is no undo. Be sure before clicking Remove.",
        CALLOUT))
    s.append(PageBreak())

    # ── 4. Bundles ─────────────────────────────────────────────
    s.append(Paragraph("4. Bundles & promos", H1))

    s.append(Paragraph("What's a bundle?", H2))
    s.append(Paragraph(
        "A bundle groups two or more existing products together at a "
        "single combined price. They show up on the storefront as "
        "extra-large tiles with a colored badge, so customers see them "
        "first. Use them for buy-two-get-discount deals, themed "
        "collections, or holiday promos.",
        BODY))

    s.append(Paragraph("Creating a bundle", H2))
    s.append(Paragraph(
        "Go to <b>Stock → Bundles</b> and click <b>+ Add Bundle</b>. "
        "Fill in:",
        BODY))
    s.append(table(
        ["Field", "What to put"],
        [
            ["Name",         "What customers will see (e.g. \"Summer Three-Pack\")"],
            ["Description",  "A short pitch — what's in it and why it's a deal"],
            ["Bundle price", "The single total price the customer pays for everything in the bundle"],
            ["Tag",          "A short badge label (defaults to BUNDLE)"],
            ["Accent",       "Color for the bundle's badge and accents on the tile"],
            ["Items",        "Pick from your existing products — tick the boxes for each one to include"],
            ["Image",        "One photo representing the bundle (the products, a group shot, etc.)"],
        ],
        col_widths=[1.3 * inch, 4.9 * inch],
    ))

    s.append(Paragraph("How customers buy a bundle", H2))
    s.append(Paragraph(
        "When a customer clicks <b>Add to Cart</b> on a bundle tile, "
        "they're walked through a quick step-by-step picker — one screen "
        "per item to choose a size. After the last item, all of them get "
        "added to the cart together. The cart shows them as individual "
        "lines but they were bought as one purchase.",
        BODY))

    s.append(Paragraph("Removing a bundle", H2))
    s.append(Paragraph(
        "Click <b>Remove</b> next to any bundle. The bundle disappears "
        "from the storefront immediately. The individual products in it "
        "are <b>not</b> removed — they continue to sell on their own.",
        BODY))
    s.append(PageBreak())

    # ── 5. Sales ───────────────────────────────────────────────
    s.append(Paragraph("5. Sales & discounts", H1))
    s.append(Paragraph(
        "Mark individual products as on-sale and set their sale price "
        "from <b>Stock → Sales</b>.",
        BODY))

    s.append(Paragraph("Putting a product on sale", H2))
    s.append(bullets([
        "Find the product in the Sales table",
        "Type the sale price into the <b>Sale price</b> column",
        "Flip the <b>On Sale</b> toggle to On",
    ]))
    s.append(Paragraph(
        "The sale price must be less than the regular price. If you "
        "type something higher (or equal), the row shows a red "
        "<b>Must be &lt; $X.XX</b> badge in the Discount column and the "
        "sale won't display on the storefront until you correct it.",
        BODY))

    s.append(Paragraph("How sales appear to customers", H2))
    s.append(Paragraph(
        "Anywhere a price is shown on the storefront, an on-sale product "
        "displays both prices — the original price struck through in "
        "grey, and the new sale price in red right beside it:",
        BODY))
    s.append(Paragraph("$229.99 → <font color='#c0392b'>$189.99</font>",
                       ParagraphStyle("SaleExample", parent=BODY,
                                      fontSize=14, textColor=FG2,
                                      backColor=BG2, borderPadding=10,
                                      spaceAfter=10)))
    s.append(Paragraph(
        "This shows on the home carousel, the store grid, the item "
        "detail page, the wishlist, and inside the size-pick panel. "
        "The cart total uses the sale price too.",
        BODY))

    s.append(Paragraph("Pricing in the cart", H2))
    s.append(Paragraph(
        "When a customer adds a sale item to their cart, the sale price "
        "is locked in at that moment. If you end the sale later (or "
        "change the price), what's already in the customer's cart stays "
        "at the price they saw when they added it. This is intentional — "
        "it prevents customers from being surprised at checkout.",
        BODY))

    s.append(Paragraph("Taking a product off sale", H2))
    s.append(Paragraph(
        "Flip the <b>On Sale</b> toggle to Off. The product immediately "
        "shows only its regular price on the storefront. The sale price "
        "you'd entered stays in the field, so you can re-enable the "
        "same discount later without retyping.",
        BODY))
    s.append(PageBreak())

    # ── 6. Home display ────────────────────────────────────────
    s.append(Paragraph("6. The home page (Display)", H1))
    s.append(Paragraph(
        "The home page shows a single product at a time in a big hero "
        "carousel, cycling through a hand-picked lineup. You control "
        "which products appear and what color each one uses from "
        "<b>Stock → Display</b>.",
        BODY))

    s.append(Paragraph("Picking carousel products", H2))
    s.append(Paragraph(
        "Each slot in the Display tab is a slot on the home carousel. "
        "Use the dropdown to choose which product appears in that slot. "
        "You can have any number of slots (typically 4–6 feels right). "
        "Bundles can't go in the carousel — they're already big tiles "
        "on the store grid.",
        BODY))

    s.append(Paragraph("Accent colors", H2))
    s.append(Paragraph(
        "Each slot has its own accent color. This is what tints the "
        "<b>NEW ARRIVAL</b> / <b>BEST SELLER</b> / etc. badge, the size "
        "selector outlines, and the <b>Add to Cart</b> button on the "
        "home carousel for that slide. Pick a color that complements "
        "the shoe in the photo — usually something pulled from the "
        "shoe itself.",
        BODY))

    s.append(Paragraph("Reordering", H2))
    s.append(Paragraph(
        "Slots are shown in carousel order, top to bottom. Use the "
        "<b>Move Up</b> / <b>Move Down</b> arrows on each slot to "
        "rearrange. The customer sees them left-to-right in the same "
        "order.",
        BODY))

    s.append(Paragraph("If you remove a product that's on the carousel", H2))
    s.append(Paragraph(
        "The slot is automatically removed too. The accent color you'd "
        "set for it is also cleared, so the remaining slots stay aligned "
        "with their intended colors.",
        BODY))
    s.append(PageBreak())

    # ── 7. Orders ──────────────────────────────────────────────
    s.append(Paragraph("7. Orders", H1))
    s.append(Paragraph(
        "Everything about who bought what is under <b>Orders</b> in the "
        "sidebar.",
        BODY))

    s.append(Paragraph("The calendar", H2))
    s.append(Paragraph(
        "The monthly calendar on the left shows a small dot under every "
        "day that has at least one order. Click any day to filter the "
        "order list to just that day's orders. Use the arrows above the "
        "calendar to flip between months.",
        BODY))

    s.append(Paragraph("Filtering and searching", H2))
    s.append(Paragraph(
        "Above the order list you'll find:",
        BODY))
    s.append(bullets([
        "<b>Search box</b> — finds orders by customer name, product, or order ID",
        "<b>Status filter</b> — Delivered, Shipped, Processing, or All",
        "<b>Completion filter</b> — All, Marked Complete, or Marked Incomplete",
    ]))
    s.append(Paragraph(
        "Filters stack — you can search for a customer name <i>and</i> "
        "filter by status at the same time.",
        BODY))

    s.append(Paragraph("Marking orders complete", H2))
    s.append(Paragraph(
        "Each order row has a <b>Mark Complete</b> / <b>Mark Incomplete</b> "
        "button. This is your own personal checkmark — independent of "
        "the order's shipping status. Use it to track things like \"I've "
        "personally followed up on this customer\" or \"this order has "
        "been packed and is ready to ship\". The choice is recorded in "
        "the activity log (see Section 8).",
        BODY))
    s.append(PageBreak())

    # ── 8. Audit ───────────────────────────────────────────────
    s.append(Paragraph("8. Audit — what's happening and what you've earned", H1))
    s.append(Paragraph(
        "The Audit page is two things in one: a running feed of "
        "everything happening in the store, and a financial summary of "
        "what the store has earned. The period filter at the top — "
        "Monthly, Quarterly, or Yearly — scopes both halves.",
        BODY))

    s.append(Paragraph("The activity feed", H2))
    s.append(Paragraph(
        "Every meaningful action in the store is automatically recorded. "
        "You don't need to do anything for this to happen.",
        BODY))
    s.append(Paragraph("What gets logged:", H2))
    s.append(table(
        ["Category", "Example events"],
        [
            ["Orders",  "Each customer order; orders marked complete or incomplete"],
            ["Stock",   "Stock counts changing up or down"],
            ["Sales",   "Products put on sale or taken off; sale prices being set"],
            ["Catalog", "Products added, removed, renamed, or repriced"],
            ["Bundles", "Bundles created or removed"],
        ],
        col_widths=[1.0 * inch, 5.2 * inch],
    ))
    s.append(Paragraph(
        "Click the chip buttons above the feed (All / Orders / Stock / "
        "Sales / Catalog / Bundles) to filter to just one category. "
        "Each chip shows how many events are in that category for the "
        "current period.",
        BODY))

    s.append(Paragraph("Financial breakdowns", H2))
    s.append(Paragraph(
        "Below the activity feed, four panels summarize the period you "
        "have selected:",
        BODY))
    s.append(bullets([
        "<b>Summary cards</b> — gross revenue, estimated tax, net revenue, total orders, average order value",
        "<b>Period breakdown</b> — orders, revenue, and tax for each month / quarter / year",
        "<b>Revenue by product</b> — top-selling products by units and revenue, biggest sellers first",
        "<b>Orders by status</b> — count and revenue split between Delivered, Shipped, and Processing",
        "<b>Full order ledger</b> — every order in the period as a row, with status, totals, tax, and net",
    ]))
    s.append(Paragraph(
        "The tax estimate uses a flat 15% rate. Adjust this in the "
        "site's source code if your real rate is different (the "
        "developer who set up the site can help).",
        CALLOUT))
    s.append(PageBreak())

    # ── 9. Uniform look ───────────────────────────────────────
    s.append(Paragraph("9. Keeping the site looking uniform", H1))
    s.append(Paragraph(
        "Small, consistent choices add up to a site that feels "
        "professional. None of these are required — they're habits that "
        "make a difference.",
        BODY))

    s.append(Paragraph("Photos", H2))
    s.append(bullets([
        "Always the same background — pick one (clean white is the safest) and stick with it",
        "Same camera angle for the main shot of every product (side profile is the standard)",
        "If you upload multiple photos per product, use the same order each time so customers learn to expect it",
        "Crop tightly with consistent padding — see Section 2",
    ]))

    s.append(Paragraph("Naming and copy", H2))
    s.append(bullets([
        "Use the same format for colorway names — most stores use single quotes, like 'Bred' or 'Triple White'",
        "Keep brand names capitalized exactly the same way each time (Adidas, not adidas)",
        "Description lengths around 1–2 sentences read best in the layout",
        "Tags are short — 1–2 words maximum (New Arrival, Best Seller, Limited Edition, Sale, Heritage)",
    ]))

    s.append(Paragraph("Tile sizes", H2))
    s.append(bullets([
        "Pick big tiles for your absolute showpieces — usually 1 or 2 in the store at a time",
        "Use medium for products you want to give a small spotlight to",
        "Default to small for everything else; small is good, it's the workhorse",
        "Resist the urge to make everything big — the grid loses its rhythm",
    ]))

    s.append(Paragraph("Accent colors", H2))
    s.append(bullets([
        "Pull the accent from the shoe itself — the dominant non-black color usually works",
        "If a shoe is pure black/white, use a deep neutral like #08060d",
        "Avoid neon or fluorescent accents unless the shoe genuinely has them — they overwhelm the page",
        "Use the same accent for the carousel slot and the product itself so they feel connected",
    ]))
    s.append(PageBreak())

    # ── 10. Reset & troubleshoot ───────────────────────────────
    s.append(Paragraph("10. Resetting & troubleshooting", H1))

    s.append(Paragraph("Starting completely fresh", H2))
    s.append(Paragraph(
        "Everything you've changed in the admin is stored in your "
        "browser. To wipe everything and start over with just the "
        "original demo data:",
        BODY))
    s.append(bullets([
        "Open the storefront or admin in your browser",
        "Open the browser's developer tools (usually <b>F12</b> or <b>Ctrl+Shift+I</b>)",
        "Click the <b>Console</b> tab",
        "Paste in: <font face='Courier'>localStorage.clear(); location.reload()</font>",
        "Press Enter",
    ]))
    s.append(Paragraph(
        "The site reloads with the original five products, sample orders, "
        "and a fresh activity log.",
        BODY))
    s.append(Paragraph(
        "This wipes every product, photo, sale, bundle, and activity log "
        "entry you've created. There is no undo. Export anything you "
        "want to keep first.",
        CALLOUT))

    s.append(Paragraph("Common things and what to check", H2))
    s.append(table(
        ["Problem", "Try this"],
        [
            ["A product I added isn't showing on the storefront",
             "Refresh the storefront tab — the store reads the catalog fresh on each page load."],
            ["My uploaded photo isn't appearing",
             "Make sure you actually clicked outside the upload area after the file was picked. The image should appear as a small thumbnail in the row immediately."],
            ["Sale price isn't showing on the storefront",
             "Confirm the On Sale toggle is on, and that the sale price is less than the regular price (no red \"Must be <\" badge)."],
            ["Home carousel is empty",
             "Go to Stock → Display and pick at least one product for the carousel. If you removed all of them, the home page shows an empty state with a Browse Store button."],
            ["I see a \"Something went wrong\" screen",
             "Click Reload Page. If it keeps happening, take note of the error message shown and report it to whoever set up the site for you."],
            ["The 404 \"Page not found\" page shows up",
             "You've typed an address that doesn't exist. Click Back to Home (or Back to Dashboard if you're in admin) to recover."],
        ],
        col_widths=[2.3 * inch, 3.9 * inch],
    ))

    s.append(Paragraph("Storage limits", H2))
    s.append(Paragraph(
        "Your product photos are stored inside your browser, which has a "
        "limit of around 5 megabytes. Thanks to the auto-compression, a "
        "store with 20+ products each having 5 photos still fits "
        "comfortably. If you ever start hitting the limit, the simplest "
        "fix is to keep fewer than 5 photos on products that don't need "
        "all five.",
        BODY))

    s.append(Paragraph("Getting help", H2))
    s.append(Paragraph(
        "If something in this manual doesn't match what you're seeing on "
        "screen, or if you have questions about anything not covered "
        "here, reach out to the developer who set up the site for you. "
        "For technical reference material (file structure, design "
        "tokens, architecture), see <b>README.md</b> in the project folder.",
        BODY))

    # ── Build ────────────────────────────────────────────────
    doc.build(s, onFirstPage=page_footer, onLaterPages=page_footer)
    print(f"Wrote {OUTPUT}  ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
