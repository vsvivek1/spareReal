"use client";

import { Suspense, useState } from "react";

import { useSearchParams } from "next/navigation";

import ListingsTab from "@/components/account/ListingsTab";
import RequestsTab from "@/components/account/RequestsTab";
import VehiclesTab from "@/components/account/VehiclesTab";

type Tab = "listings" | "requests" | "vehicles";

const TABS: { id: Tab; label: string }[] = [
  { id: "listings", label: "Listings" },
  { id: "requests", label: "Requests" },
  { id: "vehicles", label: "Vehicles" },
];

function MyAccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : "listings"
  );

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">My Account</h1>
          <p className="gx-dash-sub">
            Your listings, requests, and vehicles, all in one place.
          </p>
        </div>

        <div className="gx-tabs" style={{ maxWidth: 420 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                "gx-tab" + (activeTab === tab.id ? " gx-tab-active" : "")
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "listings" && <ListingsTab />}
        {activeTab === "requests" && <RequestsTab />}
        {activeTab === "vehicles" && <VehiclesTab />}
      </div>
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="gx-page">
          <div className="gx-page-center">
            <span className="gx-spinner" />
            Loading...
          </div>
        </div>
      }
    >
      <MyAccountContent />
    </Suspense>
  );
}
