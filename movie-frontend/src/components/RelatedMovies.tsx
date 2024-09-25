/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  genres: string[];
}

interface RelatedMoviesProps {
  movieId: number;
}

const RelatedMovies: React.FC<RelatedMoviesProps> = ({ movieId }) => {
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRelatedMovies = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/movies/related/${movieId}`
        );
        const data = await response.json();
        if (response.ok) {
          setRelatedMovies(data.movies);
        } else {
          console.error("Failed to fetch related movies");
        }
      } catch (error) {
        console.error("Error fetching related movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedMovies();
  }, [movieId]);

  if (loading) {
    return <p className="text-center">Loading related movies...</p>;
  }

  if (relatedMovies.length === 0) {
    return <p className="text-center">No related movies found</p>;
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-white mb-5">Related Movies</h3>
      <div className="space-y-3">
        {relatedMovies.map((movie) => (
          <div
            onClick={() => router.push(`/movie/${movie.id}`)}
            key={movie.id}
            className="flex bg-slate-950 text-white rounded-lg shadow-lg p-2 hover:bg-gray-800 transition"
          >
            <img
              src={movie.image}
              alt={movie.title}
              className="w-20 h-auto object-cover rounded-lg mr-4"
            />
            <div className="flex flex-col justify-center">
              <h4 className="text-xl font-semibold truncate">{movie.title}</h4>
              <p className="text-sm mt-1">Released: {movie.releaseDate}</p>
              <p className="text-sm">Genre: {movie.genres.join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedMovies;
