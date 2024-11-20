"use client";
import { useEffect, useRef, useState } from "react";

// Initialize the Google Map component
const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [popupData, setPopupData] = useState<{
    city?: string;
    aqi?: number;
    pollutant?: string;
  } | null>(null);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const [chatgptResponse, setChatgptResponse] = useState<string | null>(null);

  useEffect(() => {
    // Load the Google Maps API script
    if (!document.querySelector("script#google-maps")) {
      const script = document.createElement("script");
      script.id = "google-maps";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDfsowgGEsJy3CUQxJIy31d3o2uGmRvCko&callback=initializeMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initializeMap = initializeMap;
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
          `https://tiles.aqicn.org/tiles/usepa-aqi/${zoom}/${coord.x}/${coord.y}.png?token=eae070748993f71974251679b75a6a685f3ba928`,
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
      document.body.appendChild(widgetScript);
    }
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoadingPopup(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=eae070748993f71974251679b75a6a685f3ba928`
            );
            const data = await response.json();
            if (data.status === "ok") {
              setPopupData({
                city: data.data.city.name,
                aqi: data.data.aqi,
                pollutant: data.data.dominentpol,
              });
              // Call the function to get the ChatGPT response
              await getChatGPTKnowledge(data.data.aqi, data.data.dominentpol);
            } else {
              console.error("Failed to fetch AQI data:", data);
            }
          } catch (error) {
            console.error("Error fetching AQI data:", error);
          } finally {
            setLoadingPopup(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingPopup(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Function to interact with ChatGPT API for AQI knowledge
  const getChatGPTKnowledge = async (aqi: number, pollutant: string) => {
    try {
      const response = await fetch("https://chatgpt-42.p.rapidapi.com/gpt4", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "e1b75410aemsh25be6f5e579bb8ap15bdacjsn098f8f344007",
          "X-RapidAPI-Host": "chatgpt-42.p.rapidapi.com",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `What should I consider walking with this AQI of ${aqi} and pollutant ${pollutant}?`,
            },
          ],
          web_access: false,
        }),
      });

      const data = await response.json();
      if (data && data.choices && data.choices[0]) {
        setChatgptResponse(data.choices[0].message.content);
      }
    } catch (error) {
      console.error("Error fetching ChatGPT data:", error);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Content Wrapper */}
      <div
        style={{
          filter: loadingPopup ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        <div
          id="map"
          ref={mapRef}
          style={{ height: "100vh", width: "100%" }}
        />
        <button
          onClick={getUserLocation}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Show AQI for My Location
        </button>
      </div>

      {/* Loading Indicator for Popup */}
      {loadingPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          <p>Fetching Air Quality Information...</p>
        </div>
      )}

      {/* AQI Popup */}
      {popupData && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <h2 style={{ margin: "0 0 10px" }}>Air Quality Information</h2>
          <p>City: {popupData.city}</p>
          <p>AQI: {popupData.aqi}</p>
          <p>Dominant Pollutant: {popupData.pollutant}</p>
          <button
            onClick={() => setPopupData(null)}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* ChatGPT Response Popup */}
      {chatgptResponse && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <h2 style={{ margin: "0 0 10px" }}>ChatGPT Response</h2>
          <p>{chatgptResponse}</p>
          <button
            onClick={() => setChatgptResponse(null)}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
