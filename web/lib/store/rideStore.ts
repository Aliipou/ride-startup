import { create } from "zustand";

export interface RiderInfo {
  id: string;
  name: string;
  rating: number;
  bike_type: string;
  photo_url: string | null;
  phone: string;
  current_lat: number;
  current_lng: number;
}

export interface CurrentRide {
  id: string;
  status: string;
  pickup_address?: string;
  dest_address?: string;
  rider?: RiderInfo | null;
  bike_type?: string;
  payment_method?: string;
  total_fare?: number;
  final_price?: number;
  estimated_pickup_min?: number;
}

export interface RiderLocation {
  lat: number;
  lng: number;
}

interface RideState {
  currentRide: CurrentRide | null;
  riderLocation: RiderLocation | null;
  rideStatus: string | null;
  setRide: (ride: CurrentRide) => void;
  updateRiderLocation: (location: RiderLocation) => void;
  setStatus: (status: string) => void;
  clearRide: () => void;
}

export const useRideStore = create<RideState>()((set) => ({
  currentRide: null,
  riderLocation: null,
  rideStatus: null,

  setRide: (ride) => set({ currentRide: ride, rideStatus: ride.status }),

  updateRiderLocation: (location) => set({ riderLocation: location }),

  setStatus: (status) => set({ rideStatus: status }),

  clearRide: () => set({ currentRide: null, riderLocation: null, rideStatus: null }),
}));
