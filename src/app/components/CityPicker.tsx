"use client";
import React, { useState } from "react";

import { Country, City, State } from "country-state-city";
import dynamic from "next/dynamic";
import fetchWeatherData from "../APIWeather/weatherAPI";

const Select = dynamic(() => import("react-select"), { ssr: false });

type option = {
  value: {
    latitude: number;
    longitude: number;
    isoCode: string;
  };
  label: string;
} | null;

type cityOption = {
  value: {
    latitude: number;
    longitude: number;
    countryCode: string;
    name: string;
    stateCode: string;
  };
  label: string;
} | null;

type CityPickerProps = {
  onCityPicked: (weatherData: unknown, country: string, city: string) => void; // Define the type for onCityPicked
};

const options = Country.getAllCountries().map((country) => ({
  value: {
    latitude: country.latitude,
    longitude: country.longitude,
    isoCode: country.isoCode,
  },
  label: country.name,
}));

const CityPicker: React.FC<CityPickerProps> = ({ onCityPicked }) => {
  const [selectedCountry, setSelectedCountry] = useState<option>(null);
  const [selectedCity, setSelectedCity] = useState<cityOption>(null);
  const [selectedState, setSelectedState] = useState<option>(null);
  const [stateOptions, setStateOptions] = useState<option[]>([]);
  const [cityOptions, setCityOptions] = useState<cityOption[]>([]);


  const handleCountrySelect = (option: option) => {
    setSelectedCountry(option);
    setSelectedCity(null);
    setSelectedState(null);

    if (option?.value.isoCode === "US") {
      const states = State.getStatesOfCountry("US").map((state) => ({
        value: {
          latitude: parseFloat(state.latitude ?? "0"),
          longitude: parseFloat(state.longitude ?? "0"),
          isoCode: state.isoCode,
        },
        label: state.name,
      }));

      setStateOptions(states);
    } else {
      setStateOptions([]);

      const cities =
        City.getCitiesOfCountry(option?.value.isoCode ?? "")?.map((city) => ({
          value: {
            latitude: parseFloat(city.latitude ?? "0"),
            longitude: parseFloat(city.longitude ?? "0"),
            countryCode: city.countryCode,
            name: city.name,
            stateCode: city.stateCode,
          },
          label: city.name,
        })) || [];

      setCityOptions(cities);
    }
  };

  const handleStateSelect = (option: option) => {
    setSelectedState(option);
    setSelectedCity(null);

    const cities =
      City.getCitiesOfState(
        selectedCountry?.value.isoCode ?? "",
        option?.value.isoCode ?? ""
      )?.map((city) => ({
        value: {
          latitude: parseFloat(city.latitude ?? "0"),
          longitude: parseFloat(city.longitude ?? "0"),
          countryCode: city.countryCode,
          name: city.name,
          stateCode: city.stateCode,
        },
        label: city.name,
      })) || [];

    setCityOptions(cities);
  };

  const handleCitySelect = async (newValue: unknown) => {
    const option = newValue as cityOption | null;
    setSelectedCity(option);

    // Fetch weather data using the selected city's latitude and longitude
    try {
      const weatherData = await fetchWeatherData(
        option?.value.latitude ?? 0,
        option?.value.longitude ?? 0
      );

      onCityPicked(weatherData, selectedCountry?.label ?? "", option?.value.name ?? ""); // Handle the weather data as needed

    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }

    // router.push(
    //   `/location/${op}/${option?.value.latitude}/${option?.value.longitude}`
    // );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="space-x-2">
          <i className="ri-global-fill h-5 w-5 "></i>
          <label htmlFor="country" className="text-black">
            Country
          </label>
        </div>

        <Select
          id="country"
          className="text-black"
          placeholder="Select a country"
          options={options}
          value={selectedCountry}
          onChange={(newValue: unknown) => handleCountrySelect(newValue as option)}
        />
      </div>

      {selectedCountry?.value.isoCode === "US" && (
        <div className="space-y-2">
          <div className="space-x-2">
            <i className="ri-global-fill h-5 w-5 "></i>
            <label htmlFor="state" className="text-black">
              State
            </label>
          </div>
          <Select
            id="state"
            className="text-black"
            placeholder="Select a state"
            options={stateOptions}
            value={selectedState}
            onChange={(newValue: unknown) => handleStateSelect(newValue as option)}
          />
        </div>
      )}

      {((selectedCountry && selectedCountry.value.isoCode !== "US") ||
        selectedState) && (
        <div className="space-y-2">
          <div className="space-x-2">
            <i className="ri-global-fill h-5 w-5 "></i>
            <label htmlFor="city" className="text-black">
              City
            </label>
          </div>
          <Select
            id="city"
            className="text-black"
            placeholder="Select a city"
            options={cityOptions}
            value={selectedCity}
            onChange={handleCitySelect}
          />
        </div>
      )}
      
    </div>
  );
};

export default CityPicker;
