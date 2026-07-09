export default function ContactPage() {
  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 640 }}>
        <div className="gx-page-header" style={{ textAlign: "center" }}>
          <h1 className="gx-dash-title">Get in touch</h1>
          <p className="gx-dash-sub">
            Questions, feedback, or a listing that needs a closer look?
            We're here to help.
          </p>
        </div>

        <div className="gx-content-card">
          <ul className="gx-contact-list">
            <li>
              <span className="gx-contact-icon">✉️</span>
              <div>
                <div style={{ fontWeight: 700 }}>Email</div>
                <div style={{ color: "var(--gx-text-dim)", fontSize: 13.5 }}>
                  support@sparex.app
                </div>
              </div>
            </li>

            <li>
              <span className="gx-contact-icon">📞</span>
              <div>
                <div style={{ fontWeight: 700 }}>Phone</div>
                <div style={{ color: "var(--gx-text-dim)", fontSize: 13.5 }}>
                  +91 00000 00000
                </div>
              </div>
            </li>

            <li>
              <span className="gx-contact-icon">📍</span>
              <div>
                <div style={{ fontWeight: 700 }}>Based in</div>
                <div style={{ color: "var(--gx-text-dim)", fontSize: 13.5 }}>
                  Kozhikode, Kerala, India
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
