import GoogleMap from "@/components/GoogleMap";
import AirQualityWidget from "@/components/AirQualityWidget";
import AirQualityMap from "@/components/AirQualityMap";
export default function Home() {
  return (
    <div>
        <GoogleMap/>
        {/* <AirQualityMap/> */}
        {/* <AirQualityWidget city="ulaanbaatar" containerId="ulaanbaatar-aqi" lang="en" /> */}
    </div>
  );
}
