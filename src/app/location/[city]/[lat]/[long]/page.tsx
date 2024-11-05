import React from "react";

type Props = {
  params: {
    city: string;
    lat: string;
    long: string;
  };
};

const WeatherPage = ({params: {city, lat, long}}: Props) => {
  return <div>WeatherPage {city} {lat} {long}</div>;
};

export default WeatherPage;
