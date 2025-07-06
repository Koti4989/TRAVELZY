document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const destinationCards = document.querySelectorAll('.destination-card');
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

destinationCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

const testimonials = [
    {
        text: "TRAVELZY made my Rajasthan trip unforgettable!",
        author: "Priya Sharma"
    },
    {
        text: "The AI-powered itinerary was spot on!",
        author: "Rahul Patel"
    },
    {
        text: "Best travel planning experience ever!",
        author: "Ananya Gupta"
    }
];

let currentTestimonial = 0;
const testimonialElement = document.querySelector('.testimonial');
const testimonialText = testimonialElement.querySelector('p');
const testimonialAuthor = testimonialElement.querySelector('h4');

function updateTestimonial() {
    testimonialText.textContent = testimonials[currentTestimonial].text;
    testimonialAuthor.textContent = `- ${testimonials[currentTestimonial].author}`;
    
    testimonialElement.style.opacity = '0';
    setTimeout(() => {
        testimonialElement.style.opacity = '1';
    }, 500);
}

setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonial();
}, 5000);

const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
    });
});

const ctaButton = document.querySelector('.cta-button');
ctaButton.addEventListener('mouseenter', () => {
    ctaButton.style.transform = 'scale(1.05)';
    ctaButton.style.transition = 'transform 0.3s ease';
});

ctaButton.addEventListener('mouseleave', () => {
    ctaButton.style.transform = 'scale(1)';
});

ctaButton.addEventListener('click', () => {
    // Navigate to itinerary section
    const itinerarySection = document.getElementById('itinerary');
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        section.style.visibility = 'hidden';
        section.style.position = 'absolute';
    });

    if (itinerarySection) {
        itinerarySection.style.visibility = 'visible';
        itinerarySection.style.position = 'relative';
        itinerarySection.scrollIntoView({ behavior: 'smooth' });
    }

    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '#itinerary') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

