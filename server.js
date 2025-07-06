const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'KOti@2989',
    database: 'travelzy_db'
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the website directory
app.use(express.static(path.join(__dirname, 'website'), {
    dotfiles: 'deny',
    index: false
}));

// API endpoint to get all destinations
app.get('/api/destinations', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const type = req.query.type;
        
        let query = 'SELECT * FROM destinations';
        let params = [];
        
        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }
        
        const [destinations] = await connection.query(query, params);
        await connection.end();
        res.json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

// API endpoint to get destination details with itinerary
app.get('/api/destinations/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const destinationId = req.params.id;

        // Get destination details
        const [destinations] = await connection.query(
            'SELECT * FROM destinations WHERE id = ?',
            [destinationId]
        );

        if (destinations.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Destination not found' });
        }

        const destination = destinations[0];

        // Get attractions
        const [attractions] = await connection.query(
            'SELECT name, description, entry_fee, opening_hours FROM attractions WHERE destination_id = ?',
            [destinationId]
        );

        // Get accommodations
        const [accommodations] = await connection.query(
            'SELECT type, name FROM accommodations WHERE destination_id = ?',
            [destinationId]
        );

        // Get food places
        const [foodPlaces] = await connection.query(
            'SELECT name, type, price_range, description FROM food_places WHERE destination_id = ?',
            [destinationId]
        );

        // Get itinerary days and activities
        const [itineraryDays] = await connection.query(
            'SELECT * FROM itinerary_days WHERE destination_id = ? ORDER BY day_number',
            [destinationId]
        );

        // Get activities for each day
        const detailedItinerary = {};
        for (const day of itineraryDays) {
            const [activities] = await connection.query(
                'SELECT * FROM activities WHERE itinerary_day_id = ? ORDER BY time',
                [day.id]
            );

            detailedItinerary[`day${day.day_number}`] = {
                title: day.title,
                activities: activities.map(activity => ({
                    time: activity.time,
                    type: activity.type,
                    place: {
                        name: activity.place_name,
                        description: activity.description
                    }
                }))
            };
        }

        // Combine all data
        const destinationData = {
            ...destination,
            attractions: attractions.map(a => ({
                name: a.name,
                description: a.description,
                entry_fee: a.entry_fee,
                opening_hours: a.opening_hours
            })),
            accommodations: accommodations.reduce((acc, curr) => {
                acc[curr.type] = curr.name;
                return acc;
            }, {}),
            food: foodPlaces.map(f => ({
                name: f.name,
                type: f.type,
                price_range: f.price_range,
                description: f.description
            })),
            detailed_itinerary: detailedItinerary
        };

        await connection.end();
        res.json(destinationData);
    } catch (error) {
        console.error('Error fetching destination details:', error);
        res.status(500).json({ error: 'Failed to fetch destination details' });
    }
});

app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { destination, days, budget, travelers, specialRequirements } = req.body;

        // Validate input
        if (!destination || !days || !budget || !travelers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Find the selected destination
        const [destinations] = await connection.query(
            'SELECT * FROM destinations WHERE name = ?',
            [destination]
        );

        if (destinations.length === 0) {
            await connection.end();
            return res.status(404).json({ message: 'Destination not found' });
        }

        const selectedDestination = destinations[0];

        // Get attractions
        const [attractions] = await connection.query(
            'SELECT name, description, entry_fee, opening_hours FROM attractions WHERE destination_id = ?',
            [selectedDestination.id]
        );

        // Get accommodations
        const [accommodations] = await connection.query(
            'SELECT type, name FROM accommodations WHERE destination_id = ?',
            [selectedDestination.id]
        );

        // Get food places
        const [foodPlaces] = await connection.query(
            'SELECT name, type, price_range, description FROM food_places WHERE destination_id = ?',
            [selectedDestination.id]
        );

        // Get itinerary days and activities
        const [itineraryDays] = await connection.query(
            'SELECT * FROM itinerary_days WHERE destination_id = ? ORDER BY day_number LIMIT ?',
            [selectedDestination.id, days]
        );

        // Get activities for each day
        const itinerary = [];
        for (const day of itineraryDays) {
            const [activities] = await connection.query(
                'SELECT * FROM activities WHERE itinerary_day_id = ? ORDER BY time',
                [day.id]
            );

            itinerary.push({
                day: day.day_number,
                title: day.title,
                activities: activities.map(activity => ({
                    time: activity.time,
                    type: activity.type,
                    place: {
                        name: activity.place_name,
                        description: activity.description
                    }
                }))
            });
        }

        // Calculate daily budget
        const dailyBudget = Math.floor(budget / days);

        // Prepare response
        const response = {
            destination: selectedDestination.name,
            days,
            budget,
            dailyBudget,
            accommodation: accommodations.reduce((acc, curr) => {
                acc[curr.type] = curr.name;
                return acc;
            }, {}),
            foodOptions: foodPlaces.map(f => ({
                name: f.name,
                type: f.type,
                price_range: f.price_range,
                description: f.description
            })),
            touristPlaces: attractions.map(a => ({
                name: a.name,
                description: a.description,
                entry_fee: a.entry_fee,
                opening_hours: a.opening_hours
            })),
            itinerary,
            specialRequirements: specialRequirements || '',
            travelType: selectedDestination.type
        };

        await connection.end();
        res.json(response);
    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({ message: 'Failed to generate itinerary' });
    }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [reviews] = await connection.query('SELECT * FROM reviews ORDER BY created_at DESC');
        await connection.end();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Submit a new review
app.post('/api/reviews', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { reviewer_name, destination, rating, review_text } = req.body;
        
        if (!reviewer_name || !destination || !rating || !review_text) {
            await connection.end();
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (rating < 1 || rating > 5) {
            await connection.end();
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const [result] = await connection.query(
            'INSERT INTO reviews (reviewer_name, destination, rating, review_text) VALUES (?, ?, ?, ?)',
            [reviewer_name, destination, rating, review_text]
        );

        const [newReview] = await connection.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
        await connection.end();
        res.status(201).json(newReview[0]);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 