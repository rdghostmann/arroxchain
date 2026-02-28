"use client";
import React, { useEffect } from "react";

const Tawk = () => {
  useEffect(() => {
    // Ensure script loads only in the browser
    if (typeof window === "undefined") return;

    // Prevent script from being added twice
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = "https://embed.tawk.to/696100a5c157871980786a0f/1jehel1ui";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    return () => {
      // Optional cleanup if component is unmounted
      script.remove();
    };
  }, []);

  return (
    <div className="z-100 fixed bottom-0 right-0" title="Chat with us">
      {/* Tawk widget loads automatically; no UI needed */}
    </div>
  );
};

export default Tawk;
