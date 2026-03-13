import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface ClinicMapViewProps {
  clinics: Array<{
    id: string;
    name: string;
    specialty: string;
    latitude: number;
    longitude: number;
  }>;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation: boolean;
  onMarkerPress: (clinicId: string) => void;
  tintColor: string;
}

export default function ClinicMapView({
  clinics,
  initialRegion,
  showsUserLocation,
  onMarkerPress,
  tintColor,
}: ClinicMapViewProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={initialRegion}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={true}
    >
      {clinics.map((clinic) => (
        <Marker
          key={clinic.id}
          coordinate={{
            latitude: clinic.latitude,
            longitude: clinic.longitude,
          }}
          title={clinic.name}
          description={clinic.specialty}
          onPress={() => onMarkerPress(clinic.id)}
          pinColor={tintColor}
        />
      ))}
    </MapView>
  );
}
