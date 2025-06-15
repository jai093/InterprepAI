
import React from "react";

interface GoogleMapsStaticEmbedProps {
  lat: number;
  lng: number;
  address?: string;
  width?: number;
  height?: number;
  zoom?: number;
}

/**
 * Simple static embed for Google Maps showing a marker.
 * Note: For a true production app, ideally hide your API key securely.
 */
const GOOGLE_MAPS_API_KEY = "AIzaSyAzz2KFrrERsy_7Mdqi7Qy5cOyhvcmXcws";

const GoogleMapsStaticEmbed: React.FC<GoogleMapsStaticEmbedProps> = ({
  lat,
  lng,
  address,
  width = 400,
  height = 200,
  zoom = 15,
}) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=${zoom}`;
  return (
    <div className="w-full rounded-md overflow-hidden border border-border shadow">
      <iframe
        title={address || "Meetup Location"}
        width="100%"
        height={height}
        className="w-full"
        style={{ minHeight: height, border: 0 }}
        src={mapUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default GoogleMapsStaticEmbed;
