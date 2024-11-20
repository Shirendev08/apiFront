import GoogleMap from "@/components/GoogleMap";
import AirQualityWidget from "@/components/AirQualityWidget";

export default function Home() {
  return (
    <div>
        <GoogleMap/>
        <AirQualityWidget city="ulaanbaatar" containerId="ulaanbaatar-aqi" lang="en" />
    </div>
  );
}
