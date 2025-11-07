// src/contexts/LocationContext.js
import React, { createContext, useRef } from "react";
const LocationTracking = require("../utils/locationTracking");

export const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const locationSubscription = useRef(new LocationTracking()).current;

  return (
    <LocationContext.Provider value={locationSubscription}>
      {children}
    </LocationContext.Provider>
  );
};
