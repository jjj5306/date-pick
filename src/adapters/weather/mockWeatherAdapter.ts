import type { WeatherAdapter, WeatherHint, WeatherQuery } from './weatherAdapter.js';

export class MockWeatherAdapter implements WeatherAdapter {
  async getWeatherHint(query: WeatherQuery): Promise<WeatherHint> {
    void query;
    return {
      available: false,
      condition: '날씨 provider 미설정',
      indoorOutdoorHint: 'unknown',
      needsUserCheck: true
    };
  }
}
