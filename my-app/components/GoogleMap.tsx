"use client";
import { useEffect, useRef } from "react";

const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Google Maps API script
    if (!document.querySelector("script#google-maps")) {
      const script = document.createElement("script");
      script.id = "google-maps";
      script.src = `https://maps.googleapis.com/maps/api/js`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      if (window.google) initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current) return;

      const ulaanbaatarCoordinates = { lat: 47.918873, lng: 106.917153 };

      const map = new google.maps.Map(mapRef.current, {
        center: ulaanbaatarCoordinates,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 11,
      });

      const waqiMapOverlay = new google.maps.ImageMapType({
        getTileUrl: (coord: google.maps.Point, zoom: number) =>
          `https://tiles.aqicn.org/tiles/usepa-aqi/${zoom}/${coord.x}/${coord.y}.png?token=_TOKEN_ID_`,
        name: "Air Quality",
      });

      map.overlayMapTypes.insertAt(0, waqiMapOverlay);
    }

    // Load the AQICN widget script
    if (!document.querySelector("script#aqicn-widget")) {
      const widgetScript = document.createElement("script");
      widgetScript.id = "aqicn-widget";
      widgetScript.src = "https://aqicn.org/widget/scripts/aqi-widget.js";
      widgetScript.async = true;
      widgetScript.onload = initializeWidget;
      document.body.appendChild(widgetScript);
    }

    function initializeWidget() {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = `
          <div id="aqi-widget" style="width:100%; height:auto;">
            <iframe
              src="https://aqicn.org/widget/view/?token=_TOKEN_ID_&city=ulaanbaatar"
              style="border:0; width:100%; height:100%;"
            ></iframe>
          </div>
        `;
      }
    }

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div id="map" ref={mapRef} style={{ height: "70%", width: "100%" }} />
      <div ref={widgetRef} style={{ height: "30%", width: "100%" }} />
    </div>
  );
};

export default GoogleMap;