const API_BASE_URL = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    const tripPlannerForm = document.getElementById('tripPlannerForm');
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const submitBtn = document.querySelector('.submit-btn');

    const itineraryDisplay = document.getElementById('itinerary-display');
    let originalItineraryDisplayHTML = '';
    if(itineraryDisplay) {
        originalItineraryDisplayHTML = itineraryDisplay.innerHTML;
    }

    let currentStep = 1;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            sections.forEach(section => {
                section.style.visibility = 'hidden';
                section.style.position = 'absolute';
            });

            if (targetSection) {
                targetSection.style.visibility = 'visible';
                targetSection.style.position = 'relative';
                
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });

    function showStep(step) {
        formSteps.forEach((formStep, index) => {
            formStep.style.display = index + 1 === step ? 'block' : 'none';
        });

        prevBtn.disabled = step === 1;
        nextBtn.style.display = step === formSteps.length ? 'none' : 'inline-block';
        submitBtn.style.display = step === formSteps.length ? 'inline-block' : 'none';
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        showStep(currentStep);
    });

    function validateStep(step) {
        const currentFormStep = formSteps[step - 1];
        const requiredInputs = currentFormStep.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    function displayDestinationOptions(destinations) {
        const destinationOptionsContainer = document.getElementById('destination-options');
        if (!destinationOptionsContainer) return;

        destinationOptionsContainer.innerHTML = destinations.map(destination => `
            <div class="destination-card">
                <img src="${destination.image_url}" alt="${destination.name}">
                <h3>${destination.name}</h3>
                <p>${destination.description}</p>
                <p class="price">₹${destination.price_per_day} per day</p>
                <button class="explore-btn" data-destination-id="${destination.id}">Explore</button>
            </div>
        `).join('');

        document.querySelectorAll('.explore-btn').forEach(button => {
            button.addEventListener('click', () => {
                const destinationId = button.getAttribute('data-destination-id');
                
                // Ensure the itinerary section is visible and scroll to it
                const itinerarySection = document.getElementById('itinerary');
                const sections = document.querySelectorAll('section');

                sections.forEach(section => {
                    section.style.visibility = 'hidden';
                    section.style.position = 'absolute';
                });

                if (itinerarySection) {
                    itinerarySection.style.visibility = 'visible';
                    itinerarySection.style.position = 'relative';
                    itinerarySection.scrollIntoView({ behavior: 'smooth' });
                }
                
                displayItinerary(destinationId);
            });
        });
    }

    function displayFormDestinationOptions(destinations) {
        const destinationOptionsContainer = document.getElementById('destination-options-form');

         if (!destinationOptionsContainer) {
            console.error('Error: Destination options container element for form not found!');
            itineraryDisplay.innerHTML = '<p class="error-message">Error: Cannot display form destinations. Missing container element.</p>';
            itineraryDisplay.style.display = 'block';
            return;
        }

        destinationOptionsContainer.innerHTML = '';

        destinations.forEach((destination, index) => {
            const option = document.createElement('div');
            option.className = 'destination-option';
            option.innerHTML = `
                <label class="destination-option-label">
                    <input type="radio" name="destination" value="${destination.name}" required>
                    <div class="destination-option-content">
                        <h4>${index + 1}. ${destination.name}</h4>
                        <p>${destination.description}</p>
                        <div class="destination-details">
                            <span>Avg. Daily Price: ₹${destination.price_per_day}</span>
                        </div>
                    </div>
                </label>
            `;
            destinationOptionsContainer.appendChild(option);
        });
    }

    document.querySelectorAll('input[name="travelType"]').forEach(radio => {
        radio.addEventListener('change', async (e) => {
            const travelType = e.target.value;

            try {
                const destinationOptionsContainer = document.getElementById('destination-options-form');
                if(destinationOptionsContainer){
                    destinationOptionsContainer.innerHTML = '<div class="loading">Loading destinations...</div>';
                }

                const response = await fetch(`${API_BASE_URL}/api/destinations?type=${travelType}`);
                if (!response.ok) {
                    throw new Error(`Failed to load destinations: ${response.statusText}`);
                }

                const destinations = await response.json();
                if (!destinations || destinations.length === 0) {
                    if(destinationOptionsContainer){
                        destinationOptionsContainer.innerHTML = '<p class="error-message">No destinations available for this travel type.</p>';
                    }
                    return;
                }

                displayFormDestinationOptions(destinations);

            } catch (error) {
                console.error('Error loading destinations for form:', error);
                const destinationOptionsContainer = document.getElementById('destination-options-form');
                if(destinationOptionsContainer){
                    destinationOptionsContainer.innerHTML = `
                        <div class="error-message">
                            <p>Failed to load destinations. Please try again.</p>
                            <button onclick="retryLoadDestinationsForm('${travelType}')" class="retry-btn">Retry</button>
                        </div>
                    `;
                }
            }
        });
    });

    window.retryLoadDestinationsForm = async function(travelType) {
        const destinationOptionsContainer = document.getElementById('destination-options-form');
        try {
            if(destinationOptionsContainer){
                destinationOptionsContainer.innerHTML = '<div class="loading">Loading destinations...</div>';
            }

            const response = await fetch(`${API_BASE_URL}/api/destinations?type=${travelType}`);
            if (!response.ok) {
                throw new Error(`Failed to load destinations: ${response.statusText}`);
            }

            const destinations = await response.json();
            if (!destinations || destinations.length === 0) {
                if(destinationOptionsContainer){
                    destinationOptionsContainer.innerHTML = '<p class="error-message">No destinations available for this travel type.</p>';
                }
                return;
            }

            displayFormDestinationOptions(destinations);

        } catch (error) {
            console.error('Error loading destinations for form:', error);
            if(destinationOptionsContainer){
                destinationOptionsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load destinations. Please try again.</p>
                        <button onclick="retryLoadDestinationsForm('${travelType}')" class="retry-btn">Retry</button>
                    </div>
                `;
            }
        }
    };

    document.getElementById('tripPlannerForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Generating Itinerary...';
            
            const formData = new FormData(this);
            const data = {
                destination: formData.get('destination'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                budget: parseInt(formData.get('budget')),
                travelers: parseInt(formData.get('travelers')),
                travelType: formData.get('travelType'),
                accommodation: formData.get('accommodation'),
                foodPreferences: Array.from(formData.getAll('food')),
                specialRequirements: formData.get('special-requirements') || ''
            };

            if (!data.destination) {
                throw new Error('Please select a destination');
            }
            if (!data.startDate || !data.endDate) {
                throw new Error('Please select both start and end dates');
            }
            if (isNaN(data.budget) || data.budget <= 0) {
                throw new Error('Please enter a valid budget');
            }
            if (isNaN(data.travelers) || data.travelers <= 0) {
                throw new Error('Please enter a valid number of travelers');
            }

            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            if (days <= 0) {
                throw new Error('End date must be after start date');
            }
            if (days > 14) {
                throw new Error('Maximum trip duration is 14 days');
            }

            const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    days
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate itinerary');
            }

            const itinerary = await response.json();
            
            document.querySelector('.itinerary-form-container').style.display = 'none';
            
            // Ensure the itinerary section is visible and scroll to it
            const itinerarySection = document.getElementById('itinerary');
            const sections = document.querySelectorAll('section');

            sections.forEach(section => {
                section.style.visibility = 'hidden';
                section.style.position = 'absolute';
            });

            if (itinerarySection) {
                itinerarySection.style.visibility = 'visible';
                itinerarySection.style.position = 'relative';
                itinerarySection.scrollIntoView({ behavior: 'smooth' });
            }

            displayItinerary(itinerary);
            
        } catch (error) {
            console.error('Error generating itinerary:', error);
            alert(error.message || 'Failed to generate itinerary. Please try again.');
            document.querySelector('.itinerary-form-container').style.display = 'block';
            document.getElementById('itinerary-display').style.display = 'none';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    async function loadDestinations() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/destinations`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch destinations: ${response.status} ${errorText}`);
            }
            const allDestinations = await response.json();
            
            const featuredDestinations = allDestinations.filter(dest => 
                dest.name.includes('Backwaters') || 
                dest.name.includes('Taj Mahal') || 
                dest.name.includes('Goa')
            );
            
            if (featuredDestinations.length === 0) {
                displayDestinationOptions(allDestinations);
            } else {
                displayDestinationOptions(featuredDestinations); // This is the corrected line
            }
        } catch (error) {
            console.error('Error loading destinations:', error);
            const destinationOptionsContainer = document.getElementById('destination-options');
            if (destinationOptionsContainer) {
                destinationOptionsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load destinations. Please try again.</p>
                        <button onclick="loadDestinations()" class="retry-btn">Retry</button>
                    </div>
                `;
            }
        }
    }

    async function displayItinerary(data) {
        try {
            console.log('Received itinerary data:', data); // Debug log
            let destinationData;
            
            if (typeof data === 'string') {
                const response = await fetch(`${API_BASE_URL}/api/destinations/${data}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch destination details');
                }
                destinationData = await response.json();
            } else if (typeof data === 'object' && data !== null) {
                destinationData = data;
            } else {
                console.error('Invalid data received by displayItinerary:', data);
                throw new Error('Invalid itinerary data.');
            }
            
            let itineraryHTML = `
                <div class="destination-header">
                    <h2>${destinationData.destination || destinationData.name}</h2>
                    <p>${destinationData.description || ''}</p>
                </div>
                <div class="destination-details">
                    <div class="attractions">
                        <h3>Attractions</h3>
                        <ul>
                            ${(destinationData.touristPlaces || destinationData.attractions || []).map(attraction => `
                                <li>
                                    <strong>${attraction.name}</strong>
                                    ${attraction.description ? `<p>${attraction.description}</p>` : ''}
                                    ${attraction.entry_fee ? `<span class="entry-fee">Entry Fee: ${attraction.entry_fee.replace(/^Entry fee: /i, '')}</span>` : ''}
                                    ${attraction.opening_hours ? `<span class="hours">Entry Timings: ${attraction.opening_hours}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="accommodations">
                        <h3>Accommodations</h3>
                        <ul>
                            ${Object.entries(destinationData.accommodation || destinationData.accommodations || {}).map(([type, name]) => 
                                `<li><strong>${type}:</strong> ${name}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="food">
                        <h3>Food Places</h3>
                        <ul>
                            ${(destinationData.foodOptions || destinationData.food || []).map(foodPlace => `
                                <li>
                                    <strong>${foodPlace.name}</strong>
                                    ${foodPlace.description ? `<p>${foodPlace.description}</p>` : ''}
                                    ${foodPlace.type ? `<span class="type">${foodPlace.type}</span>` : ''}
                                    ${foodPlace.price_range ? `<span class="price-range">${foodPlace.price_range.replace('$', '')}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <div class="detailed-itinerary">
                    <h3>Detailed Itinerary</h3>
            `;

            if (destinationData.itinerary) {
                destinationData.itinerary.forEach(dayData => {
                    itineraryHTML += `
                        <div class="day-itinerary">
                            <h4>Day ${dayData.day}: ${dayData.title}</h4>
                            <div class="activities">
                                ${dayData.activities.map(activity => `
                                    <div class="activity">
                                        <span class="time">${activity.time}</span>
                                        <span class="type">${activity.type}</span>
                                        <div class="place">
                                            <strong>${activity.place.name}</strong>
                                            <p>${activity.place.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            } else if (destinationData.detailed_itinerary) {
                Object.entries(destinationData.detailed_itinerary).forEach(([dayKey, dayData]) => {
                    const dayNumber = dayKey.replace('day', '');
                    itineraryHTML += `
                        <div class="day-itinerary">
                            <h4>Day ${dayNumber}: ${dayData.title}</h4>
                            <div class="activities">
                                ${dayData.activities.map(activity => `
                                    <div class="activity">
                                        <span class="time">${activity.time}</span>
                                        <span class="type">${activity.type}</span>
                                        <div class="place">
                                            <strong>${activity.place.name}</strong>
                                            <p>${activity.place.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            }

            itineraryHTML += '</div>';

            const itineraryDisplay = document.getElementById('itinerary-display');

            if (itineraryDisplay) {
                itineraryDisplay.innerHTML = itineraryHTML;
                itineraryDisplay.style.display = 'block';
                
                const destinationOptions = document.getElementById('destination-options');
                if (destinationOptions) {
                    destinationOptions.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error displaying itinerary:', error);
            alert('Failed to load itinerary. Please try again later.');
        }
    }

    function getBestTimeToVisit(type) {
        const tips = {
            beach: 'October to March (pleasant weather)',
            mountain: 'March to June and September to November (clear views)',
            historical: 'October to March (comfortable for sightseeing)',
            adventure: 'October to March (ideal for outdoor activities)'
        };
        return tips[type] || 'Year-round';
    }

    function getLocalTransportation(type) {
        const tips = {
            beach: 'Auto-rickshaws and local buses',
            mountain: 'Shared taxis and local buses',
            historical: 'Auto-rickshaws and cycle rickshaws',
            adventure: 'Local buses and shared jeeps'
        };
        return tips[type] || 'Local transport available';
    }

    function getPackingEssentials(type) {
        const tips = {
            beach: 'Sunscreen, swimwear, beach towels',
            mountain: 'Warm clothes, hiking shoes, first aid kit',
            historical: 'Comfortable walking shoes, hat, water bottle',
            adventure: 'Sports shoes, quick-dry clothes, water bottle'
        };
        return tips[type] || 'Basic travel essentials';
    }

    showStep(1);
    loadDestinations();

    // Reviews functionality (merged into main DOMContentLoaded)
    const reviewForm = document.getElementById('reviewForm');
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    // Load existing reviews
    try {
        const response = await fetch('http://localhost:4000/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const reviews = await response.json();
        const reviewsContainer = document.getElementById('dynamic-reviews-container');
        reviewsContainer.innerHTML = ''; // Clear existing reviews from the dynamic container
        
        reviews.forEach(review => {
            const reviewCard = createReviewCard(review);
            reviewsContainer.appendChild(reviewCard);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        alert('Failed to load reviews. Please try again later.');
    }

    // Star rating functionality
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars();
        });

        star.addEventListener('mouseover', () => {
            highlightStars(index);
        });

        star.addEventListener('mouseout', () => {
            updateStars();
        });
    });

    function highlightStars(index) {
        stars.forEach((star, i) => {
            star.classList.toggle('active', i <= index);
        });
    }

    function updateStars() {
        stars.forEach((star, i) => {
            star.classList.toggle('active', i < selectedRating);
        });
    }

    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        card.innerHTML = `
            <div class="review-rating">${stars}</div>
            <p class="review-text">${review.review_text}</p>
            <div class="review-meta">
                <span class="reviewer-name">${review.reviewer_name}</span>
                <span class="review-destination">${review.destination}</span>
            </div>
        `;
        
        return card;
    }

    // Handle form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        const formData = {
            reviewer_name: document.getElementById('reviewerName').value,
            destination: document.getElementById('destination').value,
            rating: selectedRating,
            review_text: document.getElementById('reviewText').value
        };

        try {
            const response = await fetch('http://localhost:4000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to submit review');

            const newReview = await response.json();
            const reviewsContainer = document.getElementById('dynamic-reviews-container');
            const reviewCard = createReviewCard(newReview);
            reviewsContainer.insertBefore(reviewCard, reviewsContainer.firstChild);

            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            updateStars();
            
            alert('Thank you for your review!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again later.');
        }
    });
});