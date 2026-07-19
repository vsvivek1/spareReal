"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { getAllServices } from "@/services/workshopService";

import {
  SERVICE_TYPES,
  OTHER_SERVICE,
  normalizeServiceSlug,
} from "@/lib/serviceTypes";

export default function ServicesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hasOther, setHasOther] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getAllServices();

        const tally: Record<string, number> = {};

        all.forEach((s: any) => {
          const slug = normalizeServiceSlug(s);
          tally[slug] = (tally[slug] || 0) + 1;
        });

        setCounts(tally);

        const knownSlugs = new Set(SERVICE_TYPES.map((t) => t.slug));
        setHasOther(
          all.some((s: any) => !knownSlugs.has(normalizeServiceSlug(s)))
        );
      } catch (error) {
        console.log(error);
      }
    };

    load();
  }, []);

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header-row">
          <div>
            <h1 className="gx-dash-title">Services</h1>
            <p className="gx-dash-sub">
              Find nearby workshops, washing and painting centers, petrol
              pumps, tyre service and more.
            </p>
          </div>

          <Link href="/add-service">
            <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
              + List my service
            </button>
          </Link>
        </div>

        <div className="gx-grid">
          {SERVICE_TYPES.map((type) => (
            <Link
              key={type.slug}
              href={`/services/${type.slug}`}
              className="gx-part-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="gx-part-body">
                <div style={{ fontSize: 40, marginBottom: 8 }}>{type.icon}</div>
                <h3 className="gx-part-name">{type.label}</h3>
                <p className="gx-part-meta">{type.blurb}</p>
                <p className="gx-part-meta" style={{ marginTop: 6 }}>
                  {counts[type.slug]
                    ? `${counts[type.slug]} listed`
                    : "None yet — be the first"}
                </p>
              </div>
            </Link>
          ))}

          {hasOther && (
            <Link
              href={`/services/${OTHER_SERVICE.slug}`}
              className="gx-part-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="gx-part-body">
                <div style={{ fontSize: 40, marginBottom: 8 }}>
                  {OTHER_SERVICE.icon}
                </div>
                <h3 className="gx-part-name">{OTHER_SERVICE.label}</h3>
                <p className="gx-part-meta">{OTHER_SERVICE.blurb}</p>
                <p className="gx-part-meta" style={{ marginTop: 6 }}>
                  {counts[OTHER_SERVICE.slug]
                    ? `${counts[OTHER_SERVICE.slug]} listed`
                    : "Custom categories"}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
