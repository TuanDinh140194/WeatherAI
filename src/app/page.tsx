"use client";

import Image from "next/image";
import { Card, Divider, Subtitle, Text } from "@tremor/react";
import CityPicker from "./components/CityPicker";
import CityCards from "./components/CityCards";
import { useState } from "react";

export default function Home() {
  const [isCityPicked, setIsCityPicked] = useState(false);
  const [weatherFetchingData, setWeatherFetchingData] = useState<unknown>(null);
  const [selectedCountry, setSelectedCountry] = useState("null");
  const [selectedCity, setSelectedCity] = useState("null");
  
  const handleCityPicked = (weatherData: unknown, country: string, city: string) => {
    setIsCityPicked(true);
    setWeatherFetchingData(weatherData);
    setSelectedCountry(country);
    setSelectedCity(city);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-10 justify-center relative">
      <div className="absolute inset-0">
        <Image
          src="/image/background.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          className="-z-10"
        />
      </div>
      <Card
        className={`max-w-xl mx-auto bg-white/20 p-5 xl:p-20 mt-20 xl:mt-0 rounded-2xl shadow-2xl transition-transform duration-500 ease-in-out z-20 ${
          isCityPicked
            ? "transform -translate-y-20 xl:w-full xl:py-10 xl:mt-20"
            : "transform translate-y-0"
        }`}
      >
        {!isCityPicked && (
          <div className="transition-all duration-500">
            <Text className="font-bold text-2xl xl:text-6xl text-center mb-5 xl:mb-10">
              Weather AI
            </Text>
            <Subtitle className="text-center text-md xl:text-xl">
              Powered by Llama3.2, Next.js 15, Tailwind CSS, Tremor + More
            </Subtitle>
            <Divider className="my-10 border-t border-gray-400" />
          </div>
        )}
        <CityPicker onCityPicked={handleCityPicked} />
      </Card>

      {isCityPicked && <CityCards weatherData={weatherFetchingData} selectedCountry={selectedCountry} selectedCity={selectedCity} />}
    </div>
  );
}
