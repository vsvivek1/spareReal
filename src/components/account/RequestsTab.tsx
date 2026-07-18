"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function RequestsTab() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "spareRequests"),
          where("requesterId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const items: any[] = [];

        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        setRequests(items);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="gx-page-center">
        <span className="gx-spinner" />
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="gx-page-header-row">
        <div>
          <h2 className="gx-part-name" style={{ fontSize: 20 }}>
            My Requests
          </h2>
          <p className="gx-dash-sub" style={{ margin: 0 }}>
            Spare parts you&apos;ve asked sellers to find.
          </p>
        </div>

        <Link href="/make-request">
          <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
            + Request Spare
          </button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="gx-empty-state">
          <div className="gx-empty-state-icon">🔍</div>
          <h2 className="gx-empty-state-title">No requests yet</h2>
          <p className="gx-empty-state-text">
            Can&apos;t find a part? Post a request and let sellers come to
            you.
          </p>

          <Link href="/make-request">
            <button
              className="gx-btn gx-btn-primary"
              style={{ width: "auto", margin: "0 auto" }}
            >
              + Request Spare
            </button>
          </Link>
        </div>
      ) : (
        <div className="gx-grid">
          {requests.map((item) => (
            <div className="gx-request-card" key={item.id}>
              <h3 className="gx-request-title">{item.sparePart}</h3>
              <p className="gx-request-budget">₹{item.budget}</p>

              <div className="gx-request-meta-row">
                <span className="gx-request-meta-label">Brand</span>
                <span className="gx-request-meta-value">{item.brand}</span>
              </div>

              <div className="gx-request-meta-row">
                <span className="gx-request-meta-label">Model</span>
                <span className="gx-request-meta-value">{item.model}</span>
              </div>

              <div className="gx-request-meta-row">
                <span className="gx-request-meta-label">Year</span>
                <span className="gx-request-meta-value">{item.year}</span>
              </div>

              <div className="gx-request-meta-row">
                <span className="gx-request-meta-label">Condition</span>
                <span className="gx-request-meta-value">
                  {item.condition}
                </span>
              </div>

              {item.description && (
                <p className="gx-request-desc">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
