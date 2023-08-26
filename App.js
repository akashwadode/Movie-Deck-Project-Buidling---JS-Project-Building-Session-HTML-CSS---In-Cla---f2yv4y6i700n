
const API_KEY = "46e4b90df63d0a5a760928740c57c129";

// Global variables
let pageNumber = 1;
let totalPages = 1;
let currentState = "all";  // States: all, fav, search
const arrayObj = [];

// DOM elements
const movieListContainer = document.querySelector("#movie-list");
let allBtn = document.querySelector("#all");
let favBtn = document.querySelector("#fav");
let seachBarInput = document.querySelector("#search-bar-input");
let pageNumberEle = document.querySelector("#page-no");

// Sorting options

const allPopularDesc = "popularity.desc";
const sortDateAsc = "primary_release_date.asc";
const sortDateDesc = "primary_release_date.desc";
const sortRatingAsc = "vote_average.asc";
const sortRatingDesc = "vote_average.desc";
let currentSort = allPopularDesc;

// Function to initialize the website
function init() {
    pageNumber = 1;
    changeState("all");
    currentSort = allPopularDesc;
    fetchApi(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=1&sort_by=${currentSort}`
    );
}
init();

// Function to search movies based on input
function search() {
    currentState = "search";
    pageNumber=1;
    const searchValue = seachBarInput.value;
    const searchString = searchValue.replace(/\s/g, "+"); // replace all whitespace with "+"
    fetchApi(`https://api.themoviedb.org/3/search/movie?query=${searchString}&api_key=${API_KEY}`);
}

// Function to sort movie based on value (date or rating)
function sortBy(value) {
    if (currentState == "fav" || currentState == "search") return; // if fav section is active sort wil not work
    const dateToggle = document.querySelector("#date-toggle");
    const ratingToggle = document.querySelector("#rating-toggle");
    if (value == "date") {

        if (dateToggle.textContent == "Sort by date (latest to oldest)") {
            dateToggle.textContent = "Sort by date (oldest to latest)";
            currentSort = sortDateDesc;
            pageNumber = 1;
            fetchApi(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=1&sort_by=${sortDateDesc}`);


        } else {
            dateToggle.textContent = "Sort by date (latest to oldest)";
            currentSort = sortDateAsc;
            pageNumber = 1;
            fetchApi(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=1&sort_by=${sortDateAsc}`);

        }

    } else {
        if (ratingToggle.textContent == "Sort by rating (most to least)") {
            ratingToggle.textContent = "Sort by rating (least to most)";
            currentSort = sortRatingDesc;
            pageNumber = 1;
            fetchApi(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=1&sort_by=${currentSort}`);


        } else {
            ratingToggle.textContent = "Sort by rating (most to least)";
            currentSort = sortRatingAsc;
            pageNumber = 1;
            fetchApi(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=1&sort_by=${currentSort}`);

        }
    }

}


// Function to change section (all, fav)
function changeState(state) {
    if (currentState == state) {
        return;
    } else {
        currentState = state;
        console.log("Inside " + state + " section");
        if (state == "all") {
            allBtn.className = "button button--black";
            favBtn.className = "button button--white";
            init();
        } else {
            allBtn.className = "button button--white";
            favBtn.className = "button button--black";
            favoriteSection();
        }
    }
}

// Function to fill favorite section
function favoriteSection() {
    arrayObj.length = 0;
    pageNumber = 1;
    pageNumberEle.textContent = pageNumber;
    totalPages = 1;
    movieListContainer.innerHTML ="";
    if (localStorage.length == 0) {
        movieListContainer.innerHTML = "No favorites yet";
    } else {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            fetchApi(value);
        }
    }

}

// Function to fetch data from API
async function fetchApi(apiUrl) {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (currentState == "all" || currentState == "search") {
        const result = data.results || [];
        totalPages = data.total_pages;
        if(data.total_results == 0){
            movieListContainer.innerHTML ="<p>No results</p>";
            return; 
        }
        console.log("total pages = " + totalPages);
        renderMovieList(result);
    } else{
        arrayObj.push(data);
        renderMovieList(arrayObj);
    }
}

// Function to render the movie list
function renderMovieList(data) {
    movieListContainer.innerHTML = "";
    pageNumberEle.textContent = pageNumber;
    for (let x of data) {

        const movieArticle = createCustomElement(
            "article",
            "movie",
            movieListContainer
        );


        const movieImage = createCustomElement("img", "movie-poster", movieArticle);
        movieImage.src = `https://image.tmdb.org/t/p/original/${x.poster_path}`;

        const movieDetailsSection = createCustomElement(
            "section",
            "movie-details",
            movieArticle
        );

        const movieTitle = createCustomElement("h2", null, movieDetailsSection);
        movieTitle.textContent = x.original_title;

        const rating = createCustomElement("p", null, movieDetailsSection);
        rating.textContent = `Rating : ${x.vote_average}`;

        const footer = createCustomElement("footer", null, movieArticle);

        const date = createCustomElement("p", null, footer);
        date.textContent = x.release_date;

        if (localStorage.getItem(x.id)) {
            console.log(`${x.id} ${x.original_title} present in localstorage`);
        }
        const likeBtn = createCustomElement(
            "i",
            localStorage.getItem(x.id) ? likeClass : unlikeClass,
            footer
        );
        likeBtn.id = x.id;
        likeBtn.setAttribute("onclick", `likeBtnToggle(${x.id})`);
    }
}

// CSS classes for like button
const likeClass = "fa-solid fa-heart like";
const unlikeClass = "fa-regular fa-heart like";

// Function to toggle like button
function likeBtnToggle(movieId) {
    let likeBtn = document.getElementById(movieId);
    if (likeBtn.className === unlikeClass) {
        likeBtn.className = likeClass;
        console.log(`${movieId} liked`);
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
        localStorage.setItem(`${movieId}`, url);
    } else {
        likeBtn.className = unlikeClass;
        localStorage.removeItem(movieId);
        console.log(`${movieId} unliked`);
    }
    if(currentState == "fav"){
        favoriteSection();
    }
}

// Function for pagination
function pagination(navigation) {
    let tempPageNumber = pageNumber;
    if (navigation === "prev") {
        if (pageNumber > 1) {
            pageNumber--;
        } else {
            return;
        }
    } else {
        if (pageNumber < totalPages) {
            pageNumber++;
        }

    }
    if (pageNumber != tempPageNumber && currentState != "search") { 
        fetchApi(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&api_key=${API_KEY}&language=en-US&page=${pageNumber}&sort_by=${currentSort}`);

        window.scrollTo(0, 0);
    }

}

// Function to create a custom element and append to parent
function createCustomElement(eleType, clName, parent) {
    const newElement = document.createElement(eleType);
    newElement.className = clName;
    parent.appendChild(newElement);
    return newElement;
}
