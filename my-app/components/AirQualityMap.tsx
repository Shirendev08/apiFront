"use client";
import { useEffect, useRef } from "react";

const AirQualityMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current!, {
        center: new google.maps.LatLng(47.918873, 106.917153),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 11,
      });

      const waqiMapOverlay = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) =>
          `https://tiles.aqicn.org/tiles/usepa-aqi/${zoom}/${coord.x}/${coord.y}.png?token=YOUR_VALID_TOKEN`,
        name: "Air Quality",
      });

      map.overlayMapTypes.insertAt(0, waqiMapOverlay);
    };

    const loadGoogleMapsScript = () => {
      if (document.querySelector("#google-maps-script")) {
        // Script is already loaded
        if (window.google) initializeMap();
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = "https://maps.googleapis.com/maps/api/js";
      script.async = true;
      script.defer = true;

      // Once the script is loaded, initialize the map
      script.onload = () => {
        if (window.google) initializeMap();
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  return <div id="map" ref={mapRef} style={{ height: "380px", width: "100%" }} />;
};

export default AirQualityMap;
