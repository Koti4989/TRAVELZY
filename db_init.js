const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'KOti@2989',
    database: 'travelzy_db'
};

async function initializeDatabase() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);

        // Drop existing tables in reverse order of dependencies
        await connection.query('DROP TABLE IF EXISTS activities');
        await connection.query('DROP TABLE IF EXISTS itinerary_days');
        await connection.query('DROP TABLE IF EXISTS food_places');
        await connection.query('DROP TABLE IF EXISTS accommodations');
        await connection.query('DROP TABLE IF EXISTS attractions');
        await connection.query('DROP TABLE IF EXISTS destinations');

        // Create tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                price_per_day DECIMAL(10,2)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS attractions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id VARCHAR(50),
                name VARCHAR(100) NOT NULL,
                description TEXT,
                entry_fee VARCHAR(50),
                opening_hours VARCHAR(100),
                FOREIGN KEY (destination_id) REFERENCES destinations(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS accommodations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id VARCHAR(50),
                type VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                FOREIGN KEY (destination_id) REFERENCES destinations(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS food_places (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id VARCHAR(50),
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50),
                price_range VARCHAR(50),
                description TEXT,
                FOREIGN KEY (destination_id) REFERENCES destinations(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS itinerary_days (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id VARCHAR(50),
                day_number INT NOT NULL,
                title VARCHAR(100) NOT NULL,
                FOREIGN KEY (destination_id) REFERENCES destinations(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                itinerary_day_id INT,
                time TIME NOT NULL,
                type VARCHAR(50) NOT NULL,
                place_name VARCHAR(100) NOT NULL,
                description TEXT,
                FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id)
            )
        `);

        // Create reviews table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reviewer_name VARCHAR(100) NOT NULL,
                destination VARCHAR(100) NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert some pre-installed reviews
        await connection.query(`
            INSERT INTO reviews (reviewer_name, destination, rating, review_text) VALUES
            ('Rahul Verma', 'Goa', 5, 'The beaches were pristine, and the nightlife was incredible. TRAVELZY helped me discover hidden gems I would have never found on my own!'),
            ('Ananya Patel', 'Kerala', 5, 'The backwaters experience was magical. The houseboat stay arranged by TRAVELZY was comfortable and authentic. Highly recommended!'),
            ('Vikram Singh', 'Himalayas', 4, 'The trekking routes suggested by TRAVELZY were perfect for beginners. The views were breathtaking, and the local guides were very helpful.')
        `);

        // Insert Varkala data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['varkala', 'Varkala, Kerala', 'beach', 'A stunning cliff-side beach destination with spiritual significance, offering a perfect blend of beaches, culture, and wellness.', '/images/varkala.jpg', 5000]
        );

        // Insert Taj Mahal data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['taj-mahal', 'Taj Mahal, Agra', 'historical', 'One of the Seven Wonders of the World, a stunning white marble mausoleum built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.', '/images/taj-mahal.jpg', 4000]
        );

        // Insert Taj Mahal attractions
        const tajMahalAttractions = [
            'Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itmad-ud-Daulah\'s Tomb',
            'Mehtab Bagh', 'Jama Masjid', 'Akbar\'s Tomb', 'Sikandra Fort',
            'Chini Ka Rauza', 'Ram Bagh'
        ];

        for (const attraction of tajMahalAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('taj-mahal', ?, ?, ?, ?)
            `, [attraction, 'INR 1000', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Taj Mahal accommodations
        const tajMahalAccommodations = [
            { type: 'luxury', name: 'The Oberoi Amarvilas' },
            { type: 'midRange', name: 'Hotel Clarks Shiraz' },
            { type: 'budget', name: 'Hotel Kamal' }
        ];

        for (const acc of tajMahalAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('taj-mahal', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Taj Mahal food places
        const tajMahalFood = [
            'Peshawri', 'Esphahan', 'Pinch of Spice', 'Joney\'s Place',
            'Dasaprakash', 'Lakshmi Vilas', 'Shankara Vegis Restaurant',
            'Taj Cafe', 'Cafe Sheroes', 'Mama Chicken'
        ];

        for (const food of tajMahalFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('taj-mahal', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 500-1000', 'Traditional Kerala dishes', '']);
        }

        // Insert Taj Mahal itinerary days
        const tajMahalItinerary = [
            { day: 1, title: 'Arrival & Taj Mahal Visit' },
            { day: 2, title: 'Agra Fort & Local Exploration' },
            { day: 3, title: 'Fatehpur Sikri Day Trip' },
            { day: 4, title: 'Local Markets & Culture' },
            { day: 5, title: 'More Historical Sites' },
            { day: 6, title: 'Relaxation & Shopping' },
            { day: 7, title: 'Departure Day' }
        ];

        for (const day of tajMahalItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('taj-mahal', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getTajMahalActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Goa data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['goa', 'Goa', 'beach', 'A tropical paradise known for its pristine beaches, vibrant nightlife, Portuguese architecture, and delicious seafood.', '/images/goa.jpg', 6000]
        );

        // Insert Goa attractions
        const goaAttractions = [
            'Baga Beach', 'Calangute Beach', 'Anjuna Beach', 'Fort Aguada',
            'Basilica of Bom Jesus', 'Dudhsagar Falls', 'Chapora Fort',
            'Spice Plantations', 'Old Goa Churches', 'Panaji City'
        ];

        for (const attraction of goaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('goa', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Goa accommodations
        const goaAccommodations = [
            { type: 'luxury', name: 'Taj Exotica Resort & Spa' },
            { type: 'midRange', name: 'Alila Diwa Goa' },
            { type: 'budget', name: 'Casa De Goa' }
        ];

        for (const acc of goaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('goa', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Goa food places
        const goaFood = [
            'Pousada by the Beach', 'Gunpowder', 'Viva Panjim',
            'Martin\'s Corner', 'Fisherman\'s Wharf', 'Cafe Bodega',
            'Souza Lobo', 'Bomra\'s', 'Cafe Chocolatti',
            'La Plage'
        ];

        for (const food of goaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('goa', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Goan specialties', '']);
        }

        // Insert Goa itinerary days
        const goaItinerary = [
            { day: 1, title: 'Arrival & Beach Time' },
            { day: 2, title: 'North Goa Exploration' },
            { day: 3, title: 'Waterfalls & Spice Plantations' },
            { day: 4, title: 'Old Goa & Churches' },
            { day: 5, title: 'South Goa Beaches' },
            { day: 6, title: 'Adventure & Nightlife' },
            { day: 7, title: 'Shopping & Departure' }
        ];

        for (const day of goaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('goa', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getGoaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Varkala attractions
        const varkalaAttractions = [
            'Varkala Cliff', 'Papanasam Beach', 'Janardanaswamy Temple', 'Varkala Aquarium',
            'Anchuthengu Fort & Lighthouse', 'Kappil Beach and backwaters', 'Edava Beach',
            'Odayam Beach', 'Janaki Forest', 'Helipad Viewpoint'
        ];

        for (const attraction of varkalaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('varkala', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Varkala accommodations
        const varkalaAccommodations = [
            { type: 'luxury', name: 'The Gateway Hotel Janardhanapuram Varkala' },
            { type: 'midRange', name: 'Vedanta Wake Up - Helipad North Cliff' },
            { type: 'budget', name: 'Mango Villa' }
        ];

        for (const acc of varkalaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('varkala', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Varkala food places
        const varkalaFood = [
            'Coffee Temple Café', 'Abba Restaurant', 'Darjeeling Café', 'Inda Café',
            'Green Pepper Restaurant', 'Trattorias', 'God\'s Own Country Kitchen',
            'Clafouti Restaurant', 'Sky Lounge', 'Café del Mar',
            'Varkala Marine Palace Restaurant', 'Sreepadman Restaurant', 'Chili Café',
            'Juice Shack', 'Café Tandoor', 'Palm Tree Heritage Restaurant',
            'Soul & Surf Café'
        ];

        for (const food of varkalaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('varkala', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Traditional Kerala dishes', '']);
        }

        // Insert Varkala itinerary days
        const varkalaItinerary = [
            { day: 1, title: 'Arrival & Cliffside Vibes' },
            { day: 2, title: 'Spiritual & Scenic' },
            { day: 3, title: 'Water & Wellness' },
            { day: 4, title: 'Colonial Exploration' },
            { day: 5, title: 'Beach Picnic & Nature' },
            { day: 6, title: 'Foodie\'s Day Out' },
            { day: 7, title: 'Departure Day' }
        ];

        for (const day of varkalaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('varkala', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getVarkalaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Tarkarli data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['tarkarli', 'Tarkarli, Maharashtra', 'beach', 'Known for its crystal clear waters, water sports activities, and rich Malvani cuisine.', '/images/tarkarli.jpg', 4500]
        );

        // Insert Tarkarli attractions
        const tarkarliAttractions = [
            'Tarkarli Beach', 'Sindhudurg Fort', 'Kolamb Beach', 'Devbagh Beach',
            'Rock Garden', 'Karli Backwaters', 'Tsunami Island', 'Malvan Town',
            'Devbagh Sangam Point'
        ];

        for (const attraction of tarkarliAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('tarkarli', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Tarkarli accommodations
        const tarkarliAccommodations = [
            { type: 'luxury', name: 'Sea View Resort' },
            { type: 'midRange', name: 'MTDC Resort Tarkarli' },
            { type: 'budget', name: 'Sai Sagar Beach Resort' }
        ];

        for (const acc of tarkarliAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('tarkarli', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Tarkarli food places
        const tarkarliFood = [
            'Hotel Chintamani', 'Atithi Bamboo', 'Samindar Malvan Restaurant',
            'MTDC Tarkarli Beach Café', 'Chaitanya Restaurant', 'Bhalekar\'s Malvani Khanaval',
            'Hotel Ruchira', 'Hotel Sun N Sand', 'Gajanan Restaurant',
            'Tarkarli Niwas Nyahari', 'Bison Eco Resort Café', 'Annapurna Home Kitchen',
            'Hotel Jivhala', 'Bhagat Khanaval', 'Rane Khanaval',
            'Hotel Mayekar\'s', 'Sai International Café'
        ];

        for (const food of tarkarliFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('tarkarli', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Malvani cuisine', '']);
        }

        // Insert Tarkarli itinerary days
        const tarkarliItinerary = [
            { day: 1, title: 'Arrival & Beach Vibes' },
            { day: 2, title: 'Scuba & Snorkeling Adventure' },
            { day: 3, title: 'Fort & History' },
            { day: 4, title: 'Backwaters & Village Life' },
            { day: 5, title: 'Devbagh Peninsula' },
            { day: 6, title: 'Food & Culture Day' },
            { day: 7, title: 'Chill & Departure' }
        ];

        for (const day of tarkarliItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('tarkarli', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getTarkarliActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Gokarna data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['gokarna', 'Gokarna, Karnataka', 'beach', 'A sacred temple town with pristine beaches, known for its spiritual significance and laid-back beach culture.', '/images/gokarna.jpg', 4000]
        );

        // Insert Gokarna attractions
        const gokarnaAttractions = [
            'Mahabaleshwar Temple', 'Gokarna Beach', 'Kudle Beach', 'Om Beach',
            'Half Moon Beach', 'Paradise Beach', 'Mirjan Fort', 'Yana Caves',
            'Kotiteertha', 'Shivaganga'
        ];

        for (const attraction of gokarnaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('gokarna', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Gokarna accommodations
        const gokarnaAccommodations = [
            { type: 'luxury', name: 'SwaSwara' },
            { type: 'midRange', name: 'Namaste Yoga Farm' },
            { type: 'budget', name: 'Zostel Gokarna' }
        ];

        for (const acc of gokarnaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('gokarna', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Gokarna food places
        const gokarnaFood = [
            'Namaste Café', 'Pai Restaurant', 'Prema Restaurant', 'Sunset Café',
            'Gokarna International Hotel', 'Laughing Buddha Restaurant', 'Café 1987',
            'Pranam Café', 'Dolphin Bay Restaurant', 'Ganga Café'
        ];

        for (const food of gokarnaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('gokarna', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'South Indian cuisine', '']);
        }

        // Insert Gokarna itinerary days
        const gokarnaItinerary = [
            { day: 1, title: 'Arrival & Temple Visit' },
            { day: 2, title: 'Beach Hopping' },
            { day: 3, title: 'Adventure & Nature' },
            { day: 4, title: 'Cultural Exploration' },
            { day: 5, title: 'Beach Activities' },
            { day: 6, title: 'Local Experience' },
            { day: 7, title: 'Departure Day' }
        ];

        for (const day of gokarnaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('gokarna', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getGokarnaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Backwaters data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['backwaters', 'Backwaters, Kerala', 'beach', 'Explore the serene backwaters of Kerala via houseboat and ferry, experiencing local village life and cuisine.', '/images/backwaters.jpg', 2143]
        );
        const backwatersAttractions = [
            'Alleppey Beach', 'Alleppey Lighthouse', 'Finishing Point Alleppey', 'Kuttanad',
            'Vembanad Lake', 'Kumarakom Bird Sanctuary', 'Marari Beach', 'Alleppey Backwaters', 'Coir Museum Alleppey'
        ];
        for (const attraction of backwatersAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('backwaters', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }
        const backwatersAccommodations = [
            { type: 'luxury', name: 'Luxury Houseboat Stay' },
            { type: 'midRange', name: 'Resort/Hotel in Alleppey/Kumarakom' },
            { type: 'budget', name: 'Zostel / Budget Hotel / Homestay' }
        ];
        for (const acc of backwatersAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('backwaters', ?, ?)
            `, [acc.type, acc.name]);
        }
        const backwatersFood = [
            'Railway station café', 'Cassia Restaurant', 'Dreamers Café', 'Halais Restaurant',
            'Indian Coffee House', 'Local toddy shop', 'Street food near Mullackal Temple',
            'Café Aramana', 'Homestay/Local Dhaba', 'The Waterside', 'Thaff Restaurant',
            'Local stall (kappa & meen curry)'
        ];
        for (const food of backwatersFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('backwaters', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 200-500', 'South Indian cuisine', '']);
        }
        const backwatersItinerary = [
            { day: 1, title: 'Arrival in Alleppey' },
            { day: 2, title: 'Houseboat Day (Shared Option)' },
            { day: 3, title: 'Explore Backwaters via Ferry' },
            { day: 4, title: 'Alleppey to Kumarakom' },
            { day: 5, title: 'Village Life & Culture' },
            { day: 6, title: 'Back to Alleppey + Beach' },
            { day: 7, title: 'Wrap-Up & Local Shopping' }
        ];
        for (const day of backwatersItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('backwaters', ?, ?)
            `, [day.day, day.title]);
            const activities = getBackwatersActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }
       
        // Insert Spiti Valley data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['spiti', 'Spiti Valley, Himachal Pradesh', 'mountain', 'A high-altitude desert valley with stunning landscapes and ancient monasteries.', '/images/spiti.jpg', 6000]
        );

        // Insert Spiti Valley attractions
        const spitiAttractions = [
            'Key Monastery', 'Chicham Bridge', 'Dhankar Monastery', 'Dhankar Lake',
            'Tabo Monastery', 'Gue Mummy Monastery', 'Langza Village', 'Hikkim Post Office',
            'Komic Village', 'Pin Valley National Park', 'Mudh Village'
        ];

        for (const attraction of spitiAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('spiti', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Spiti Valley accommodations
        const spitiAccommodations = [
            { type: 'luxury', name: 'The Grand Dewachen' },
            { type: 'midRange', name: 'Hotel Deyzor, Kaza' },
            { type: 'budget', name: 'Homestays in Kaza and Tabo' }
        ];

        for (const acc of spitiAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('spiti', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Spiti Valley food places
        const spitiFood = [
            'The Himalayan Café', 'Sol Café', 'Taste of Spiti', 'Key Monastery Kitchen',
            'Hotel Deyzor Restaurant', 'Hotel Sakya Abode', 'The Dragon Restaurant',
            'Tabo Homestay Café', 'Langza Homestay', 'Sagnam village café'
        ];

        for (const food of spitiFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('spiti', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Himachali cuisine', '']);
        }

        // Insert Spiti Valley itinerary days
        const spitiItinerary = [
            { day: 1, title: 'Arrival & Acclimatization' },
            { day: 2, title: 'Key Monastery & Local Exploration' },
            { day: 3, title: 'Dhankar & Tabo' },
            { day: 4, title: 'Pin Valley Adventure' },
            { day: 5, title: 'Langza & Hikkim' },
            { day: 6, title: 'Komic & Local Culture' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of spitiItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('spiti', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getSpitiActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Tawang data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['tawang', 'Tawang, Arunachal Pradesh', 'mountain', 'Home to India\'s largest Buddhist monastery and stunning high-altitude lakes.', '/images/tawang.jpg', 5500]
        );

        // Insert Tawang attractions
        const tawangAttractions = [
            'Tawang Monastery', 'Sela Pass', 'Madhuri Lake', 'Bum La Pass',
            'Jaswant Garh War Memorial', 'PTSO Lake', 'Urgelling Monastery',
            'Tawang War Memorial', 'Craft Centre', 'Dirang Valley'
        ];

        for (const attraction of tawangAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('tawang', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Tawang accommodations
        const tawangAccommodations = [
            { type: 'luxury', name: 'Hotel Tawang View' },
            { type: 'midRange', name: 'Dolma Khangsar Guesthouse' },
            { type: 'budget', name: 'Local homestays' }
        ];

        for (const acc of tawangAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('tawang', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Tawang food places
        const tawangFood = [
            'Hotel Shangrila', 'Se La Café', 'Dragon Restaurant', 'Dondrub Café',
            'Donyi Polo Restaurant', 'Orange Restaurant', 'Hotel Tawang Heights',
            'The Greenwood Restaurant', 'Tawang Kitchen', 'Hotel Zambhala',
            'Hotel Mon Paradise'
        ];

        for (const food of tawangFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('tawang', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Chinese cuisine', '']);
        }

        // Insert Tawang itinerary days
        const tawangItinerary = [
            { day: 1, title: 'Arrival & Monastery Visit' },
            { day: 2, title: 'Sela Pass & Lakes' },
            { day: 3, title: 'Bum La Pass Adventure' },
            { day: 4, title: 'War Memorials & Culture' },
            { day: 5, title: 'Local Craft & Shopping' },
            { day: 6, title: 'Dirang Valley Exploration' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of tawangItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('tawang', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getTawangActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Chopta data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['chopta', 'Chopta, Uttarakhand', 'mountain', 'Known as the Mini Switzerland of India, offering stunning alpine meadows and ancient temples.', '/images/chopta.jpg', 5000]
        );

        // Insert Chopta attractions
        const choptaAttractions = [
            'Tungnath Temple', 'Chandrashila Peak', 'Deoria Tal Lake', 'Sari Village',
            'Madmaheshwar Village', 'Chopta Meadows', 'Forest Trails', 'Local Markets'
        ];

        for (const attraction of choptaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('chopta', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Chopta accommodations
        const choptaAccommodations = [
            { type: 'luxury', name: 'Magpie Eco Retreat' },
            { type: 'midRange', name: 'Snow View Lodge' },
            { type: 'budget', name: 'Alpine Adventure Camps' }
        ];

        for (const acc of choptaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('chopta', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Chopta food places
        const choptaFood = [
            'Tungnath Café', 'Chopta Restaurant', 'The Chopta Café', 'Café Rudra',
            'Chopta Lodge', 'Hotel Chopta', 'Local Dhabas'
        ];

        for (const food of choptaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('chopta', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'North Indian cuisine', '']);
        }

        // Insert Chopta itinerary days
        const choptaItinerary = [
            { day: 1, title: 'Arrival & Local Exploration' },
            { day: 2, title: 'Tungnath Temple Trek' },
            { day: 3, title: 'Chandrashila Peak' },
            { day: 4, title: 'Deoria Tal Lake' },
            { day: 5, title: 'Sari Village & Meadows' },
            { day: 6, title: 'Madmaheshwar Village' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of choptaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('chopta', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getChoptaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Orchha data
        await connection.query(`
            INSERT INTO destinations (id, name, type, description, image_url, price_per_day)
            VALUES ('orchha', 'Orchha, Madhya Pradesh', 'historical',
            'A medieval town known for its magnificent palaces, temples, and cenotaphs along the Betwa River.',
            '/images/orchha.jpg', 4000)
        `);

        // Insert Orchha attractions
        const orchhaAttractions = [
            'Orchha Fort Complex', 'Jahangir Mahal', 'Raj Mahal', 'Raja Ram Temple',
            'Chhatris (Cenotaphs)', 'Betwa River', 'Laxmi Narayan Temple',
            'Phool Bagh', 'Hardaul\'s Palace', 'Local Markets'
        ];

        for (const attraction of orchhaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('orchha', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Orchha accommodations
        const orchhaAccommodations = [
            { type: 'luxury', name: 'Amar Mahal' },
            { type: 'midRange', name: 'Orchha Resort' },
            { type: 'budget', name: 'Local Guesthouses' }
        ];

        for (const acc of orchhaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('orchha', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Orchha food places
        const orchhaFood = [
            'Orchha Café', 'Betwa Retreat', 'Jahangir Restaurant',
            'Local Dhabas', 'Street Food Stalls', 'Traditional Restaurants'
        ];

        for (const food of orchhaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('orchha', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Indian cuisine', '']);
        }

        // Insert Orchha itinerary days
        const orchhaItinerary = [
            { day: 1, title: 'Arrival & Fort Exploration' },
            { day: 2, title: 'Palaces & Temples' },
            { day: 3, title: 'Chhatris & River' },
            { day: 4, title: 'Local Culture & Markets' },
            { day: 5, title: 'Nature & Gardens' },
            { day: 6, title: 'Religious Sites' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of orchhaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('orchha', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getOrchhaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Chand Baori data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['chandbaori', 'Chand Baori, Rajasthan', 'historical', 'Home to one of India\'s largest and deepest stepwells, surrounded by ancient temples.', '/images/chandbaori.jpg', 4000]
        );

        // Insert Chand Baori attractions
        const chandBaoriAttractions = [
            'Chand Baori Stepwell', 'Harshat Mata Temple', 'Bhand Deva Temple',
            'Sambhar Lake', 'Local Craft Shops', 'Pottery Centers', 'Local Markets',
            'Salt Pans', 'Sambhar Town Temples'
        ];

        for (const attraction of chandBaoriAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('chandbaori', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Chand Baori accommodations
        const chandBaoriAccommodations = [
            { type: 'luxury', name: 'Umaid Palace, Dausa' },
            { type: 'midRange', name: 'Hotel Abhaneri Niwas' },
            { type: 'budget', name: 'Local guesthouses in Dausa' }
        ];

        for (const acc of chandBaoriAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('chandbaori', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Chand Baori food places
        const chandBaoriFood = [
            'Hotel Amar Yatri Niwas', 'Rajasthani Dhaba', 'Rajputana Restaurant',
            'Local Street Vendors', 'Sambhar Local Eatery', 'Local Café'
        ];

        for (const food of chandBaoriFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('chandbaori', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Indian cuisine', '']);
        }

        // Insert Chand Baori itinerary days
        const chandBaoriItinerary = [
            { day: 1, title: 'Arrival & Stepwell Visit' },
            { day: 2, title: 'Temples & Architecture' },
            { day: 3, title: 'Local Crafts & Culture' },
            { day: 4, title: 'Sambhar Lake & Salt Pans' },
            { day: 5, title: 'Village Life & Markets' },
            { day: 6, title: 'Religious Sites' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of chandBaoriItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('chandbaori', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getChandBaoriActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Rishikesh data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['rishikesh', 'Rishikesh, Uttarakhand', 'adventure', 'The Yoga Capital of the World and a hub for adventure sports, offering white water rafting, bungee jumping, and spiritual experiences.', '/images/rishikesh.jpg', 3500]
        );

        // Insert Rishikesh attractions
        const rishikeshAttractions = [
            'Laxman Jhula', 'Ram Jhula', 'Triveni Ghat', 'Beatles Ashram',
            'Neelkanth Mahadev Temple', 'Jumpin Heights', 'White Water Rafting',
            'Yoga Centers', 'Local Cafes', 'Ganga Aarti'
        ];

        for (const attraction of rishikeshAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('rishikesh', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Rishikesh accommodations
        const rishikeshAccommodations = [
            { type: 'luxury', name: 'Aloha on the Ganges' },
            { type: 'midRange', name: 'Zostel Rishikesh' },
            { type: 'budget', name: 'Backpacker Hostels' }
        ];

        for (const acc of rishikeshAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('rishikesh', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Rishikesh food places
        const rishikeshFood = [
            'Little Buddha Café', 'Freedom Café', 'German Bakery',
            'Local Dhabas', 'Street Food Stalls', 'Organic Cafes'
        ];

        for (const food of rishikeshFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('rishikesh', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Indian cuisine', '']);
        }

        // Insert Rishikesh itinerary days
        const rishikeshItinerary = [
            { day: 1, title: 'Arrival & Local Exploration' },
            { day: 2, title: 'Adventure Sports' },
            { day: 3, title: 'Yoga & Meditation' },
            { day: 4, title: 'Temples & Ghats' },
            { day: 5, title: 'Nature & Cafes' },
            { day: 6, title: 'Local Culture' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of rishikeshItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('rishikesh', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getRishikeshActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Jim Corbett data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['jimcorbett', 'Jim Corbett National Park, Uttarakhand', 'adventure', 'India\'s oldest national park, home to the Royal Bengal Tiger and diverse wildlife, offering thrilling jungle safaris.', '/images/jimcorbett.jpg', 5000]
        );

        // Insert Jim Corbett attractions
        const jimCorbettAttractions = [
            'Jungle Safari', 'Dhikala Zone', 'Bijrani Zone', 'Corbett Museum',
            'Garjia Temple', 'Corbett Falls', 'Kosi River', 'Elephant Safari',
            'Bird Watching', 'Nature Walks'
        ];

        for (const attraction of jimCorbettAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('jimcorbett', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Jim Corbett accommodations
        const jimCorbettAccommodations = [
            { type: 'luxury', name: 'Taj Corbett Resort' },
            { type: 'midRange', name: 'Corbett The Baagh Spa & Resort' },
            { type: 'budget', name: 'Forest Rest Houses' }
        ];

        for (const acc of jimCorbettAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('jimcorbett', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Jim Corbett food places
        const jimCorbettFood = [
            'Resort Restaurants', 'Local Dhabas', 'Kosi River Café',
            'Forest Canteen', 'Village Eateries', 'Street Food Stalls'
        ];

        for (const food of jimCorbettFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('jimcorbett', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Indian cuisine', '']);
        }

        // Insert Jim Corbett itinerary days
        const jimCorbettItinerary = [
            { day: 1, title: 'Arrival & Orientation' },
            { day: 2, title: 'Morning Safari' },
            { day: 3, title: 'Dhikala Zone' },
            { day: 4, title: 'Bijrani Zone' },
            { day: 5, title: 'Nature & Culture' },
            { day: 6, title: 'Elephant Safari' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of jimCorbettItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('jimcorbett', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getJimCorbettActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        // Insert Kaziranga data
        await connection.query(
            'INSERT INTO destinations (id, name, type, description, image_url, price_per_day) VALUES (?, ?, ?, ?, ?, ?)',
            ['kaziranga', 'Kaziranga National Park, Assam', 'adventure', 'A UNESCO World Heritage Site known for its one-horned rhinoceros and diverse wildlife, offering exciting jeep and elephant safaris.', '/images/kaziranga.jpg', 4500]
        );

        // Insert Kaziranga attractions
        const kazirangaAttractions = [
            'Central Range Safari', 'Western Range Safari', 'Eastern Range Safari',
            'Elephant Safari', 'Kohora Watch Tower', 'Mikir Hills',
            'Tea Gardens', 'Local Villages', 'Cultural Shows', 'Bird Watching'
        ];

        for (const attraction of kazirangaAttractions) {
            await connection.query(`
                INSERT INTO attractions (destination_id, name, description, entry_fee, opening_hours)
                VALUES ('kaziranga', ?, ?, ?, ?)
            `, [attraction, 'Entry fee: INR 500', '9:00 AM - 5:00 PM', '']);
        }

        // Insert Kaziranga accommodations
        const kazirangaAccommodations = [
            { type: 'luxury', name: 'Diphlu River Lodge' },
            { type: 'midRange', name: 'Wild Grass Lodge' },
            { type: 'budget', name: 'Forest Rest Houses' }
        ];

        for (const acc of kazirangaAccommodations) {
            await connection.query(`
                INSERT INTO accommodations (destination_id, type, name)
                VALUES ('kaziranga', ?, ?)
            `, [acc.type, acc.name]);
        }

        // Insert Kaziranga food places
        const kazirangaFood = [
            'Lodge Restaurants', 'Local Assamese Eateries', 'Tea Garden Cafes',
            'Village Food Stalls', 'Street Food', 'Traditional Restaurants'
        ];

        for (const food of kazirangaFood) {
            await connection.query(`
                INSERT INTO food_places (destination_id, name, type, price_range, description)
                VALUES ('kaziranga', ?, ?, ?, ?)
            `, [food, 'Local', 'INR 300-700', 'Assamese cuisine', '']);
        }

        // Insert Kaziranga itinerary days
        const kazirangaItinerary = [
            { day: 1, title: 'Arrival & Orientation' },
            { day: 2, title: 'Central Range Safari' },
            { day: 3, title: 'Western Range Safari' },
            { day: 4, title: 'Eastern Range Safari' },
            { day: 5, title: 'Elephant Safari' },
            { day: 6, title: 'Local Culture' },
            { day: 7, title: 'Departure' }
        ];

        for (const day of kazirangaItinerary) {
            const [result] = await connection.query(`
                INSERT INTO itinerary_days (destination_id, day_number, title)
                VALUES ('kaziranga', ?, ?)
            `, [day.day, day.title]);

            // Insert activities for each day
            const activities = getKazirangaActivities(day.day);
            for (const activity of activities) {
                await connection.query(`
                    INSERT INTO activities (itinerary_day_id, time, type, place_name, description)
                    VALUES (?, ?, ?, ?, ?)
                `, [result.insertId, activity.time, activity.type, activity.place_name, activity.description]);
            }
        }

        console.log('Database initialized and data inserted successfully!');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Helper functions to get activities for each day
function getVarkalaActivities(day) {
    const activities = {
        1: [
            { time: '09:00', type: 'breakfast', place_name: 'Coffee Temple Café', description: 'Smoothie bowls, fresh fruit, dosa' },
            { time: '10:00', type: 'sightseeing', place_name: 'Varkala Cliff', description: 'Settle in and relax for a walk and views' },
            { time: '13:00', type: 'lunch', place_name: 'Abba Restaurant', description: 'Kerala fish curry, rice, mango lassi' },
            { time: '15:00', type: 'sightseeing', place_name: 'Black Sand Beach', description: 'Explore the unique black sand beach' },
            { time: '19:00', type: 'dinner', place_name: 'Darjeeling Café', description: 'Seafood platter and sunset dining' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Inda Café', description: 'Idiyappam with stew, South Indian coffee' },
            { time: '10:00', type: 'sightseeing', place_name: 'Janardanaswamy Temple', description: 'Visit temple and take ritual dip at Papanasam Beach' },
            { time: '13:00', type: 'lunch', place_name: 'Green Pepper Restaurant', description: 'Traditional Kerala meals on banana leaf' },
            { time: '15:00', type: 'sightseeing', place_name: 'Varkala Aquarium', description: 'Explore marine life' },
            { time: '19:00', type: 'dinner', place_name: 'Trattorias', description: 'Grilled tiger prawns and lemon butter fish' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'God\'s Own Country Kitchen', description: 'Puttu, kadala curry' },
            { time: '10:00', type: 'activity', place_name: 'Varkala Beach', description: 'Water sports (banana boat, jet ski)' },
            { time: '13:00', type: 'lunch', place_name: 'Clafouti Restaurant', description: 'Crab roast and pineapple juice' },
            { time: '15:00', type: 'wellness', place_name: 'Local Ayurvedic Spa', description: 'Ayurvedic spa massage' },
            { time: '19:00', type: 'dinner', place_name: 'Sky Lounge', description: 'Candlelight seafood grill dinner' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Café del Mar', description: 'Fresh juice, eggs, Kerala appam' },
            { time: '10:00', type: 'sightseeing', place_name: 'Anchuthengu Fort & Lighthouse', description: 'Explore colonial history' },
            { time: '13:00', type: 'lunch', place_name: 'Varkala Marine Palace Restaurant', description: 'Prawns masala and parotta' },
            { time: '15:00', type: 'sightseeing', place_name: 'Kappil Beach and backwaters', description: 'Explore beach and backwaters' },
            { time: '19:00', type: 'dinner', place_name: 'Sreepadman Restaurant', description: 'Local vegetarian thali and chutneys' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Chili Café', description: 'Toast, omelets, and papaya smoothie' },
            { time: '10:00', type: 'activity', place_name: 'Edava Beach', description: 'Picnic at less crowded and serene beach' },
            { time: '13:00', type: 'lunch', place_name: 'Juice Shack', description: 'Beachside lunch' },
            { time: '15:00', type: 'activity', place_name: 'Cliff Trail', description: 'Walking trail toward Odayam Beach' },
            { time: '19:00', type: 'dinner', place_name: 'Palm Tree Heritage Restaurant', description: 'Chef\'s special catch of the day' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Juice Shack', description: 'Banana pancakes, masala chai' },
            { time: '10:00', type: 'shopping', place_name: 'Local Markets', description: 'Walk local souvenir markets' },
            { time: '13:00', type: 'lunch', place_name: 'Café Tandoor', description: 'Tandoori pomfret, naan, mint chutney' },
            { time: '15:00', type: 'sightseeing', place_name: 'Janaki Forest and Helipad Viewpoint', description: 'Explore nature and views' },
            { time: '19:00', type: 'dinner', place_name: 'God\'s Own Country Kitchen', description: 'Signature seafood thali' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Soul & Surf Café', description: 'Avocado toast, herbal tea' },
            { time: '10:00', type: 'activity', place_name: 'Cliff Walk/Yoga', description: 'Last-minute cliff stroll or yoga session' },
            { time: '13:00', type: 'lunch', place_name: 'Abba Restaurant', description: 'Quick thali or wrap before checkout' },
            { time: '15:00', type: 'departure', place_name: 'Checkout', description: 'Departure or travel to next destination' }
        ]
    };
    return activities[day] || [];
}

function getTarkarliActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel Chintamani', description: 'Poha, sabudana khichdi, chai' },
            { time: '10:00', type: 'sightseeing', place_name: 'Tarkarli Beach', description: 'Check-in & explore beach' },
            { time: '13:00', type: 'lunch', place_name: 'Atithi Bamboo', description: 'Iconic Malvani thali (fish fry, solkadhi, rice)' },
            { time: '16:00', type: 'sightseeing', place_name: 'Kolamb Beach', description: 'Sunset walk' },
            { time: '19:00', type: 'dinner', place_name: 'Samindar Malvan Restaurant', description: 'Tandoori crab, fried bombil' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'MTDC Tarkarli Beach Café', description: 'Toast, eggs, filter coffee' },
            { time: '10:00', type: 'activity', place_name: 'Tarkarli Beach', description: 'Scuba diving and snorkeling session' },
            { time: '13:00', type: 'lunch', place_name: 'Chaitanya Restaurant', description: 'Prawns curry, chapati' },
            { time: '15:00', type: 'sightseeing', place_name: 'Devbagh Beach', description: 'Relax at beach' },
            { time: '19:00', type: 'dinner', place_name: 'Bhalekar\'s Malvani Khanaval', description: 'Seafood platter and solkadhi' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel Ruchira', description: 'Missal pav, chai' },
            { time: '10:00', type: 'sightseeing', place_name: 'Sindhudurg Fort', description: 'Boat to fort, explore historical fortifications' },
            { time: '13:00', type: 'lunch', place_name: 'Hotel Sun N Sand', description: 'Fish thali with kokum curry' },
            { time: '15:00', type: 'sightseeing', place_name: 'Rock Garden', description: 'Visit near Arase Mahal' },
            { time: '19:00', type: 'dinner', place_name: 'Gajanan Restaurant', description: 'Pomfret rawa fry and modak' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Tarkarli Niwas Nyahari', description: 'Puri bhaji and sheera' },
            { time: '10:00', type: 'activity', place_name: 'Karli Backwaters', description: 'Boat ride and birdwatching' },
            { time: '13:00', type: 'lunch', place_name: 'Bison Eco Resort Café', description: 'Simple veg/non-veg thali' },
            { time: '15:00', type: 'sightseeing', place_name: 'Malvan Town', description: 'Explore local fish markets' },
            { time: '19:00', type: 'dinner', place_name: 'Annapurna Home Kitchen', description: 'Homemade thali with kokum sherbet' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel Jivhala', description: 'Aloo paratha and curd' },
            { time: '10:00', type: 'sightseeing', place_name: 'Devbagh Sangam Point', description: 'Where river meets the sea' },
            { time: '13:00', type: 'lunch', place_name: 'Bhagat Khanaval', description: 'Thali with tisrya masala' },
            { time: '15:00', type: 'activity', place_name: 'Tsunami Island', description: 'Sandbar with kayaking options' },
            { time: '19:00', type: 'dinner', place_name: 'Rane Khanaval', description: 'Spicy Malvani fish curry, coconut chutney' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'MTDC Resort Café', description: 'Upma, chai, boiled eggs' },
            { time: '10:00', type: 'activity', place_name: 'Local Cooking Session', description: 'Attend cooking session or food walk' },
            { time: '13:00', type: 'lunch', place_name: 'Homestay', description: 'Crab curry, bhakri, rice papad' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Temples', description: 'Walk around temples and village paths' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Mayekar\'s', description: 'Variety of fried fish, Malvani kadi' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Sai International Café', description: 'Fruit plate, idli, filter coffee' },
            { time: '10:00', type: 'activity', place_name: 'Tarkarli Beach', description: 'Relax, meditation or swim' },
            { time: '13:00', type: 'lunch', place_name: 'Atithi Bamboo', description: 'Farewell Malvani thali' },
            { time: '15:00', type: 'shopping', place_name: 'Local Market', description: 'Shop for spices' },
            { time: '19:00', type: 'dinner', place_name: 'Highway Dhaba', description: 'Local snacks en route' }
        ]
    };
    return activities[day] || [];
}

// Helper functions for mountain destinations
function getSpitiActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel Deyzor', description: 'Local breakfast with tea' },
            { time: '10:00', type: 'acclimatization', place_name: 'Kaza Town', description: 'Light walk and acclimatization' },
            { time: '13:00', type: 'lunch', place_name: 'Sol Café', description: 'Simple lunch' },
            { time: '15:00', type: 'rest', place_name: 'Hotel', description: 'Rest and acclimatize' },
            { time: '19:00', type: 'dinner', place_name: 'The Himalayan Café', description: 'Local dinner' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Key Monastery', description: 'Visit monastery and surroundings' },
            { time: '13:00', type: 'lunch', place_name: 'Key Monastery Kitchen', description: 'Simple monastery lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Chicham Bridge', description: 'Visit world\'s highest bridge' },
            { time: '19:00', type: 'dinner', place_name: 'Taste of Spiti', description: 'Local cuisine' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Dhankar Monastery', description: 'Visit ancient monastery' },
            { time: '13:00', type: 'lunch', place_name: 'Dhankar Lake', description: 'Picnic lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Tabo Monastery', description: 'Visit 1000-year-old monastery' },
            { time: '19:00', type: 'dinner', place_name: 'Tabo Homestay Café', description: 'Local dinner' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Pin Valley', description: 'Explore valley and wildlife' },
            { time: '13:00', type: 'lunch', place_name: 'Mudh Village', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Pin Valley National Park', description: 'Wildlife spotting' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Sakya Abode', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Langza Village', description: 'Visit fossil village' },
            { time: '13:00', type: 'lunch', place_name: 'Langza Homestay', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Hikkim Post Office', description: 'Visit world\'s highest post office' },
            { time: '19:00', type: 'dinner', place_name: 'The Dragon Restaurant', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Komic Village', description: 'Visit world\'s highest village' },
            { time: '13:00', type: 'lunch', place_name: 'Sagnam village café', description: 'Local lunch' },
            { time: '15:00', type: 'shopping', place_name: 'Kaza Market', description: 'Local shopping' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Deyzor Restaurant', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '10:00', type: 'departure', place_name: 'Kaza', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getTawangActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel Tawang Heights', description: 'Early breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Tawang Monastery', description: 'Visit largest monastery in India' },
            { time: '13:00', type: 'lunch', place_name: 'Dondrub Café', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Urgelling Monastery', description: 'Visit birthplace of 6th Dalai Lama' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Shangrila', description: 'Dinner' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Sela Pass', description: 'Visit high-altitude pass' },
            { time: '13:00', type: 'lunch', place_name: 'Se La Café', description: 'Simple lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Madhuri Lake', description: 'Visit beautiful lake' },
            { time: '19:00', type: 'dinner', place_name: 'Dragon Restaurant', description: 'Dinner' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Bum La Pass', description: 'Visit Indo-China border' },
            { time: '13:00', type: 'lunch', place_name: 'Army Canteen', description: 'Simple lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'PTSO Lake', description: 'Visit high-altitude lake' },
            { time: '19:00', type: 'dinner', place_name: 'Donyi Polo Restaurant', description: 'Local cuisine' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Jaswant Garh War Memorial', description: 'Pay respects' },
            { time: '13:00', type: 'lunch', place_name: 'Orange Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Tawang War Memorial', description: 'Visit memorial' },
            { time: '19:00', type: 'dinner', place_name: 'The Greenwood Restaurant', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'shopping', place_name: 'Craft Centre', description: 'Local shopping' },
            { time: '13:00', type: 'lunch', place_name: 'Tawang Kitchen', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Markets', description: 'Explore markets' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Zambhala', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Dirang Valley', description: 'Explore valley' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Hot Springs', description: 'Visit natural hot springs' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Mon Paradise', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '10:00', type: 'departure', place_name: 'Tawang', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getChoptaActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Chopta Restaurant', description: 'Early breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Chopta Meadows', description: 'Explore meadows' },
            { time: '13:00', type: 'lunch', place_name: 'The Chopta Café', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Forest Trails', description: 'Nature walk' },
            { time: '19:00', type: 'dinner', place_name: 'Café Rudra', description: 'Dinner' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'trek', place_name: 'Tungnath Temple', description: 'Trek to temple' },
            { time: '13:00', type: 'lunch', place_name: 'Tungnath Café', description: 'Simple lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Temple Complex', description: 'Explore temple' },
            { time: '19:00', type: 'dinner', place_name: 'Chopta Lodge', description: 'Dinner' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'trek', place_name: 'Chandrashila Peak', description: 'Trek to peak' },
            { time: '13:00', type: 'lunch', place_name: 'Peak Viewpoint', description: 'Picnic lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Panoramic Views', description: 'Enjoy views' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Chopta', description: 'Dinner' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Deoria Tal Lake', description: 'Visit lake' },
            { time: '13:00', type: 'lunch', place_name: 'Lake Viewpoint', description: 'Picnic lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Sari Village', description: 'Explore village' },
            { time: '19:00', type: 'dinner', place_name: 'Local Dhaba', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Sari Village', description: 'Explore village' },
            { time: '13:00', type: 'lunch', place_name: 'Village Home', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Meadows', description: 'Nature walk' },
            { time: '19:00', type: 'dinner', place_name: 'Chopta Restaurant', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'sightseeing', place_name: 'Madmaheshwar Village', description: 'Visit village' },
            { time: '13:00', type: 'lunch', place_name: 'Village Home', description: 'Local lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Markets', description: 'Shopping' },
            { time: '19:00', type: 'dinner', place_name: 'The Chopta Café', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '10:00', type: 'departure', place_name: 'Chopta', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

// Helper functions for historical destinations
function getTajMahalActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Simple breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Local Markets', description: 'Explore Kinari Bazaar' },
            { time: '13:00', type: 'lunch', place_name: 'Local Dhaba', description: 'Simple meal' },
            { time: '15:00', type: 'sightseeing', place_name: 'Sadar Bazaar', description: 'Shopping and local culture' },
            { time: '19:00', type: 'dinner', place_name: 'Zorba The Buddha Café', description: 'Dinner' }
        ],
        2: [
            { time: '06:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '07:00', type: 'sightseeing', place_name: 'Taj Mahal', description: 'Sunrise visit' },
            { time: '13:00', type: 'lunch', place_name: 'Restaurant near Taj', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Taj Nature Walk', description: 'Evening walk' },
            { time: '19:00', type: 'dinner', place_name: 'Local Restaurant', description: 'Dinner' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Agra Fort', description: 'Explore fort' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Baby Taj', description: 'Visit Itimad-ud-Daulah' },
            { time: '19:00', type: 'dinner', place_name: 'Street Food', description: 'Local delicacies' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'travel', place_name: 'Fatehpur Sikri', description: 'Day trip' },
            { time: '13:00', type: 'lunch', place_name: 'Local Dhaba', description: 'Simple meal' },
            { time: '15:00', type: 'sightseeing', place_name: 'Fatehpur Sikri', description: 'Explore monuments' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Mehtab Bagh', description: 'Evening views' },
            { time: '19:00', type: 'dinner', place_name: 'Goli Vada Pav', description: 'Street food' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Ram Bagh', description: 'Visit gardens' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Dayal Bagh Temple', description: 'Visit temple' },
            { time: '19:00', type: 'dinner', place_name: 'Deviram Sweets', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Final breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Mehtab Bagh', description: 'Last views of Taj' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Agra', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getOrchhaActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Orchha Fort Complex', description: 'Explore fort' },
            { time: '13:00', type: 'lunch', place_name: 'Orchha Café', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Jahangir Mahal', description: 'Visit palace' },
            { time: '19:00', type: 'dinner', place_name: 'Betwa Retreat', description: 'Dinner' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Raj Mahal', description: 'Visit palace' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Raja Ram Temple', description: 'Visit temple' },
            { time: '19:00', type: 'dinner', place_name: 'Jahangir Restaurant', description: 'Dinner' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Chhatris', description: 'Visit cenotaphs' },
            { time: '13:00', type: 'lunch', place_name: 'Local Dhaba', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Betwa River', description: 'Boat ride' },
            { time: '19:00', type: 'dinner', place_name: 'Orchha Café', description: 'Dinner' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '13:00', type: 'lunch', place_name: 'Street Food', description: 'Local delicacies' },
            { time: '15:00', type: 'sightseeing', place_name: 'Craft Shops', description: 'Local crafts' },
            { time: '19:00', type: 'dinner', place_name: 'Betwa Retreat', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Phool Bagh', description: 'Visit gardens' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Hardaul\'s Palace', description: 'Visit palace' },
            { time: '19:00', type: 'dinner', place_name: 'Traditional Restaurant', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Laxmi Narayan Temple', description: 'Visit temple' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Other Temples', description: 'Temple tour' },
            { time: '19:00', type: 'dinner', place_name: 'Orchha Café', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Final breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Chand Baori', description: 'Last visit' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Orchha', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getChandBaoriActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Chand Baori', description: 'Visit stepwell' },
            { time: '13:00', type: 'lunch', place_name: 'Hotel Amar Yatri Niwas', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Harshat Mata Temple', description: 'Visit temple' },
            { time: '19:00', type: 'dinner', place_name: 'Rajasthani Dhaba', description: 'Dinner' }
        ],
        2: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Bhand Deva Temple', description: 'Visit temple' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Craft Shops', description: 'Shopping' },
            { time: '19:00', type: 'dinner', place_name: 'Rajputana Restaurant', description: 'Dinner' }
        ],
        3: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Pottery Centers', description: 'Visit workshops' },
            { time: '13:00', type: 'lunch', place_name: 'Local Eatery', description: 'Lunch' },
            { time: '15:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '19:00', type: 'dinner', place_name: 'Street Vendors', description: 'Street food' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Sambhar Lake', description: 'Visit lake' },
            { time: '13:00', type: 'lunch', place_name: 'Sambhar Local Eatery', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Salt Pans', description: 'Visit salt works' },
            { time: '19:00', type: 'dinner', place_name: 'Local Café', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Village Life', description: 'Explore villages' },
            { time: '13:00', type: 'lunch', place_name: 'Local Home', description: 'Traditional lunch' },
            { time: '15:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Restaurant', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Sambhar Town Temples', description: 'Visit temples' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Religious Sites', description: 'Temple tour' },
            { time: '19:00', type: 'dinner', place_name: 'Hotel Restaurant', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Final breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Chand Baori', description: 'Last visit' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Chand Baori', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

// Helper functions for adventure destinations
function getRishikeshActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Laxman Jhula', description: 'Visit bridge' },
            { time: '13:00', type: 'lunch', place_name: 'Little Buddha Café', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Ram Jhula', description: 'Explore area' },
            { time: '19:00', type: 'dinner', place_name: 'German Bakery', description: 'Dinner' }
        ],
        2: [
            { time: '07:00', type: 'breakfast', place_name: 'Hotel', description: 'Early breakfast' },
            { time: '09:00', type: 'activity', place_name: 'Jumpin Heights', description: 'Bungee jumping' },
            { time: '13:00', type: 'lunch', place_name: 'Freedom Café', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'White Water Rafting', description: 'Rafting' },
            { time: '19:00', type: 'dinner', place_name: 'Local Restaurant', description: 'Dinner' }
        ],
        3: [
            { time: '06:00', type: 'activity', place_name: 'Yoga Center', description: 'Morning yoga' },
            { time: '09:00', type: 'breakfast', place_name: 'Organic Café', description: 'Breakfast' },
            { time: '11:00', type: 'activity', place_name: 'Meditation Center', description: 'Meditation' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Yoga Center', description: 'Evening yoga' }
        ],
        4: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Neelkanth Mahadev Temple', description: 'Visit temple' },
            { time: '13:00', type: 'lunch', place_name: 'Local Dhaba', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Triveni Ghat', description: 'Visit ghat' },
            { time: '18:00', type: 'activity', place_name: 'Ganga Aarti', description: 'Evening aarti' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Beatles Ashram', description: 'Visit ashram' },
            { time: '13:00', type: 'lunch', place_name: 'Organic Café', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Nature Walk', description: 'Walking tour' },
            { time: '19:00', type: 'dinner', place_name: 'Local Café', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Breakfast' },
            { time: '10:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '13:00', type: 'lunch', place_name: 'Street Food', description: 'Local delicacies' },
            { time: '15:00', type: 'activity', place_name: 'Cultural Center', description: 'Cultural show' },
            { time: '19:00', type: 'dinner', place_name: 'Local Restaurant', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Hotel', description: 'Final breakfast' },
            { time: '10:00', type: 'activity', place_name: 'Ganga Aarti', description: 'Last aarti' },
            { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Rishikesh', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getJimCorbettActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Resort', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Corbett Museum', description: 'Visit museum' },
            { time: '13:00', type: 'lunch', place_name: 'Resort Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Nature Walk', description: 'Guided walk' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Dinner' }
        ],
        2: [
            { time: '05:00', type: 'breakfast', place_name: 'Resort', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Morning Safari', description: 'Jungle safari' },
            { time: '13:00', type: 'lunch', place_name: 'Resort', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Corbett Falls', description: 'Visit falls' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Dinner' }
        ],
        3: [
            { time: '05:00', type: 'breakfast', place_name: 'Resort', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Dhikala Zone', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Forest Canteen', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Kosi River', description: 'River visit' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Dinner' }
        ],
        4: [
            { time: '05:00', type: 'breakfast', place_name: 'Resort', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Bijrani Zone', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Local Dhaba', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Garjia Temple', description: 'Visit temple' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Dinner' }
        ],
        5: [
            { time: '08:00', type: 'breakfast', place_name: 'Resort', description: 'Breakfast' },
            { time: '10:00', type: 'activity', place_name: 'Bird Watching', description: 'Guided tour' },
            { time: '13:00', type: 'lunch', place_name: 'Resort', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Village', description: 'Village tour' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Dinner' }
        ],
        6: [
            { time: '05:00', type: 'breakfast', place_name: 'Resort', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Elephant Safari', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Resort', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Nature Walk', description: 'Evening walk' },
            { time: '19:00', type: 'dinner', place_name: 'Resort', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Resort', description: 'Final breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Kosi River', description: 'Last visit' },
            { time: '13:00', type: 'lunch', place_name: 'Resort', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Jim Corbett', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getKazirangaActivities(day) {
    const activities = {
        1: [
            { time: '08:00', type: 'breakfast', place_name: 'Lodge', description: 'Breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Visitor Center', description: 'Orientation' },
            { time: '13:00', type: 'lunch', place_name: 'Lodge Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Nature Walk', description: 'Guided walk' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Dinner' }
        ],
        2: [
            { time: '05:00', type: 'breakfast', place_name: 'Lodge', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Central Range', description: 'Jeep safari' },
            { time: '13:00', type: 'lunch', place_name: 'Lodge', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Tea Gardens', description: 'Visit gardens' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Dinner' }
        ],
        3: [
            { time: '05:00', type: 'breakfast', place_name: 'Lodge', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Western Range', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Local Eatery', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Mikir Hills', description: 'Visit hills' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Dinner' }
        ],
        4: [
            { time: '05:00', type: 'breakfast', place_name: 'Lodge', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Eastern Range', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Lodge', description: 'Lunch' },
            { time: '15:00', type: 'sightseeing', place_name: 'Local Village', description: 'Village tour' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Dinner' }
        ],
        5: [
            { time: '05:00', type: 'breakfast', place_name: 'Lodge', description: 'Early breakfast' },
            { time: '06:00', type: 'activity', place_name: 'Elephant Safari', description: 'Safari' },
            { time: '13:00', type: 'lunch', place_name: 'Lodge', description: 'Lunch' },
            { time: '15:00', type: 'activity', place_name: 'Bird Watching', description: 'Guided tour' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Dinner' }
        ],
        6: [
            { time: '08:00', type: 'breakfast', place_name: 'Lodge', description: 'Breakfast' },
            { time: '10:00', type: 'activity', place_name: 'Cultural Show', description: 'Local culture' },
            { time: '13:00', type: 'lunch', place_name: 'Traditional Restaurant', description: 'Lunch' },
            { time: '15:00', type: 'shopping', place_name: 'Local Markets', description: 'Shopping' },
            { time: '19:00', type: 'dinner', place_name: 'Lodge', description: 'Farewell dinner' }
        ],
        7: [
            { time: '08:00', type: 'breakfast', place_name: 'Lodge', description: 'Final breakfast' },
            { time: '10:00', type: 'sightseeing', place_name: 'Kohora Watch Tower', description: 'Last views' },
            { time: '13:00', type: 'lunch', place_name: 'Lodge', description: 'Quick lunch' },
            { time: '15:00', type: 'departure', place_name: 'Kaziranga', description: 'Departure' }
        ]
    };
    return activities[day] || [];
}

function getGokarnaActivities(day) {
    switch (day) {
        case 1:
            return [
                { time: '09:00:00', type: 'breakfast', place_name: 'Namaste Café', description: 'Fresh fruit, dosa, chai' },
                { time: '10:00:00', type: 'sightseeing', place_name: 'Mahabaleshwar Temple', description: 'Visit the ancient temple' },
                { time: '13:00:00', type: 'lunch', place_name: 'Pai Restaurant', description: 'Seafood thali, rice, curry' },
                { time: '15:00:00', type: 'sightseeing', place_name: 'Gokarna Beach', description: 'Explore the beach and relax' },
                { time: '19:00:00', type: 'dinner', place_name: 'Prema Restaurant', description: 'Grilled fish, chapati, dal' }
            ];
        case 2:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Sunset Café', description: 'Toast, eggs, coffee' },
                { time: '10:00:00', type: 'activity', place_name: 'Kudle Beach', description: 'Swimming and beach activities' },
                { time: '13:00:00', type: 'lunch', place_name: 'Gokarna International Hotel', description: 'Veg/non-veg thali' },
                { time: '15:00:00', type: 'sightseeing', place_name: 'Om Beach', description: 'Explore the beach and sunset' },
                { time: '19:00:00', type: 'dinner', place_name: 'Namaste Café', description: 'Pasta, pizza, dessert' }
            ];
        case 3:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Café 1987', description: 'Pancakes, fresh juice' },
                { time: '10:00:00', type: 'activity', place_name: 'Half Moon Beach', description: 'Trek and beach activities' },
                { time: '13:00:00', type: 'lunch', place_name: 'Laughing Buddha Restaurant', description: 'Beachside lunch' },
                { time: '15:00:00', type: 'sightseeing', place_name: 'Yana Caves', description: 'Explore ancient caves' },
                { time: '19:00:00', type: 'dinner', place_name: 'Dolphin Bay Restaurant', description: 'Seafood platter' }
            ];
        case 4:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Ganga Café', description: 'South Indian breakfast' },
                { time: '10:00:00', type: 'sightseeing', place_name: 'Mirjan Fort', description: 'Historical fort visit' },
                { time: '13:00:00', type: 'lunch', place_name: 'Pranam Café', description: 'Local cuisine' },
                { time: '15:00:00', type: 'sightseeing', place_name: 'Kotiteertha', description: 'Temple tank visit' },
                { time: '19:00:00', type: 'dinner', place_name: 'Sunset Café', description: 'International cuisine' }
            ];
        case 5:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Namaste Café', description: 'Continental breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Paradise Beach', description: 'Beach activities and relaxation' },
                { time: '13:00:00', type: 'lunch', place_name: 'Pai Restaurant', description: 'Beachside lunch' },
                { time: '15:00:00', type: 'activity', place_name: 'Water Sports', description: 'Jet skiing, banana boat' },
                { time: '19:00:00', type: 'dinner', place_name: 'Gokarna International Hotel', description: 'Multi-cuisine dinner' }
            ];
        case 6:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Café 1987', description: 'Healthy breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Local Market', description: 'Shopping and local experience' },
                { time: '13:00:00', type: 'lunch', place_name: 'Laughing Buddha Restaurant', description: 'Local cuisine' },
                { time: '15:00:00', type: 'activity', place_name: 'Yoga Session', description: 'Evening yoga class' },
                { time: '19:00:00', type: 'dinner', place_name: 'Prema Restaurant', description: 'Farewell dinner' }
            ];
        case 7:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Sunset Café', description: 'Final breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Beach Walk', description: 'Final beach visit' },
                { time: '13:00:00', type: 'lunch', place_name: 'Namaste Café', description: 'Quick lunch' },
                { time: '15:00:00', type: 'departure', place_name: 'Checkout', description: 'Departure' }
            ];
        default:
            return [];
    }
}

function getBackwatersActivities(day) {
    switch (day) {
        case 1:
            return [
                { time: '09:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'Traditional Kerala breakfast' },
                { time: '10:00:00', type: 'sightseeing', place_name: 'Houseboat Check-in', description: 'Board houseboat and settle in' },
                { time: '13:00:00', type: 'lunch', place_name: 'Houseboat Dining', description: 'Fresh seafood and local delicacies' },
                { time: '15:00:00', type: 'activity', place_name: 'Backwater Cruise', description: 'Evening cruise through narrow canals' },
                { time: '19:00:00', type: 'dinner', place_name: 'Houseboat Dining', description: 'Traditional Kerala dinner' }
            ];
        case 2:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'Continental breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Village Visit', description: 'Visit local villages and coir making' },
                { time: '13:00:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Traditional Kerala thali' },
                { time: '15:00:00', type: 'activity', place_name: 'Bird Watching', description: 'Spot migratory birds' },
                { time: '19:00:00', type: 'dinner', place_name: 'Houseboat Dining', description: 'Seafood special dinner' }
            ];
        case 3:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'South Indian breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Fishing', description: 'Traditional fishing experience' },
                { time: '13:00:00', type: 'lunch', place_name: 'Houseboat Dining', description: 'Fresh catch lunch' },
                { time: '15:00:00', type: 'activity', place_name: 'Canoe Ride', description: 'Explore narrow waterways' },
                { time: '19:00:00', type: 'dinner', place_name: 'Houseboat Dining', description: 'Kerala special dinner' }
            ];
        case 4:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'Western breakfast' },
                { time: '10:00:00', type: 'sightseeing', place_name: 'Paddy Fields', description: 'Visit local agriculture' },
                { time: '13:00:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Traditional lunch' },
                { time: '15:00:00', type: 'activity', place_name: 'Sunset Cruise', description: 'Evening backwater cruise' },
                { time: '19:00:00', type: 'dinner', place_name: 'Houseboat Dining', description: 'Special dinner' }
            ];
        case 5:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'Indian breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Coconut Processing', description: 'Learn about local industry' },
                { time: '13:00:00', type: 'lunch', place_name: 'Houseboat Dining', description: 'Traditional lunch' },
                { time: '15:00:00', type: 'activity', place_name: 'Swimming', description: 'Swim in backwaters' },
                { time: '19:00:00', type: 'dinner', place_name: 'Houseboat Dining', description: 'Farewell dinner' }
            ];
        case 6:
            return [
                { time: '08:00:00', type: 'breakfast', place_name: 'Houseboat Kitchen', description: 'Final breakfast' },
                { time: '10:00:00', type: 'activity', place_name: 'Final Cruise', description: 'Last backwater cruise' },
                { time: '13:00:00', type: 'lunch', place_name: 'Houseboat Dining', description: 'Final lunch' },
                { time: '15:00:00', type: 'departure', place_name: 'Checkout', description: 'Departure from houseboat' }
            ];
        default:
            return [];
    }
}

// Add Goa activities function
function getGoaActivities(day) {
    switch (day) {
        case 1:
            return [
                { time: '09:00', type: 'breakfast', place_name: 'Cafe Chocolatti', description: 'Fresh fruits, pancakes, and coffee' },
                { time: '10:30', type: 'sightseeing', place_name: 'Baga Beach', description: 'Relax on the beach and enjoy water sports' },
                { time: '13:00', type: 'lunch', place_name: 'Souza Lobo', description: 'Fresh seafood and Goan specialties' },
                { time: '15:00', type: 'sightseeing', place_name: 'Calangute Beach', description: 'Explore the beach and local markets' },
                { time: '19:00', type: 'dinner', place_name: 'Pousada by the Beach', description: 'Traditional Goan dinner with live music' }
            ];
        case 2:
            return [
                { time: '08:00', type: 'breakfast', place_name: 'Cafe Bodega', description: 'Continental breakfast with fresh juices' },
                { time: '10:00', type: 'sightseeing', place_name: 'Fort Aguada', description: 'Visit the historic Portuguese fort' },
                { time: '13:00', type: 'lunch', place_name: 'Gunpowder', description: 'South Indian fusion cuisine' },
                { time: '15:00', type: 'sightseeing', place_name: 'Chapora Fort', description: 'Explore the fort and enjoy sunset views' },
                { time: '19:00', type: 'dinner', place_name: 'Martin\'s Corner', description: 'Famous Goan seafood and live music' }
            ];
        case 3:
            return [
                { time: '07:00', type: 'breakfast', place_name: 'Hotel Restaurant', description: 'Quick breakfast before the trip' },
                { time: '09:00', type: 'sightseeing', place_name: 'Dudhsagar Falls', description: 'Visit the majestic waterfall' },
                { time: '13:00', type: 'lunch', place_name: 'Spice Plantation', description: 'Traditional Goan lunch at the plantation' },
                { time: '15:00', type: 'activity', place_name: 'Spice Tour', description: 'Learn about spices and their uses' },
                { time: '19:00', type: 'dinner', place_name: 'Fisherman\'s Wharf', description: 'Fresh seafood dinner' }
            ];
        case 4:
            return [
                { time: '09:00', type: 'breakfast', place_name: 'La Plage', description: 'Beachside breakfast' },
                { time: '10:30', type: 'sightseeing', place_name: 'Basilica of Bom Jesus', description: 'Visit the UNESCO World Heritage site' },
                { time: '13:00', type: 'lunch', place_name: 'Viva Panjim', description: 'Traditional Goan cuisine' },
                { time: '15:00', type: 'sightseeing', place_name: 'Old Goa Churches', description: 'Explore the historic churches' },
                { time: '19:00', type: 'dinner', place_name: 'Bomra\'s', description: 'Burmese fusion cuisine' }
            ];
        case 5:
            return [
                { time: '09:00', type: 'breakfast', place_name: 'Hotel Restaurant', description: 'Breakfast buffet' },
                { time: '10:30', type: 'sightseeing', place_name: 'Palolem Beach', description: 'Relax on the beautiful beach' },
                { time: '13:00', type: 'lunch', place_name: 'Beach Shack', description: 'Fresh seafood and drinks' },
                { time: '15:00', type: 'activity', place_name: 'Water Sports', description: 'Enjoy various water activities' },
                { time: '19:00', type: 'dinner', place_name: 'Beach Restaurant', description: 'Sunset dinner on the beach' }
            ];
        case 6:
            return [
                { time: '09:00', type: 'breakfast', place_name: 'Cafe', description: 'Light breakfast' },
                { time: '11:00', type: 'activity', place_name: 'Water Sports', description: 'Try different water sports' },
                { time: '13:00', type: 'lunch', place_name: 'Beach Restaurant', description: 'Casual beach lunch' },
                { time: '15:00', type: 'relaxation', place_name: 'Beach', description: 'Relax and enjoy the beach' },
                { time: '19:00', type: 'dinner', place_name: 'Nightclub', description: 'Experience Goa\'s nightlife' }
            ];
        case 7:
            return [
                { time: '09:00', type: 'breakfast', place_name: 'Hotel Restaurant', description: 'Final breakfast' },
                { time: '10:00', type: 'shopping', place_name: 'Local Markets', description: 'Buy souvenirs and gifts' },
                { time: '13:00', type: 'lunch', place_name: 'Local Restaurant', description: 'Last meal in Goa' },
                { time: '15:00', type: 'departure', place_name: 'Airport', description: 'Transfer to airport' }
            ];
        default:
            return [];
    }
}

// Run the initialization
initializeDatabase(); 