/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import RelatedMovies from "../../../components/RelatedMovies";
import { Rating } from "@/components/Rating";
import { ToastContainer, toast } from "react-toastify";
import { RingLoader } from "react-spinners";
import { Edit2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Movie {
    id: number;
    title: string;
    image: string;
    releaseDate: number;
    type: string;
    certificate: string | null;
    createdBy: string;
    genres: string[];
    averageRating: number | null;
    userRating: number | 0;
    description: string | null;
}

interface Comment {
    id: number;
    content: string;
    userId: number;
    user: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

const MovieDetailPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [, setRating] = useState<number>(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null
    );
    const commentBoxRef = useRef<HTMLTextAreaElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const pathname = usePathname();
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

    const fetchMovie = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/movie/${id}?userID=${userId ?? ""}`
            );
            const data = await response.json();
            if (response.ok) {
                setMovie(data.movie);
            } else {
                toast.error("Failed to fetch movie details");
            }
        } catch (error) {
            console.error("Error fetching movie details:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchComments = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/comments/${id}`
            );
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments);
            } else {
                toast.error("Failed to fetch comments");
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    useEffect(() => {
        fetchMovie();
        fetchComments();
    }, [id]);

    const handleRatingChange = async (newRating: number) => {
        setRating(newRating);

        const token = Cookies.get("token");

        if (!token) {
            toast.warning("User is not authenticated");
            router.push(redirectUrl);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/api/movie-rate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Attach token from cookies
                    },
                    body: JSON.stringify({
                        movieId: movie?.id,
                        score: newRating,
                    }),
                }
            );

            if (response.ok) {
                fetchMovie();
                toast.success("Rated successfully");
            } else {
                const data = await response.json();
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error submitting rating");
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("token");

        if (!token) {
            toast.warning("User is not authenticated");
            router.push(redirectUrl);
            return;
        }

        try {
            let url = `http://localhost:8000/api/comments`;
            let method = "POST";

            if (editingCommentId) {
                url = `http://localhost:8000/api/comments/${editingCommentId}`;
                method = "PUT"; // Changed from PUT to PATCH
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newComment,
                    movieId: movie ? parseInt(movie.id.toString()) : null,
                }),
            });

            if (response.ok) {
                fetchComments();
                setNewComment("");
                setEditingCommentId(null);
                toast.success(
                    editingCommentId
                        ? "Comment updated successfully"
                        : "Comment added successfully"
                );
            } else {
                const data = await response.json();
                if (data.errors) {
                    Object.entries(data.errors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                } else {
                    toast.error(data.message || "Error submitting comment");
                }
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            toast.error("Error submitting comment");
        }
    };

    const handleEditComment = (comment: Comment) => {
        setNewComment(comment.content);
        setEditingCommentId(comment.id);
        commentBoxRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleDeleteComment = async (movieId: number) => {
        setCommentToDelete(movieId);
        setIsDeleteDialogOpen(true);
    };
    const userId = Cookies.get("userId");
    const confirmDelete = async () => {
        if (!commentToDelete) return;
        const token = Cookies.get("token");

        if (!token) {
            toast.warning("User is not authenticated");
            router.push(redirectUrl);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/api/comments/${commentToDelete}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchComments();
                toast.success("Comment deleted successfully");
            } else {
                const data = await response.json();
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error deleting comment");
        }
    };

    const handleClick = (movieId: number) => {
        router.push(`/update-movie/${movieId}`);
    };

    if (loading) {
        return <p className="text-center text-xl font-semibold">Loading...</p>;
    }

    if (!movie) {
        return (
            <p className="text-center text-xl font-semibold">Movie not found</p>
        );
    }

    return (
        <div className="relative bg-gray-100 min-h-screen">
            <ToastContainer position="top-right" />
            <div className="flex flex-col md:flex-row">
                {/* Background with Title */}
                <div className="relative w-full md:w-2/3 h-[600px]">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${movie.image})`,
                            filter: "brightness(0.6)",
                        }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl text-white font-bold tracking-wide drop-shadow-lg shadow-black text-center p-4">
                            {movie.title}
                        </h1>
                    </div>
                </div>

                {/* Related Movies (scrollable) */}
                <div className="w-full md:w-1/3 h-[600px] bg-gray-900 text-white p-5 overflow-y-auto space-y-4 no-scrollbar">
                    <RelatedMovies movieId={movie.id} />
                </div>
            </div>
            <div className="w-full bg-black py-10">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Movie Information */}
                        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className=" flex text-4xl font-extrabold mb-6 text-white border-b-2 border-gray-600 pb-2 justify-between">
                                <div>
                                    {movie.title}{" "}
                                    <Rating
                                        width={100}
                                        value={movie.averageRating ?? 0}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    {movie?.createdUser ===
                                        parseInt(userId || "0") && (
                                        <button
                                            onClick={() =>
                                                handleClick(movie?.id)
                                            }
                                            className="edit p-2 bg-white bg-opacity-75 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200 group"
                                        >
                                            <Edit2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                        </button>
                                    )}
                                    {/* <button
                    onClick={() => handleClick(movie?.id)}
                    className="p-2 bg-white bg-opacity-75 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200 group"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </button> */}
                                </div>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* First Row: 2 items */}
                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                                    <p className="text-lg text-white">
                                        <span className="font-semibold">
                                            Released:
                                        </span>{" "}
                                        {movie.releaseDate}
                                    </p>
                                </div>
                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                                    <p className="text-lg text-white">
                                        <span className="font-semibold">
                                            Genre:
                                        </span>{" "}
                                        {movie.genres
                                            .map((genre) => genre)
                                            .join(", ")}
                                    </p>
                                </div>
                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                                    <p className="text-lg text-white">
                                        <span className="font-semibold">
                                            Created By:
                                        </span>{" "}
                                        {movie.createdBy}
                                    </p>
                                </div>
                                {/* Full Row: Description */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                                    <p className="text-lg text-white">
                                        <span className="font-semibold">
                                            Description:
                                        </span>{" "}
                                        {movie.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Movie Poster & Actions */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-none w-full md:w-1/3 h-fit">
                            <img
                                src={movie.image}
                                alt={movie.title}
                                className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                            />

                            {/* Star Rating Component */}
                            <div className="text-center mt-4">
                                <Rating
                                    value={movie.userRating ?? 0}
                                    onChange={handleRatingChange}
                                    readOnly={false}
                                    width={500}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="w-full bg-gray-900 p-6">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Comments
                    </h2>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <textarea
                            ref={commentBoxRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                            rows={4}
                            placeholder="Add a comment..."
                        ></textarea>
                        <button
                            type="submit"
                            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            {editingCommentId
                                ? "Update Comment"
                                : "Add Comment"}
                        </button>
                    </form>

                    {/* Comments List */}
                    {comments.length ?? 0 > 0 ? (
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white mb-6">
                                All Comments (
                                <span className=" text-orange-600">
                                    {comments.length ?? 0}
                                </span>
                                )
                            </h2>

                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-gray-800 p-4 rounded-lg shadow-lg"
                                >
                                    <p className="text-white mb-2">
                                        {comment.content}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        By {comment.user.firstName}{" "}
                                        {comment.user.lastName} on{" "}
                                        {new Date(
                                            comment.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                    {comment.userId ===
                                        parseInt(
                                            Cookies.get("userId") || "0"
                                        ) && (
                                        <div className="mt-2">
                                            <button
                                                onClick={() =>
                                                    handleEditComment(comment)
                                                }
                                                className="mr-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                variant="destructive"
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment.id
                                                    )
                                                }
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this Comment?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the Comment from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <RingLoader
                                    color="#ffffff"
                                    loading={true}
                                    size={24}
                                />
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MovieDetailPage;
