"use client";

import { useEffect, useState } from "react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const [sales, setSales] = useState<any[]>([]);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const salesQuery = query(
          collection(db, "sales"),
          where("sellerId", "==", user.uid)
        );

        const salesSnapshot = await getDocs(salesQuery);

        const salesItems: any[] = [];

        salesSnapshot.forEach((doc) => {
          salesItems.push({ id: doc.id, ...doc.data() });
        });

        salesItems.sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1));

        setSales(salesItems);

        const listingsQuery = query(
          collection(db, "spareListings"),
          where("sellerId", "==", user.uid)
        );

        const listingsSnapshot = await getDocs(listingsQuery);

        setListingCount(listingsSnapshot.size);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="gx-page">
        <div className="gx-page-center">
          <span className="gx-spinner" />
          Loading...
        </div>
      </div>
    );
  }

  const unitsSold = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const totalProfit = sales.reduce(
    (sum, sale) => sum + (sale.price || 0) - (sale.acquisitionCost || 0),
    0
  );

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Sales Dashboard</h1>
          <p className="gx-dash-sub">
            Your inventory performance and revenue at a glance.
          </p>
        </div>

        <div className="gx-stat-grid">
          <div className="gx-stat-tile">
            <div className="gx-stat-tile-icon">💰</div>
            <p className="gx-stat-tile-value">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="gx-stat-tile-label">Total Revenue</p>
          </div>

          <div className="gx-stat-tile">
            <div className="gx-stat-tile-icon">📦</div>
            <p className="gx-stat-tile-value">{unitsSold}</p>
            <p className="gx-stat-tile-label">Units Sold</p>
          </div>

          <div className="gx-stat-tile">
            <div className="gx-stat-tile-icon">📈</div>
            <p className="gx-stat-tile-value">
              ₹{totalProfit.toLocaleString("en-IN")}
            </p>
            <p className="gx-stat-tile-label">Total Profit</p>
            <p
              className="gx-stat-tile-label"
              style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}
            >
              Assumes ₹0 cost where not recorded
            </p>
          </div>

          <div className="gx-stat-tile">
            <div className="gx-stat-tile-icon">🗂️</div>
            <p className="gx-stat-tile-value">{listingCount}</p>
            <p className="gx-stat-tile-label">Total Listings</p>
          </div>
        </div>

        <div className="gx-section-head">
          <h2 className="gx-section-title">Recent sales</h2>
        </div>

        {sales.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🧾</div>
            <h2 className="gx-empty-state-title">No sales yet</h2>
            <p className="gx-empty-state-text">
              Confirmed sales from your listings will show up here, along
              with your revenue and profit.
            </p>
          </div>
        ) : (
          <div className="gx-sales-table-wrap">
            <table className="gx-sales-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Profit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.title}</td>
                    <td>₹{(sale.price || 0).toLocaleString("en-IN")}</td>
                    <td>
                      {sale.acquisitionCost == null
                        ? "—"
                        : `₹${(
                            (sale.price || 0) - sale.acquisitionCost
                          ).toLocaleString("en-IN")}`}
                    </td>
                    <td>
                      {new Date(sale.soldAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
