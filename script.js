class ModernWeatherApp {
    constructor() {
        this.API_KEY = 'b0aa0af537c87cd5ed7f8223db0d0a6f';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5/';
        this.GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/';
        
        // Popular cities with their full names and country codes for accurate search
        this.popularCities = [
            { name: 'New York', fullName: 'New York,NY,US', display: '🏙️ New York, USA' },
            { name: 'London', fullName: 'London,GB', display: '🏰 London, UK' },
            { name: 'Tokyo', fullName: 'Tokyo,JP', display: '🌸 Tokyo, Japan' },
            { name: 'Paris', fullName: 'Paris,FR', display: '🥖 Paris, France' },
            { name: 'Sydney', fullName: 'Sydney,AU', display: '🇦🇺 Sydney, Australia' },
            { name: 'Singapore', fullName: 'Singapore,SG', display: '🦁 Singapore' },
            { name: 'Dubai', fullName: 'Dubai,AE', display: '🏗️ Dubai, UAE' },
            { name: 'Los Angeles', fullName: 'Los Angeles,CA,US', display: '🌴 Los Angeles, USA' },
            { name: 'Kuala Lumpur', fullName: 'Kuala Lumpur,MY', display: '🏢 Kuala Lumpur, Malaysia' },
            { name: 'Bangkok', fullName: 'Bangkok,TH', display: '🏛️ Bangkok, Thailand' }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTheme();
        this.loadDefaultCity();
        this.updateQuickStats();
        this.updateLastUpdated();
        this.setupDynamicSearch();
    }

    initializeElements() {
        // Search elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Container elements
        this.loading = document.getElementById('loading');
        this.weatherContent = document.getElementById('weatherContent');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Current weather elements
        this.currentCity = document.getElementById('currentCity');
        this.currentDate = document.getElementById('currentDate');
        this.currentWeatherIcon = document.getElementById('currentWeatherIcon');
        this.currentTemp = document.getElementById('currentTemp');
        this.currentDescription = document.getElementById('currentDescription');
        this.feelsLike = document.getElementById('feelsLike');
        this.coordinates = document.getElementById('coordinates');
        this.lastUpdated = document.getElementById('lastUpdated');
        
        // Weather details elements
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
        this.cloudiness = document.getElementById('cloudiness');
        
        // Quick stats elements
        this.quickTemp = document.getElementById('quickTemp');
        this.quickHumidity = document.getElementById('quickHumidity');
        this.quickWind = document.getElementById('quickWind');
        this.quickVisibility = document.getElementById('quickVisibility');
        
        // Additional elements
        this.tempRange = document.getElementById('tempRange');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        this.windDirection = document.getElementById('windDirection');
        this.pressureTrend = document.getElementById('pressureTrend');
        
        // Progress bars
        this.visibilityProgress = document.getElementById('visibilityProgress');
        this.humidityProgress = document.getElementById('humidityProgress');
        this.uvBar = document.getElementById('uvBar');
        
        // Forecast elements
        this.forecastContainer = document.getElementById('forecastContainer');
        this.hourlyContainer = document.getElementById('hourlyContainer');
        
        // Search suggestions
        this.searchSuggestions = document.getElementById('searchSuggestions');
        
        // Error text
        this.errorText = document.getElementById('errorText');
    }

    bindEvents() {
        // Search functionality
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        }
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.cityInput) {
            this.cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
            
            this.cityInput.addEventListener('input', (e) => {
                this.handleSearchSuggestions(e.target.value);
            });
            
            this.cityInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
            
            this.cityInput.addEventListener('blur', () => {
                setTimeout(() => this.hideSearchSuggestions(), 200);
            });
        }
        
        // Update time every minute
        setInterval(() => this.updateLastUpdated(), 60000);
    }

    setupDynamicSearch() {
        // Create dynamic search suggestions
        this.createSearchSuggestions();
    }

    createSearchSuggestions() {
        if (!this.searchSuggestions) return;
        
        this.searchSuggestions.innerHTML = '';
        
        this.popularCities.forEach(city => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = city.display;
            suggestionItem.dataset.cityName = city.name;
            suggestionItem.dataset.fullName = city.fullName;
            
            suggestionItem.addEventListener('click', () => {
                this.cityInput.value = city.name;
                this.getWeatherByCity(city.fullName);
                this.hideSearchSuggestions();
            });
            
            this.searchSuggestions.appendChild(suggestionItem);
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // Updated default city to Kuala Lumpur
    async loadDefaultCity() {
        await this.getWeatherByCity('Kuala Lumpur,MY');
    }

    handleSearch() {
        const city = this.cityInput?.value.trim();
        if (city) {
            // Enhanced search with better specificity
            this.performEnhancedSearch(city);
            this.hideSearchSuggestions();
        }
    }

    async performEnhancedSearch(searchTerm) {
        try {
            // First, check if it matches any popular city
            const popularCity = this.popularCities.find(city => 
                city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                city.display.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (popularCity) {
                console.log(`Using popular city: ${popularCity.fullName}`);
                await this.getWeatherByCity(popularCity.fullName);
                return;
            }
            
            // If not found in popular cities, try multiple search strategies
            const searchStrategies = [
                searchTerm, // Original search
                `${searchTerm},US`, // Try US first (most common)
                `${searchTerm},GB`, // Try UK
                `${searchTerm},CA`, // Try Canada
                `${searchTerm},AU`, // Try Australia
                `${searchTerm},IN`, // Try India
                `${searchTerm},DE`, // Try Germany
                `${searchTerm},FR`, // Try France
                `${searchTerm},IT`, // Try Italy
                `${searchTerm},ES`, // Try Spain
                `${searchTerm},BR`, // Try Brazil
                `${searchTerm},CN`, // Try China
                `${searchTerm},JP`, // Try Japan
                `${searchTerm},MY`, // Try Malaysia
                `${searchTerm},SG`, // Try Singapore
                `${searchTerm},TH`, // Try Thailand
                `${searchTerm},ID`, // Try Indonesia
                `${searchTerm},PH`, // Try Philippines
                `${searchTerm},VN`, // Try Vietnam
                `${searchTerm},KR`, // Try South Korea
                `${searchTerm},TW`, // Try Taiwan
                `${searchTerm},HK`, // Try Hong Kong
                `${searchTerm},AE`, // Try UAE
                `${searchTerm},SA`, // Try Saudi Arabia
                `${searchTerm},EG`, // Try Egypt
                `${searchTerm},ZA`, // Try South Africa
                `${searchTerm},NG`, // Try Nigeria
                `${searchTerm},RU`, // Try Russia
                `${searchTerm},NL`, // Try Netherlands
                `${searchTerm},BE`, // Try Belgium
                `${searchTerm},CH`, // Try Switzerland
                `${searchTerm},AT`, // Try Austria
                `${searchTerm},SE`, // Try Sweden
                `${searchTerm},NO`, // Try Norway
                `${searchTerm},DK`, // Try Denmark
                `${searchTerm},FI`, // Try Finland
                `${searchTerm},PL`, // Try Poland
                `${searchTerm},CZ`, // Try Czech Republic
                `${searchTerm},HU`, // Try Hungary
                `${searchTerm},RO`, // Try Romania
                `${searchTerm},BG`, // Try Bulgaria
                `${searchTerm},GR`, // Try Greece
                `${searchTerm},TR`, // Try Turkey
                `${searchTerm},IL`, // Try Israel
                `${searchTerm},IR`, // Try Iran
                `${searchTerm},IQ`, // Try Iraq
                `${searchTerm},PK`, // Try Pakistan
                `${searchTerm},BD`, // Try Bangladesh
                `${searchTerm},LK`, // Try Sri Lanka
                `${searchTerm},NP`, // Try Nepal
                `${searchTerm},MM`, // Try Myanmar
                `${searchTerm},KH`, // Try Cambodia
                `${searchTerm},LA`, // Try Laos
                `${searchTerm},MN`, // Try Mongolia
                `${searchTerm},KZ`, // Try Kazakhstan
                `${searchTerm},UZ`, // Try Uzbekistan
                `${searchTerm},KG`, // Try Kyrgyzstan
                `${searchTerm},TJ`, // Try Tajikistan
                `${searchTerm},TM`, // Try Turkmenistan
                `${searchTerm},AF`, // Try Afghanistan
                `${searchTerm},MV`, // Try Maldives
                `${searchTerm},BT`, // Try Bhutan
                `${searchTerm},MX`, // Try Mexico
                `${searchTerm},GT`, // Try Guatemala
                `${searchTerm},BZ`, // Try Belize
                `${searchTerm},SV`, // Try El Salvador
                `${searchTerm},HN`, // Try Honduras
                `${searchTerm},NI`, // Try Nicaragua
                `${searchTerm},CR`, // Try Costa Rica
                `${searchTerm},PA`, // Try Panama
                `${searchTerm},CO`, // Try Colombia
                `${searchTerm},VE`, // Try Venezuela
                `${searchTerm},GY`, // Try Guyana
                `${searchTerm},SR`, // Try Suriname
                `${searchTerm},GF`, // Try French Guiana
                `${searchTerm},EC`, // Try Ecuador
                `${searchTerm},PE`, // Try Peru
                `${searchTerm},BO`, // Try Bolivia
                `${searchTerm},PY`, // Try Paraguay
                `${searchTerm},UY`, // Try Uruguay
                `${searchTerm},AR`, // Try Argentina
                `${searchTerm},CL`, // Try Chile
                `${searchTerm},FK`, // Try Falkland Islands
                `${searchTerm},GS`, // Try South Georgia
                `${searchTerm},NZ`, // Try New Zealand
                `${searchTerm},FJ`, // Try Fiji
                `${searchTerm},PG`, // Try Papua New Guinea
                `${searchTerm},SB`, // Try Solomon Islands
                `${searchTerm},NC`, // Try New Caledonia
                `${searchTerm},VU`, // Try Vanuatu
                `${searchTerm},WS`, // Try Samoa
                `${searchTerm},TO`, // Try Tonga
                `${searchTerm},TV`, // Try Tuvalu
                `${searchTerm},KI`, // Try Kiribati
                `${searchTerm},NR`, // Try Nauru
                `${searchTerm},PW`, // Try Palau
                `${searchTerm},FM`, // Try Micronesia
                `${searchTerm},MH`, // Try Marshall Islands
                `${searchTerm},PT`, // Try Portugal
                `${searchTerm},ES`, // Try Spain
                `${searchTerm},AD`, // Try Andorra
                `${searchTerm},MC`, // Try Monaco
                `${searchTerm},LI`, // Try Liechtenstein
                `${searchTerm},SM`, // Try San Marino
                `${searchTerm},VA`, // Try Vatican City
                `${searchTerm},MT`, // Try Malta
                `${searchTerm},CY`, // Try Cyprus
                `${searchTerm},IS`, // Try Iceland
                `${searchTerm},IE`, // Try Ireland
                `${searchTerm},LU`, // Try Luxembourg
                `${searchTerm},SK`, // Try Slovakia
                `${searchTerm},SI`, // Try Slovenia
                `${searchTerm},HR`, // Try Croatia
                `${searchTerm},BA`, // Try Bosnia and Herzegovina
                `${searchTerm},RS`, // Try Serbia
                `${searchTerm},ME`, // Try Montenegro
                `${searchTerm},MK`, // Try North Macedonia
                `${searchTerm},AL`, // Try Albania
                `${searchTerm},XK`, // Try Kosovo
                `${searchTerm},MD`, // Try Moldova
                `${searchTerm},UA`, // Try Ukraine
                `${searchTerm},BY`, // Try Belarus
                `${searchTerm},LT`, // Try Lithuania
                `${searchTerm},LV`, // Try Latvia
                `${searchTerm},EE`, // Try Estonia
                `${searchTerm},GE`, // Try Georgia
                `${searchTerm},AM`, // Try Armenia
                `${searchTerm},AZ`, // Try Azerbaijan
                `${searchTerm},MA`, // Try Morocco
                `${searchTerm},DZ`, // Try Algeria
                `${searchTerm},TN`, // Try Tunisia
                `${searchTerm},LY`, // Try Libya
                `${searchTerm},SD`, // Try Sudan
                `${searchTerm},SS`, // Try South Sudan
                `${searchTerm},ET`, // Try Ethiopia
                `${searchTerm},ER`, // Try Eritrea
                `${searchTerm},DJ`, // Try Djibouti
                `${searchTerm},SO`, // Try Somalia
                `${searchTerm},KE`, // Try Kenya
                `${searchTerm},UG`, // Try Uganda
                `${searchTerm},RW`, // Try Rwanda
                `${searchTerm},BI`, // Try Burundi
                `${searchTerm},TZ`, // Try Tanzania
                `${searchTerm},MZ`, // Try Mozambique
                `${searchTerm},MW`, // Try Malawi
                `${searchTerm},ZM`, // Try Zambia
                `${searchTerm},ZW`, // Try Zimbabwe
                `${searchTerm},BW`, // Try Botswana
                `${searchTerm},NA`, // Try Namibia
                `${searchTerm},SZ`, // Try Eswatini
                `${searchTerm},LS`, // Try Lesotho
                `${searchTerm},MG`, // Try Madagascar
                `${searchTerm},MU`, // Try Mauritius
                `${searchTerm},SC`, // Try Seychelles
                `${searchTerm},KM`, // Try Comoros
                `${searchTerm},CV`, // Try Cape Verde
                `${searchTerm},ST`, // Try Sao Tome and Principe
                `${searchTerm},GQ`, // Try Equatorial Guinea
                `${searchTerm},GA`, // Try Gabon
                `${searchTerm},CG`, // Try Republic of the Congo
                `${searchTerm},CD`, // Try Democratic Republic of the Congo
                `${searchTerm},CF`, // Try Central African Republic
                `${searchTerm},CM`, // Try Cameroon
                `${searchTerm},TD`, // Try Chad
                `${searchTerm},NE`, // Try Niger
                `${searchTerm},BF`, // Try Burkina Faso
                `${searchTerm},ML`, // Try Mali
                `${searchTerm},MR`, // Try Mauritania
                `${searchTerm},SN`, // Try Senegal
                `${searchTerm},GM`, // Try Gambia
                `${searchTerm},GW`, // Try Guinea-Bissau
                `${searchTerm},GN`, // Try Guinea
                `${searchTerm},SL`, // Try Sierra Leone
                `${searchTerm},LR`, // Try Liberia
                `${searchTerm},CI`, // Try Ivory Coast
                `${searchTerm},GH`, // Try Ghana
                `${searchTerm},TG`, // Try Togo
                `${searchTerm},BJ`, // Try Benin
                `${searchTerm},AO`, // Try Angola
                `${searchTerm},JO`, // Try Jordan
                `${searchTerm},LB`, // Try Lebanon
                `${searchTerm},SY`, // Try Syria
                `${searchTerm},YE`, // Try Yemen
                `${searchTerm},OM`, // Try Oman
                `${searchTerm},QA`, // Try Qatar
                `${searchTerm},BH`, // Try Bahrain
                `${searchTerm},KW`, // Try Kuwait
            ];
            
            // Try each search strategy until we find a good match
            for (let strategy of searchStrategies) {
                try {
                    const results = await this.searchCityWithStrategy(strategy);
                    if (results && results.length > 0) {
                        // Filter results to find the best match
                        const bestMatch = this.findBestMatch(results, searchTerm);
                        if (bestMatch) {
                            console.log(`Found best match: ${bestMatch.name}, ${bestMatch.country}`);
                            await this.getWeatherByCoords(bestMatch.lat, bestMatch.lon);
                            return;
                        }
                    }
                } catch (error) {
                    console.log(`Strategy "${strategy}" failed:`, error.message);
                    continue;
                }
            }
            
            // If no strategy worked, show error
            throw new Error('City not found in any location');
            
        } catch (error) {
            console.error('Enhanced search failed:', error);
            this.showError(`Unable to find weather data for "${searchTerm}". Please try a different city name or check spelling.`);
        }
    }

    async searchCityWithStrategy(searchQuery) {
        const geoUrl = `${this.GEOCODING_URL}direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${this.API_KEY}`;
        
        const response = await fetch(geoUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }

    findBestMatch(results, originalSearch) {
        // Score results based on how well they match the original search
        const scoredResults = results.map(result => {
            let score = 0;
            const resultName = result.name.toLowerCase();
            const searchTerm = originalSearch.toLowerCase();
            
            // Exact match gets highest score
            if (resultName === searchTerm) score += 100;
            
            // Starts with search term
            if (resultName.startsWith(searchTerm)) score += 50;
            
            // Contains search term
            if (resultName.includes(searchTerm)) score += 25;
            
            // Prefer results from major countries
            const majorCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'IN', 'BR', 'MX', 'RU', 'MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'KR', 'TW', 'HK', 'AE', 'SA'];
            if (majorCountries.includes(result.country)) score += 10;
            
            // Prefer results with higher population (if available)
            if (result.population && result.population > 100000) score += 5;
            
            return { ...result, score };
        });
        
        // Sort by score and return the best match
        scoredResults.sort((a, b) => b.score - a.score);
        return scoredResults[0];
    }

    handleSearchSuggestions(value) {
        if (value.length > 0) {
            this.filterSuggestions(value);
            this.showSearchSuggestions();
        } else {
            this.createSearchSuggestions();
            this.showSearchSuggestions();
        }
    }

    filterSuggestions(searchTerm) {
        if (!this.searchSuggestions) return;
        
        const filtered = this.popularCities.filter(city => 
            city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.display.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.searchSuggestions.innerHTML = '';
        
        filtered.forEach(city => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = city.display;
            suggestionItem.dataset.cityName = city.name;
            suggestionItem.dataset.fullName = city.fullName;
            
            suggestionItem.addEventListener('click', () => {
                this.cityInput.value = city.name;
                this.getWeatherByCity(city.fullName);
                this.hideSearchSuggestions();
            });
            
            this.searchSuggestions.appendChild(suggestionItem);
        });
        
        // If no popular cities match, show "Search for [term]" option
        if (filtered.length === 0) {
            const searchItem = document.createElement('div');
            searchItem.className = 'suggestion-item';
            searchItem.innerHTML = `<i class="fas fa-search"></i> Search for "${searchTerm}"`;
            
            searchItem.addEventListener('click', () => {
                this.cityInput.value = searchTerm;
                this.performEnhancedSearch(searchTerm);
                this.hideSearchSuggestions();
            });
            
            this.searchSuggestions.appendChild(searchItem);
        }
    }

    showSearchSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'block';
        }
    }

    hideSearchSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'none';
        }
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    this.hideLoading();
                    this.showError('Unable to access your location. Please search for a city manually.');
                }
            );
        } else {
            this.showError('Geolocation is not supported by this browser.');
        }
    }

    async getWeatherByCity(city) {
        try {
            this.showLoading();
            console.log(`Searching for city: ${city}`);
            
            const geoUrl = `${this.GEOCODING_URL}direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.API_KEY}`;
            console.log('Geocoding URL:', geoUrl);
            
            const geoResponse = await fetch(geoUrl);
            console.log('Geocoding response status:', geoResponse.status);
            
            if (!geoResponse.ok) {
                throw new Error(`Geocoding API error: ${geoResponse.status} ${geoResponse.statusText}`);
            }
            
            const geoData = await geoResponse.json();
            console.log('Geocoding data:', geoData);
            
            if (geoData.length === 0) {
                throw new Error('City not found');
            }
            
            const { lat, lon } = geoData[0];
            console.log(`Coordinates found: lat=${lat}, lon=${lon}`);
            
            await this.getWeatherByCoords(lat, lon);
            
        } catch (error) {
            console.error('Error in getWeatherByCity:', error);
            this.hideLoading();
            this.showError(`Unable to fetch weather data for "${city}". Error: ${error.message}`);
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
            
            const currentUrl = `${this.BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
            console.log('Current weather URL:', currentUrl);
            
            const currentResponse = await fetch(currentUrl);
            console.log('Current weather response status:', currentResponse.status);
            
            if (!currentResponse.ok) {
                throw new Error(`Current weather API error: ${currentResponse.status} ${currentResponse.statusText}`);
            }
            
            const currentData = await currentResponse.json();
            console.log('Current weather data:', currentData);
            
            const forecastUrl = `${this.BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
            const forecastResponse = await fetch(forecastUrl);
            
            if (!forecastResponse.ok) {
                throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
            }
            
            const forecastData = await forecastResponse.json();
            
            let uvData = { value: null };
            try {
                const uvUrl = `${this.BASE_URL}uvi?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`;
                const uvResponse = await fetch(uvUrl);
                if (uvResponse.ok) {
                    uvData = await uvResponse.json();
                }
            } catch (uvError) {
                console.log('UV index not available:', uvError.message);
            }
            
            this.hideLoading();
            this.displayCurrentWeather(currentData, uvData);
            this.displayForecast(forecastData);
            this.displayHourlyForecast(forecastData);
            this.updateQuickStats();
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('Error in getWeatherByCoords:', error);
            this.hideLoading();
            this.showError(`Unable to fetch weather data. Error: ${error.message}`);
        }
    }

    displayCurrentWeather(data, uvData) {
        const { name, main, weather, wind, visibility, clouds, dt, coord, sys } = data;
        
        // Update main weather info
        if (this.currentCity) this.currentCity.textContent = name;
        if (this.currentDate) this.currentDate.textContent = this.formatDate(dt);
        if (this.currentWeatherIcon) this.currentWeatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
        if (this.currentTemp) this.currentTemp.textContent = Math.round(main.temp);
        if (this.currentDescription) this.currentDescription.textContent = weather[0].description;
        if (this.feelsLike) this.feelsLike.textContent = `Feels like ${Math.round(main.feels_like)}°C`;
        
        // Update coordinates
        if (this.coordinates) this.coordinates.textContent = `${coord.lat.toFixed(2)}°, ${coord.lon.toFixed(2)}°`;
        
        // Update weather details
        if (this.visibility) this.visibility.textContent = `${(visibility / 1000).toFixed(1)} km`;
        if (this.humidity) this.humidity.textContent = `${main.humidity}%`;
        if (this.windSpeed) this.windSpeed.textContent = `${wind.speed} m/s`;
        if (this.pressure) this.pressure.textContent = `${main.pressure} hPa`;
        if (this.uvIndex) this.uvIndex.textContent = uvData.value ? uvData.value.toFixed(1) : 'N/A';
        if (this.cloudiness) this.cloudiness.textContent = `${clouds.all}%`;
        
        // Update additional metrics
        if (this.tempRange) this.tempRange.textContent = `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`;
        if (this.sunrise) this.sunrise.textContent = this.formatTime(sys.sunrise);
        if (this.sunset) this.sunset.textContent = this.formatTime(sys.sunset);
        
        // Update wind direction
        if (this.windDirection && wind.deg) {
            const arrow = this.windDirection.querySelector('i');
            if (arrow) {
                arrow.style.transform = `rotate(${wind.deg}deg)`;
            }
        }
        
        // Update progress bars
        this.updateProgressBars(main, uvData, visibility);
        
        // Update quick stats
        this.updateQuickStatsData(main, wind, visibility);
        
        this.showWeatherContent();
    }

    updateProgressBars(main, uvData, visibility) {
        // Visibility progress (0-20km scale)
        if (this.visibilityProgress) {
            const visibilityPercent = Math.min((visibility / 1000) / 20 * 100, 100);
            this.visibilityProgress.style.width = `${visibilityPercent}%`;
        }
        
        // Humidity progress
        if (this.humidityProgress) {
            this.humidityProgress.style.width = `${main.humidity}%`;
        }
        
        // UV index bar (0-11 scale)
        if (this.uvBar && uvData.value) {
            const uvPercent = Math.min((uvData.value / 11) * 100, 100);
            this.uvBar.style.left = `${uvPercent}%`;
        }
    }

    updateQuickStatsData(main, wind, visibility) {
        if (this.quickTemp) this.quickTemp.textContent = `${Math.round(main.temp)}°C`;
        if (this.quickHumidity) this.quickHumidity.textContent = `${main.humidity}%`;
        if (this.quickWind) this.quickWind.textContent = `${wind.speed} m/s`;
        if (this.quickVisibility) this.quickVisibility.textContent = `${(visibility / 1000).toFixed(1)} km`;
    }

    updateQuickStats() {
        // This method will be called to update quick stats
        // It's a placeholder for when weather data is available
    }

    updateLastUpdated() {
        if (this.lastUpdated) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kuala_Lumpur'
            });
            this.lastUpdated.textContent = timeString;
        }
    }

    displayForecast(data) {
        if (!this.forecastContainer) return;
        
        const dailyForecasts = this.processForecastData(data.list);
        
        this.forecastContainer.innerHTML = '';
        
        dailyForecasts.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card daily-card';
            
            forecastCard.innerHTML = `
                <div class="forecast-day-info">
                    <div class="day">${forecast.day}</div>
                    <div class="date">${forecast.date}</div>
                </div>
                <img src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.description}">
                <div class="description">${forecast.description}</div>
                <div class="temp-range">${forecast.maxTemp}° / ${forecast.minTemp}°</div>
            `;
            
            this.forecastContainer.appendChild(forecastCard);
        });
    }

    displayHourlyForecast(data) {
        if (!this.hourlyContainer) return;
        
        const hourlyForecasts = data.list.slice(0, 8);
        
        this.hourlyContainer.innerHTML = '';
        
        hourlyForecasts.forEach(forecast => {
            const hourlyCard = document.createElement('div');
            hourlyCard.className = 'hourly-card';
            
            hourlyCard.innerHTML = `
                <div class="time">${this.formatTime(forecast.dt)}</div>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <div class="temp">${Math.round(forecast.main.temp)}°</div>
            `;
            
            this.hourlyContainer.appendChild(hourlyCard);
        });
    }

    processForecastData(forecasts) {
        const dailyData = {};
        
        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: dateKey,
                    temps: [],
                    descriptions: [],
                    icons: []
                };
            }
            
            dailyData[dateKey].temps.push(forecast.main.temp);
            dailyData[dateKey].descriptions.push(forecast.weather[0].description);
            dailyData[dateKey].icons.push(forecast.weather[0].icon);
        });
        
        return Object.values(dailyData).slice(0, 5).map(day => ({
            day: this.getDayName(day.date),
            date: this.formatDateShort(day.date),
            maxTemp: Math.round(Math.max(...day.temps)),
            minTemp: Math.round(Math.min(...day.temps)),
            description: day.descriptions[0],
            icon: day.icons[0]
        }));
    }

    formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kuala_Lumpur'
        });
    }

    formatDateShort(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kuala_Lumpur'
        });
    }

    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kuala_Lumpur'
        });
    }

    getDayName(dateString) {
        const today = new Date().toDateString();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
        
        if (dateString === today) return 'Today';
        if (dateString === tomorrow) return 'Tomorrow';
        
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            timeZone: 'Asia/Kuala_Lumpur'
        });
    }

    showLoading() {
        if (this.loading) this.loading.style.display = 'flex';
        if (this.weatherContent) this.weatherContent.classList.remove('show');
        if (this.errorMessage) this.errorMessage.classList.remove('show');
    }

    hideLoading() {
        if (this.loading) this.loading.style.display = 'none';
    }

    showWeatherContent() {
        if (this.weatherContent) this.weatherContent.classList.add('show');
        if (this.errorMessage) this.errorMessage.classList.remove('show');
    }

    showError(message) {
        if (this.errorText) this.errorText.textContent = message;
        if (this.errorMessage) this.errorMessage.classList.add('show');
        if (this.weatherContent) this.weatherContent.classList.remove('show');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernWeatherApp();
});