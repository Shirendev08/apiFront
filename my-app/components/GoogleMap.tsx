"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
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
              console.log("done")
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
    // f1f842cab2msh0946c87ea15c3a2p17ebe0jsn645c7b089abc
    // c0a2d3b7a8mshe348abd873a4e4ep17385djsn44c42053c9a5
    const url =
      'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'f1f842cab2msh0946c87ea15c3a2p17ebe0jsn645c7b089abc',
        'x-rapidapi-host':
          'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Hello, right now I'm in a city with an Air Quality Index of ${aqi}, and the dominant pollutant is ${pollutant}. Can you provide safety reminders for such conditions? and send response as mongolian`,
          },
        ],
        model: 'gpt-4', // Replace with the correct model name
        max_tokens: 1000,
        temperature: 0.9,
      }),
    };
  
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(aqi)
      const result = await response.json();
      setChatgptResponse(result.choices?.[0]?.message?.content || 'No response');
      console.log(result);
    } catch (error) {
      console.error('Error interacting with ChatGPT API:', error);
    }
  };
  

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          filter: loadingPopup ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        <div id="map" ref={mapRef} style={{ height: "100vh", width: "100%" }} />
        <Button
          onClick={getUserLocation}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "50%",
            left: "50%",
            transform: "translate(-50%, 0)", // Center horizontally
            width: "80%", // Responsive width
            maxWidth: "300px", // Maximum width for larger screens
            minWidth: "150px", // Minimum width for smaller screens
            padding: "10px",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            textAlign: "center",
            height:"5%"
          }}
        >
          Байгаа газрынхаа агаарын индексыг харах
        </Button>
      </div>

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
    <p>
      AQI:{" "}
      <span
        style={{
          color:
            popupData.aqi! <= 50
              ? "green"
              : popupData.aqi! <= 100
              ? "yellow"
              : popupData.aqi! <= 150
              ? "orange"
              : popupData.aqi! <= 200
              ? "red"
              : popupData.aqi! <= 300
              ? "purple"
              : "maroon",
        }}
      >
        {popupData.aqi} {popupData.aqi! <= 50
          ? "😊" // Good
          : popupData.aqi! <= 100
          ? "🙂" // Moderate
          : popupData.aqi! <= 150
          ? "😷" // Unhealthy for Sensitive Groups
          : popupData.aqi! <= 200
          ? "😡" // Unhealthy
          : popupData.aqi! <= 300
          ? "☠️" // Very Unhealthy
          : "💀"} 
      </span>
    </p>
    <p>Dominant Pollutant: {popupData.pollutant}</p>
    <Button
      onClick={() => setPopupData(null)}
      
    >
      Close
    </Button>
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
          <h2 style={{ margin: "0 0 10px" }}>Зөвлөгөө</h2>
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
