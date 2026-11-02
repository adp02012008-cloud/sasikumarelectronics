export default async function handler(req, res) {
  const host = req.headers?.host || "sasikumarelectronics.vercel.app";
  const url = new URL(req.url, `https://${host}`);
  const id = req.query?.id || url.searchParams.get("id");

  if (!id) {
    return res.redirect(302, "/");
  }

  try {
    const apiRes = await fetch(
      `https://sasikumarelectronics.onrender.com/api/products/${id}`
    );
    const data = await apiRes.json();

    if (!data || !data.success || !data.product) {
      return res.redirect(302, `/products/${id}`);
    }

    const product = data.product;
    const name = product.name || "Product";
    const price = product.price != null ? Number(product.price).toLocaleString("en-IN") : "";
    const description = (product.description || `Buy ${name} at the best price on Sasikumar Electronics.`)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    let rawImageUrl = product.images?.[0]?.url || "";
    let ogImageUrl = rawImageUrl;

    // Optimize image for WhatsApp and social crawlers (600x600 jpeg under 100KB)
    if (rawImageUrl.includes("cloudinary.com") && rawImageUrl.includes("/upload/")) {
      ogImageUrl = rawImageUrl.replace(
        "/upload/",
        "/upload/w_600,h_600,c_pad,b_white,q_auto,f_jpg/"
      );
    }

    if (!ogImageUrl) {
      ogImageUrl = "https://sasikumarelectronics.vercel.app/logo.png";
    }

    const title = `${name}${price ? ` - ₹${price}` : ""} | Sasikumar Electronics`;
    const shareUrl = `https://sasikumarelectronics.vercel.app/products/${id}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );

    const escape = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Sasikumar Electronics">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="₹${price} - ${escape(description)}">
  <meta property="og:image" content="${escape(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escape(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="600">
  <meta property="og:image:alt" content="${escape(name)}">
  <meta property="og:url" content="${escape(shareUrl)}">
  <meta property="product:price:amount" content="${product.price || 0}">
  <meta property="product:price:currency" content="INR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@sasikumarelec">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="₹${price} - ${escape(description)}">
  <meta name="twitter:image" content="${escape(ogImageUrl)}">
  <meta name="twitter:image:alt" content="${escape(name)}">

  <script>
    if (!/([wW]hats[aA]pp|facebookexternalhit|[fF]acebot|[tT]witterbot|[tT]elegram[bB]ot|[lL]inked[iI]n[bB]ot|[sS]lackbot|[dD]iscordbot|[gG]ooglebot|[bB]ingbot|[aA]pplebot|[pP]interest|[bB]aiduspider|[sS]kype[uU]ri[pP]review|[yY]andex[bB]ot|[eE]mbedly|[qQ]uora|vkShare)/.test(navigator.userAgent)) {
      window.location.replace("${escape(shareUrl)}");
    }
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
  <div style="background: white; border-radius: 20px; padding: 32px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    <img src="${escape(ogImageUrl)}" alt="${escape(name)}" style="width: 220px; height: 220px; object-fit: contain; margin-bottom: 20px; border-radius: 12px; background: #fff;">
    <h1 style="font-size: 20px; margin: 0 0 8px; color: #0f172a;">${escape(name)}</h1>
    <p style="font-size: 24px; font-weight: 800; color: #2563eb; margin: 0 0 14px;">₹${price}</p>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 24px; line-height: 1.5;">${escape(description)}</p>
    <a href="${escape(shareUrl)}" style="display: block; background: #2563eb; color: white; padding: 14px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">View on Store</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error("OG Generator Error:", err);
    return res.redirect(302, `/products/${id}`);
  }
}
