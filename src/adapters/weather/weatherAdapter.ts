export interface WeatherQuery {
  date?: string;
  location?: string;
}

export interface WeatherHint {
  available: boolean;
  condition: string;
  indoorOutdoorHint: 'indoor' | 'outdoor' | 'mixed' | 'unknown';
  needsUserCheck: boolean;
}

export interface WeatherAdapter {
  getWeatherHint(query: WeatherQuery): Promise<WeatherHint>;
}
