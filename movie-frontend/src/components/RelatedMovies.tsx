import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  genres: string[];
  viewCount: number;
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
          `http://localhost:8000/api/movies/${movieId}/related`
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

  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return `${title.slice(0, maxLength)}...`;
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div
      onClick={() => router.push(`/movie/${movie.id}`)}
      className="flex bg-slate-950 text-white rounded-lg shadow-lg p-2 hover:bg-gray-800 transition"
    >
      <img
        src={movie.image}
        alt={movie.title}
        className="w-20 h-auto object-cover rounded-lg mr-4"
      />
      <div className="flex flex-col justify-center">
        <h4 className="text-xl font-semibold" title={movie.title}>
          {truncateTitle(movie.title, 30)}
        </h4>
        <p className="text-sm mt-1">Released: {movie.releaseDate}</p>
        <p className="text-sm mt-1">Released: {movie.genres.join(",")}</p>
        <div className="flex items-center text-sm">
          <Eye size={16} className="mr-1" />
          <span>{movie.viewCount}</span>
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="flex bg-slate-950 text-white rounded-lg shadow-lg p-2">
      <div className="w-20 h-28 bg-gray-700 rounded-lg mr-4 animate-pulse"></div>
      <div className="flex flex-col justify-center w-full">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-white mb-5">Related Movies</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (relatedMovies.length === 0) {
    return <p className="text-center">No related movies found</p>;
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-white mb-5">Related Movies</h3>
      <div className="space-y-3">
        {relatedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default RelatedMovies;
