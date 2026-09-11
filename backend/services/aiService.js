import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

/**
 * Open-Meteo Free Live Weather API Integration
 */
const fetchWeatherForDestination = async (locationName) => {
  try {
    // 1. Geocode Location Name -> Lat/Lng
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) return null;
    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch Live Weather Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    const daily = weatherData.daily;

    const tempMax = daily?.temperature_2m_max?.[0] ?? current?.temperature;
    const tempMin = daily?.temperature_2m_min?.[0] ?? current?.temperature;
    const precip = daily?.precipitation_sum?.[0] ?? 0;

    let conditionStr = 'Fair';
    if (precip > 5) conditionStr = 'Rainy / Wet';
    else if (current?.temperature < 15) conditionStr = 'Cold / Chilly';
    else if (current?.temperature > 30) conditionStr = 'Hot / Sunny';

    return {
      location: `${name}, ${country || ''}`.trim(),
      tempCurrent: current?.temperature,
      tempMax,
      tempMin,
      precipitation: precip,
      condition: conditionStr,
      summary: `${name}: ${current?.temperature}°C (${tempMin}°C - ${tempMax}°C), ${conditionStr}`
    };
  } catch (err) {
    console.warn('[Weather API] Geocoding/Weather fetch error:', err.message);
    return null;
  }
};

/**
 * Built-in Heuristic AI Engine for Smart Checklists (Fallback)
 */
const generateHeuristicChecklist = (promptText) => {
  const text = promptText.toLowerCase();

  // 1. Shimla / Mountain / Hill Station Vacation
  if (text.includes('shimla') || text.includes('manali') || text.includes('mountain') || text.includes('hill station')) {
    return {
      title: 'Mountain Vacation & Trip',
      description: promptText,
      category: 'Travel',
      categories: [
        {
          name: '🧳 Packing & Wearables',
          items: ['Warm Sweaters & Jackets', 'Thermal Innerwear', 'Comfortable Trekking Shoes', 'Woolen Socks & Gloves', 'Sunglasses & Sunscreen']
        },
        {
          name: '📄 Travel Documents',
          items: ['Aadhaar / Gov ID Cards', 'Driving Licence', 'Hotel Booking Receipts', 'Vehicle Registration & Insurance']
        },
        {
          name: '🔌 Electronics & Gadgets',
          items: ['Phone Charger & USB Cables', 'High Capacity Power Bank', 'Camera & Extra Memory Card', 'Earphones / Headphones']
        },
        {
          name: '💊 Personal & Health',
          items: ['Motion Sickness Pills', 'First Aid Kit & Band-aids', 'Regular Prescription Medicines', 'Cold Cream & Lip Balm']
        },
        {
          name: '🚗 Car & Roadtrip Prep',
          items: ['Check Engine Oil & Coolant', 'Check Tyre Pressure & Spare Tyre', 'FASTag Account Recharge', 'Clean Windshield & Refill Wiper Fluid']
        }
      ]
    };
  }

  // 2. Gym / Fitness Workout
  if (text.includes('gym') || text.includes('workout') || text.includes('fitness') || text.includes('exercise')) {
    return {
      title: 'Gym Workout Essentials',
      description: promptText,
      category: 'Fitness',
      categories: [
        {
          name: '👟 Gear & Apparel',
          items: ['Workout Clothes (T-shirt/Shorts)', 'Gym Shoes / Trainers', 'Gym Towel', 'Locker Padlock']
        },
        {
          name: '💧 Hydration & Nutrition',
          items: ['Water Bottle / Shaker', 'Pre-workout / Electrolytes', 'Protein Bar / Post-workout Snack']
        },
        {
          name: '🎵 Tech & Personal',
          items: ['Bluetooth Earphones', 'Smartwatch / Fitness Tracker', 'Deodorant / Body Spray']
        }
      ]
    };
  }

  // 3. Moving to a New House
  if (text.includes('moving') || text.includes('new house') || text.includes('relocation') || text.includes('shift')) {
    return {
      title: 'New House Relocation Checklist',
      description: promptText,
      category: 'Home & Relocation',
      categories: [
        {
          name: '📄 Administrative & Documents',
          items: ['Rental Agreement / Property Deeds', 'Update Address on Bank & IDs', 'Utility Bill Account Transfer', 'Movers Contract Agreement']
        },
        {
          name: '📦 Packing by Room',
          items: ['Kitchen Utensils & Glassware', 'Clothes & Hangers', 'Electronics & Cable Labels', 'Bedding, Pillows & Towels', 'Important Documents Lockbox']
        },
        {
          name: '⚡ Utilities Setup',
          items: ['Wi-Fi / Internet Installation', 'Electricity & Water Connection Check', 'Gas Cylinder / Piped Gas Setup', 'Deep Cleaning New Apartment']
        },
        {
          name: '🛠️ Day One Essentials',
          items: ['Toolbox & Scissors', 'Trash Bags & Cleaning Spray', 'Toilet Paper & Basic Toiletries', 'First Night Change of Clothes']
        }
      ]
    };
  }

  // 4. Wedding Event
  if (text.includes('wedding') || text.includes('marriage') || text.includes('reception')) {
    return {
      title: 'Wedding Event Checklist',
      description: promptText,
      category: 'Event',
      categories: [
        {
          name: '👔 Attire & Grooming',
          items: ['Traditional Formal Wear', 'Matching Shoes & Belt', 'Ironed Shirts / Ethnic Wear', 'Perfume & Accessories']
        },
        {
          name: '🎁 Gifts & Wishes',
          items: ['Wedding Gift / Shagun Envelope', 'Greeting Card signed', 'Cash in Hand for Tipping']
        },
        {
          name: '🏨 Travel & Stay',
          items: ['Hotel Room Reservation', 'Iron / Steamer', 'Emergency Stain Remover Pen', 'Chargers & Power Bank']
        }
      ]
    };
  }

  // Default Dynamic Checklist Parser
  return {
    title: promptText.length > 30 ? `${promptText.substring(0, 27)}...` : promptText,
    description: promptText,
    category: 'General',
    categories: [
      {
        name: '📋 Important Prep Items',
        items: [
          `Research & Plan details for ${promptText}`,
          'Prepare necessary budget & cash',
          'Confirm schedules and times',
          'Notify relevant friends/family'
        ]
      },
      {
        name: '🎒 Packing & Gear',
        items: [
          'Essential supplies and tools',
          'Mobile phone & Charger',
          'Personal identification & documents'
        ]
      },
      {
        name: '✅ Final Tasks',
        items: [
          'Double check lock & security',
          'Verify completion of all checklist steps'
        ]
      }
    ]
  };
};

