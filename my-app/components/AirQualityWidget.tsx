"use client"
import { useEffect } from "react";

interface AirQualityWidgetProps {
  city: string; // The city for which air quality is displayed
  containerId: string; // ID of the div where the widget is embedded
  lang?: string; // Language of the widget (default is 'en')
}

const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({
  city,
  containerId,
  lang = "en",
}) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.innerHTML = `
      (function (w, d, t, f) {
        w[f] = w[f] || function (c, k, n) {
          s = w[f], k = s['k'] = (s['k'] || (k ? ('&k=' + k) : '')); 
          s['c'] = c = (c instanceof Array) ? c : [c]; 
          s['n'] = n = n || 0; 
          L = d.createElement(t), e = d.getElementsByTagName(t)[0]; 
          L.async = 1; 
          L.src = '//feed.aqicn.org/feed/' + (c[n].city) + '/' + (c[n].lang || '') + '/feed.v1.js?n=' + n + k; 
          e.parentNode.insertBefore(L, e);
        };
      })(window, document, 'script', '_aqiFeed');

      _aqiFeed({
        container: "${containerId}",
        city: "${city}",
        lang: "${lang}"
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [city, containerId, lang]);

  return <div id={containerId} style={{ height: "200px" }}></div>;
};

export default AirQualityWidget;
