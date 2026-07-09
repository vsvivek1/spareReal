export default function AboutPage() {
  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 720 }}>
        <div className="gx-page-header" style={{ textAlign: "center" }}>
          <h1 className="gx-dash-title">About spareX</h1>
          <p className="gx-dash-sub">
            Building a more trustworthy way to buy and sell vehicle spare
            parts.
          </p>
        </div>

        <div className="gx-content-card">
          <p>
            spareX is a marketplace built for vehicle owners, spare part
            sellers, and workshops to find each other without the usual
            back-and-forth. Whether you're hunting down a hard-to-find
            part or listing your inventory for buyers nearby, spareX
            connects you directly.
          </p>

          <p>
            We started spareX to solve a simple problem: finding genuine
            spare parts at a fair price shouldn't take days of phone calls
            and dead ends. By bringing sellers, buyers, and workshops onto
            one platform, we make the whole process faster and more
            transparent.
          </p>

          <p>
            Every listing is reviewed for basic quality, every seller is
            identity-verified through phone number, and every request you
            post reaches sellers directly — no middlemen, no guesswork.
          </p>
        </div>
      </div>
    </div>
  );
}