/**
 * Natural Language Parser for Quick Create
 */
const parseNaturalLanguage = (input) => {
  const text = input.trim();
  const lower = text.toLowerCase();

  const amountMatch = text.match(/(?:₹|\$|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  const isBillKeyword = lower.includes('pay') || lower.includes('bill') || lower.includes('rent') || lower.includes('subscription') || lower.includes('recharge') || amount !== null;

  if (isBillKeyword && amount !== null) {
    let frequency = 'monthly';
    if (lower.includes('year') || lower.includes('annual')) frequency = 'yearly';
    else if (lower.includes('week')) frequency = 'weekly';
    else if (lower.includes('quarter')) frequency = 'quarterly';
    else if (lower.includes('day') || lower.includes('daily')) frequency = 'daily';

    let dueDay = 15;
    const dayMatch = lower.match(/(\d+)(?:st|nd|rd|th)?/);
    if (dayMatch && parseInt(dayMatch[1]) <= 31) {
      dueDay = parseInt(dayMatch[1]);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dueDay).padStart(2, '0');
    const dueDateStr = `${currentYear}-${currentMonth}-${dayStr}`;

    let title = 'Recurring Bill';
    if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('broadband') || lower.includes('internet')) title = 'Wi-Fi';
    else if (lower.includes('rent')) title = 'House Rent';
    else if (lower.includes('mobile') || lower.includes('phone') || lower.includes('recharge')) title = 'Mobile Recharge';
    else if (lower.includes('electricity') || lower.includes('power')) title = 'Electricity Bill';
    else if (lower.includes('netflix') || lower.includes('prime') || lower.includes('spotify')) title = 'Subscription';
    else if (lower.includes('credit card') || lower.includes('card')) title = 'Credit Card Bill';
    else {
      title = text.replace(/i pay|every month|on the|every year|rs\.?|₹|\d+/gi, '').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      if (!title || title.length < 2) title = 'Custom Bill';
    }

    return {
      type: 'bill',
      data: {
        name: title,
        amount,
        due_date: dueDateStr,
        is_recurring: true,
        recurrence_frequency: frequency,
        category: title,
        notes: `Auto-generated from quick prompt: "${input}"`
      }
    };
  }

  if (lower.includes('task') || lower.includes('todo') || lower.includes('buy') || lower.includes('call') || lower.includes('book') || lower.includes('do')) {
    let priority = 'medium';
    if (lower.includes('urgent') || lower.includes('high') || lower.includes('important')) priority = 'high';
    if (lower.includes('low')) priority = 'low';

    return {
      type: 'task',
      data: {
        title: input,
        priority,
        due_date: new Date().toISOString().split('T')[0],
        category: 'General'
      }
    };
  }

  if (lower.includes('remind') || lower.includes('reminder') || lower.includes('alert')) {
    return {
      type: 'reminder',
      data: {
        title: input.replace(/remind me to|remind me|reminder:/gi, '').trim(),
        reminder_date: new Date().toISOString().split('T')[0],
        reminder_time: '09:00:00',
        repeat_frequency: lower.includes('every month') ? 'monthly' : 'none'
      }
    };
  }

  return {
    type: 'checklist',
    promptText: input
  };
};

export const aiService = {
  /**
   * Main function to generate structured checklist items using Gemini or OpenAI or Heuristic Engine
   */
  generateChecklist: async (promptText) => {
    // Detect location name from prompt (e.g. "Shimla", "Manali", "Goa", "Paris", "Tokyo")
    let weatherInfo = null;
    const words = promptText.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      if (cleanWord.length > 3 && cleanWord[0] === cleanWord[0].toUpperCase()) {
        const weather = await fetchWeatherForDestination(cleanWord);
        if (weather) {
          weatherInfo = weather;
          console.log('[AI Service] Fetched live weather for trip destination:', weather.summary);
          break;
        }
      }
    }

    // 1. Google Gemini API Integration
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim().length > 10 && !geminiKey.includes('your-gemini')) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let weatherPromptSnippet = '';
        if (weatherInfo) {
          weatherPromptSnippet = `\nREAL-TIME LIVE WEATHER FOR TRIP DESTINATION: ${weatherInfo.summary}. Please include weather-informed recommendations (e.g. rain gear if rainy, thermals if cold, sunscreen if hot) as a dedicated weather category or within items!`;
        }

        const systemPrompt = `You are an AI assistant for Planora life management app. Create a detailed categorized checklist based on user prompt.${weatherPromptSnippet}
Return ONLY valid raw JSON without markdown code blocks, in this format:
{
  "title": "Checklist Title",
  "description": "Short summary including destination weather if trip",
  "category": "Category name",
  "weather": ${weatherInfo ? JSON.stringify(weatherInfo) : 'null'},
  "categories": [
    { "name": "🧳 Category 1", "items": ["Item 1", "Item 2"] },
    { "name": "📄 Category 2", "items": ["Item 3", "Item 4"] }
  ]
}

User prompt: "${promptText}"`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        parsed.weather = weatherInfo;
        console.log('[AI Service] Successfully generated weather-assisted checklist with Google Gemini API!');
        return parsed;
      } catch (err) {
        console.warn('[AI Service] Gemini API call failed, falling back to heuristic engine:', err.message);
      }
    }

    // 2. OpenAI API Integration
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant for Planora app. Create a detailed categorized checklist based on user prompt.
Return ONLY JSON format:
{
  "title": "Checklist Title",
  "description": "Short summary",
  "category": "Category name",
  "categories": [
    { "name": "Category 1", "items": ["Item 1", "Item 2"] }
  ]
}`
              },
              { role: 'user', content: promptText }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          return JSON.parse(data.choices[0].message.content);
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI call failed:', err.message);
      }
    }

    // 3. Fallback Heuristic Engine
    return generateHeuristicChecklist(promptText);
  },

  parseInput: (input) => {
    return parseNaturalLanguage(input);
  }
};
