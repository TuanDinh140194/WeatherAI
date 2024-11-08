
import Together from "together-ai";

const Ai_API = async(city: string, country: string, weather: unknown) => {
    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY || "d122f2b17d5d5a4e7ab147974bd42dc86dd7703b74eded23a159862646d296ab" });

    const messageContent = "Summary the weather in " + city + ", " + country + " with the following weather data: " + JSON.stringify(weather) + ". Give some recommendation for tourist about this city. Limit everything in 500 words.";
    const response = await together.chat.completions.create({
        messages: [{"role": "user", "content": messageContent}],
        model: "meta-llama/Llama-Vision-Free",
    });

    if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
        return response.choices[0].message.content;
    } else {
        return "Failed to retrieve the weather summary and recommendations.";
    }
}

export default Ai_API