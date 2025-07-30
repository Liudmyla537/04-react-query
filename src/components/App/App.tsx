import { useState, useEffect } from 'react';
import {useQuery} from '@tanstack/react-query';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import { fetchMovies } from '../../services/movieService';
import { Movie } from '../../types/movie';
import { Toaster, toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

import css from "./App.module.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query.length > 0,
  });

  const handleSearch = (newQuery: string) => {
     if (newQuery !== query) {
      setPage(1);
      setQuery(newQuery);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const totalPages = data?.total_pages ?? 0;
  const hasPagination = totalPages > 1;

  useEffect(() => {
    if (!isLoading && !isError && data?.results.length === 0 && query) {
      toast.error('No movies found for your request.');
    }
  }, [data, isLoading, isError, query]);

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {!isLoading && !isError && data?.results && data.results.length > 0 && (
        <>
          {hasPagination && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
          <MovieGrid movies={data.results} onSelect={handleSelectMovie} />
        </>
      )}
      
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={handleCloseModal} />}
      <Toaster position="top-right" />
    </>
  );
}


