import { useState, useEffect } from "react";

const ShareModal = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowQR(false);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const origin = window.location.origin;
  const shareUrl = `${origin}/products/${product._id}`;
  const priceFormatted = Number(product.price || 0).toLocaleString("en-IN");
  const shareTitle = `${product.name} | Sasikumar Electronics`;
  const shareText = `Check out ${product.name} on Sasikumar Electronics for ₹${priceFormatted}!`;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      iconBg: "#25D366",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.77.814 2.79.814 3.18 0 5.766-2.587 5.767-5.767.001-3.182-2.585-5.769-5.766-5.769zm3.385 8.169c-.14.394-.712.723-1.042.768-.31.042-.693.076-2.006-.468-1.554-.645-2.544-2.223-2.622-2.327-.077-.104-.633-.842-.633-1.608 0-.765.402-1.142.545-1.298.143-.157.312-.196.417-.196.104 0 .209.001.299.006.096.005.226-.036.353.27.13.313.443 1.08.482 1.16.039.079.065.171.013.275-.052.104-.078.169-.156.26-.078.091-.164.204-.235.274-.078.077-.16.161-.069.317.091.156.405.668.868 1.081.597.533 1.101.699 1.258.777.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.351-.078.143.052.91.429 1.066.507.156.078.26.117.299.182.039.065.039.378-.101.772zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.439 5.176L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      name: "Telegram",
      iconBg: "#0088cc",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "X (Twitter)",
      iconBg: "#0f172a",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      iconBg: "#1877F2",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Email",
      iconBg: "#ea4335",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      url: `mailto:?subject=${encodeURIComponent(product.name + " - Sasikumar Electronics")}&body=${encodeURIComponent(shareText + "\n\nProduct Link: " + shareUrl)}`,
    },
  ];

  return (
    <div className="order-modal-bg share-modal-bg" onClick={onClose}>
      <div
        className="order-modal share-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-head share-modal-head">
          <div className="share-head-text">
            <h2>Share this product</h2>
            <p>Send details to friends or share on social media</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Product mini card */}
        <div className="share-product-preview">
          <img
            src={product.images?.[0]?.url || "/favicon.svg"}
            alt={product.name}
            className="share-preview-thumb"
          />
          <div className="share-preview-info">
            <span className="share-preview-brand">{product.brand || product.category || "Electronics"}</span>
            <h4 className="share-preview-title">{product.name}</h4>
            <div className="share-preview-price-row">
              <span className="share-price">₹{priceFormatted}</span>
              {product.stock > 0 ? (
                <span className="share-stock-tag in-stock">In Stock</span>
              ) : (
                <span className="share-stock-tag out-stock">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="share-channels-section">
          <span className="share-section-title">Share via:</span>
          <div className="share-channels-grid">
            {shareChannels.map((ch) => (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="share-channel-btn"
              >
                <div
                  className="channel-icon-circle"
                  style={{ backgroundColor: ch.iconBg }}
                >
                  {ch.icon}
                </div>
                <span className="channel-name">{ch.name}</span>
              </a>
            ))}

            {typeof navigator !== "undefined" && Boolean(navigator.share) && (
              <button
                type="button"
                className="share-channel-btn native-share-btn"
                onClick={handleNativeShare}
              >
                <div className="channel-icon-circle" style={{ backgroundColor: "#2563eb" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </div>
                <span className="channel-name">More Apps</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Link Bar */}
        <div className="share-copy-section">
          <span className="share-section-title">Or copy product link:</span>
          <div className="share-copy-bar">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="share-url-input"
              onClick={(e) => e.target.select()}
            />
            <button
              type="button"
              className={`share-copy-btn ${copied ? "copied" : ""}`}
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <div className="share-copied-toast">
              Link copied to clipboard! You can now paste and share anywhere.
            </div>
          )}
        </div>

        {/* QR Code toggle (Amazon style) */}
        <div className="share-qr-section">
          <button
            type="button"
            className="share-qr-toggle"
            onClick={() => setShowQR(!showQR)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>{showQR ? "Hide QR Code" : "Show QR Code (Scan to open on phone)"}</span>
          </button>

          {showQR && (
            <div className="share-qr-display">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                alt="Product QR Code"
                className="share-qr-image"
                loading="lazy"
              />
              <p>Scan with your phone&apos;s camera to view this product instantly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
