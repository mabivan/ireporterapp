import React, { useState } from "react";
import "./MapPicker.css";

interface MapPickerProps {
  location: { lat: number; lng: number };
  setLocation: (loc: { lat: number; lng: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ location, setLocation }) => {
  const [lat, setLat] = useState(location.lat);
  const [lng, setLng] = useState(location.lng);

  const handleUpdate = () => setLocation({ lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) });

  return (
    <div className="map-picker">
      <div className="coords-input">
        <label>Latitude:</label>
        <input type="number" value={lat} onChange={e => setLat(Number(e.target.value))} />
        <label>Longitude:</label>
        <input type="number" value={lng} onChange={e => setLng(Number(e.target.value))} />
        <button onClick={handleUpdate}>Set Location</button>
      </div>
      <div className="map-preview">
        <iframe
          title="map"
          width="100%"
          height="200"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          style={{ border: 0 }}
        ></iframe>
      </div>
    </div>
  );
};

export default MapPicker;
