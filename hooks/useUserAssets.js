// hooks/useUserAssets.js
"use client";

import { useState, useEffect } from "react";

export default function useUserAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    async function fetchAssets() {
      try {
        const res = await fetch("/api/user-assets");
        const data = await res.json();
        setAssets(data.assets || []);
      } catch (err) {
        console.error(err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
    interval = setInterval(fetchAssets, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, []);

  return { assets, loading };
}