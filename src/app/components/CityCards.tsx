import React, { useEffect, useState } from "react";
import { Card, Text, Divider } from "@tremor/react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import Lottie from "lottie-react";
import WeatherCloudy from "../../../public/animation/CloudyWeather.json";
import weatherCodes from "../../../public/data/weatherCode.json";
import SunnyWeather from "../../../public/animation/SunnyWeather.json";
import RainnyWeather from "../../../public/animation/RainnyWeather.json";
import Thunder from "../../../public/animation/Thunder.json";
import Snow from "../../../public/animation/SnowWeather.json";
import Foggy from "../../../public/animation/foggy.json";
import Robot from "../../../public/animation/robot.json";
import AiLoading from "../../../public/animation/AILoading.json";

//Import AI response
import AiResponse from "../AI_API/Ai_API";

// In CityCards component file
interface CityCardsProps {
  weatherData: any;
  selectedCountry: string;
  selectedCity: string;
}

const CityCards: React.FC<CityCardsProps> = ({
  weatherData,
  selectedCountry,
  selectedCity,
}) => {
  const currentTemperature = weatherData?.current?.apparent_temperature;
  const weatherCode: keyof typeof weatherCodes =
    weatherData?.current?.weather_code;
  const weatherDescription =
    weatherCodes[weatherCode]?.day.description || "Sunny";

  //Get current time
  const currentTime = weatherData?.current?.time;
  const date = new Date(currentTime);
  //Format the date and time
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //Get details forecast
  const humidity = weatherData?.current?.relative_humidity_2m;
  const precipitation = weatherData?.current?.precipitation;
  const rain = weatherData?.current?.rain;
  const snowfall = weatherData?.current?.snowfall;
  const windSpeed = weatherData?.current?.wind_speed_10m;
  const windDirection = weatherData?.current?.wind_direction_10m;
  const surface_pressure = weatherData?.current?.surface_pressure;

  //Set Animation
  let animationData;
  if (weatherDescription.includes("Snow")) {
    animationData = Snow;
  } else if (
    weatherDescription.includes("Rain") ||
    weatherDescription.includes("Drizzle") ||
    weatherDescription.includes("Showers")
  ) {
    animationData = RainnyWeather;
  } else if (weatherDescription.includes("Thunderstorm")) {
    animationData = Thunder;
  } else if (weatherDescription.includes("Cloudy")) {
    animationData = WeatherCloudy;
  } else if (
    weatherDescription.includes("Fog") ||
    weatherDescription.includes("Foggy")
  ) {
    animationData = Foggy;
  } else {
    animationData = SunnyWeather;
  }

  // State to hold the chart data by time
  const [chartData, setChartData] = useState<
    { name: string; temperature: number; weatherDescription: string }[]
  >([]);

  // State to hold the chart data by day
  const [dayChartData, setDayChartData] = useState<
    {
      name: string;
      temperatureMax: number;
      temperatureMin: number;
      weatherDescription: string;
    }[]
  >([]);

  //State hold Ai response
  const [aiResponse, setAiResponse] = useState("");
  //State to hold loading status
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    setLoading(true);
    const fetchAiResponse = async () => {
      const response = await AiResponse(
        selectedCity,
        selectedCountry,
        weatherData
      );
      setAiResponse(response ?? "No response");
      setLoading(false);
    };
    fetchAiResponse();
  }, [selectedCity]);

  useEffect(() => {
    if (weatherData?.hourly) {
      const { time, apparent_temperature, weather_code } =
        weatherData.hourly as {
          time: string[];
          apparent_temperature: number[];
          weather_code: (keyof typeof weatherCodes)[];
        };

      // Get the first 24 items from time and temperature_2m
      const first24Time = time.slice(0, 24);
      const first24Temperatures = apparent_temperature.slice(0, 24);

      //Map the data into the desired format
      const formattedChartData = first24Time.map((t: any, index: any) => ({
        name: new Date(t).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        temperature: first24Temperatures[index],
        weatherDescription:
          weatherCodes[weather_code[index]]?.day.description || "Sunny",
      }));

      setChartData(formattedChartData);
    }

    if (weatherData?.daily) {
      const {
        time,
        apparent_temperature_max,
        apparent_temperature_min,
        weather_code,
        sunrise,
        sunset,
      } = weatherData.daily as {
        time: string[];
        apparent_temperature_max: number[];
        apparent_temperature_min: number[];
        weather_code: (keyof typeof weatherCodes)[];
        sunrise: string[];
        sunset: string[];
      };

      //Map data into the desired format
      const formattedDayChartData = time.map((t: any, index: any) => ({
        name: new Date(t).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        temperatureMax: apparent_temperature_max[index],
        temperatureMin: apparent_temperature_min[index],
        weatherDescription:
          weatherCodes[weather_code[index]]?.day.description || "Sunny",
        sunrise: new Date(sunrise[index]).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        sunset: new Date(sunset[index]).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));

      setDayChartData(formattedDayChartData);
    }
  }, [weatherData]);

  // State to hold chart dimensions
  const [chartDimensions, setChartDimensions] = useState({
    width: 600,
    height: 300,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Example breakpoint for small screens
        setChartDimensions({ width: 300, height: 200 }); // Smaller dimensions for mobile
      } else {
        setChartDimensions({ width: 600, height: 300 }); // Default dimensions for larger screens
      }
    };

    // Set initial dimensions
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/50 backdrop-blur-md text-gray-700 font-semibold p-2 rounded-2xl shadow-lg">
          <p className="title underline">{`${payload[0].payload.name}`}</p>
          <p className="intro">{`${payload[0].value} °F`}</p>
          <p className="intro">
            {" "}
            {`${payload[0].payload.weatherDescription} `}
          </p>
        </div>
      );
    }

    return null;
  };

  //Custom Tooltip 7-Day Forecast\
  const CustomDayTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/50 backdrop-blur-md text-gray-700 font-semibold p-2 rounded-2xl shadow-lg">
          <p className="label underline">{`${payload[0].payload.name}`}</p>
          <p className="intro">
            Max: {`${payload[0].payload.temperatureMax} °F`}
          </p>
          <p className="intro">
            Min: {`${payload[0].payload.temperatureMin} °F`}
          </p>
          <p className="intro">
            {" "}
            {`${payload[0].payload.weatherDescription} `}
          </p>
          <p className="intro">Sunrise: {`${payload[0].payload.sunrise} `}</p>
          <p className="intro">Sunset: {`${payload[0].payload.sunset} `}</p>
        </div>
      );
    }

    return null;
  };
  // Custom Tick Component for XAxis
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16} // Adjust vertical position
          textAnchor="middle"
          fill="" // Change this to your desired color
          fontSize={14} // Customize font size if needed
          fontWeight={"bold"} // Customize font weight if needed
        >
          {payload.value} {/* Customize the value as needed */}
        </text>
      </g>
    );
  };

  // Function to format aiResponse
  const formatAiResponse = (response: string) => {
    return response.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        // Render as title
        const title = line.slice(2, -2); // Remove the ** from the title
        return (
          <h3 key={title} className="font-bold">
            {title}
          </h3> // Customize title styling as needed
        );
      }
      return <p key={index}>{line}</p>; // Render as normal paragraph
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 xl:grid-rows-11 gap-10 xl:mt-0 mt-10 w-full max-w-6xl">
      <div className="xl:col-span-1 xl:row-span-3 ">
        <Card className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-lg h-full">
          <div className="flex flex-col justify-between">
            <div className="flex flex-row justify-between items-start">
              <div className="flex flex-col">
                <Text className="font-bold text-2xl xl:text-4xl text-gray-700">
                  {selectedCity}
                </Text>
                <Text className="text-lg xl:text-2xl text-gray-700">
                  {selectedCountry}
                </Text>
              </div>
              <Lottie
                animationData={animationData}
                loop={true}
                style={{ width: 80, height: 80 }}
              />
            </div>

            <div className="flex flex-col mt-10">
              <Text className="text-lg xl:text-xl font-semibold text-gray-700">
                {formattedTime}
              </Text>
              <Text className="text-lg xl:text-xl font-semibold text-gray-700">
                {formattedDate}
              </Text>
            </div>

            <Divider className="mb-10 border-t border-gray-700" />

            <div className="flex flex-col">
              <Text className="text-2xl xl:text-7xl font-extrabold text-gray-700">
                {currentTemperature} °F
              </Text>
              <Text className="text-xl xl:text-2xl text-gray-700 font-semibold">
                {weatherDescription}
              </Text>
            </div>
          </div>
        </Card>
      </div>
      <div className="xl:col-span-2 xl:row-span-3">
        <Card className="bg-white/50 backdrop-blur-md p-5 rounded-2xl shadow-lg h-full w-full flex flex-col items-center justify-center">
          <h2 className="xl:text-2xl font-bold text-gray-700 mb-5">
            Temperature Over Time
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="auto" height="auto">
              <BarChart
                width={chartDimensions.width}
                height={chartDimensions.height}
                data={chartData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={<CustomXAxisTick />} />
                {/* <YAxis /> */}
                <Tooltip content={<CustomTooltip />} />
                {/* <Legend /> */}
                <Bar
                  dataKey="temperature"
                  fill="#5ebee0"
                  activeBar={<Rectangle fill="#5ee0de" stroke="#d7faf2" />}
                />
                {/* <Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} /> */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Text>No data available for this city</Text>
          )}
        </Card>
      </div>

      <div className="xl:col-span-2 xl:row-span-3">
        <Card className="bg-white/50 backdrop-blur-md p-5 rounded-2xl shadow-2xl h-full w-full flex flex-col items-center justify-center">
          <h2 className="xl:text-2xl font-bold text-gray-700 mb-5">
            7 - Day Forecast
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="auto" height="auto">
              <BarChart
                width={chartDimensions.width}
                height={chartDimensions.height}
                data={dayChartData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={<CustomXAxisTick />} />
                {/* <YAxis /> */}
                <Tooltip content={<CustomDayTooltip />} />
                {/* <Legend /> */}
                <Bar
                  dataKey="temperatureMax"
                  fill="#f78383"
                  activeBar={<Rectangle fill="#f54747" stroke="#d7faf2" />}
                />
                <Bar
                  dataKey="temperatureMin"
                  fill="#87c3f5"
                  activeBar={<Rectangle fill="#4b88f2" stroke="#d7faf2" />}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Text>No data available for this city</Text>
          )}
        </Card>
      </div>
      <div className="xl:col-span-1 xl:row-span-3">
        <Card className="bg-white/50 backdrop-blur-md p-5 rounded-2xl shadow-lg h-full">
          <div className="flex flex-col items-center justify-center">
            <Text className="font-bold text-xl xl:text-2xl text-gray-700 text-center">
              Detail Forecast
            </Text>
            <Divider className="my-5 border-t border-gray-700" />
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Humidity: {humidity} %
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Percipitation: {precipitation} inches
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Rain: {rain} inches
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Snowfall: {snowfall} inches
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Wind Speed: {windSpeed} mp/h
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Wind Direction: {windDirection} °
            </Text>
            <Text className="my-2 text-md xl:text-lg font-semibold text-gray-700">
              Surface Pressure: {surface_pressure} hPa
            </Text>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-3 xl:row-span-5">
        <Card className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-lg h-full flex flex-col items-center justify-start">
          <div className="flex flex-col items-center">
            <Lottie
              animationData={Robot}
              loop={true}
              style={{ width: 100, height: 100 }}
              className="flex-shrink-0"
            />
            <div className="flex-wrap text-sm my-2">
              {loading ? ( // Check if loading
                <div className="flex justify-center items-center">
                  <Lottie
                    animationData={AiLoading}
                    loop={true}
                    style={{ width: 180, height: 180 }}
                    className="items-center mt-20"
                  />
                  
                </div>
              ) : (
                formatAiResponse(aiResponse) // Show AI response when not loading
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CityCards;
