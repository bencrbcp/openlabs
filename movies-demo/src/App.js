import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MovieList from './components/MovieList';

const App = () => {
  const [movies, setMovies] = useState([{
            "Title": "Neon Genesis Evangelion",
            "Year": "1995–1996",
            "imdbID": "tt0112159",
            "Type": "series",
            "Poster": "https://m.media-amazon.com/images/M/MV5BZjZjZGI3ZDQtODNmZC00NjE0LTlmYTUtOTljMWI2YjNmMTQ0XkEyXkFqcGc@._V1_SX300.jpg"
        },
        {
            "Title": "Neon Genesis Evangelion: The End of Evangelion",
            "Year": "1997",
            "imdbID": "tt0169858",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMGI2Y2RiYTctYWIwZi00NjA2LWFmYzYtZDhkNTk1ZGNmNDVmXkEyXkFqcGc@._V1_SX300.jpg"
        },
        {
            "Title": "Neon Genesis Evangelion: Death & Rebirth",
            "Year": "1997",
            "imdbID": "tt0169880",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMGRiOWQyOTAtZDQ0Ny00NGRiLWIyYTYtZWM1MjNjNzg0ZjE3XkEyXkFqcGc@._V1_SX300.jpg"
        },]);
  return (
  <div className='container-fluid movie-app'>
    <div className='row'>
      <MovieList movies ={movies} />
    </div>
  </div>
  );
};

export default App;