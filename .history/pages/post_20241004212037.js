import { auth, db } from "/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "/components/spinner";

const Post = () => {
  const [post, setPost] = useState({ description: "" });
  const [user, loading] = useAuthState(auth);
  const route = useRouter();
  const routeData = route.query;

  // Centralized post validation
  const validatePost = (post) => {
    if (!post.description) {
      toast.error("Description field is empty 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 500,
      });
      return false;
    }
    if (post.description.length > 300) {
      toast.error("Description field is too long 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 500,
      });
      return false;
    }
    return true;
  };

  // Submit post function with error handling
  const submitPost = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate post
      if (!validatePost(post)) return;

      try {
        if (post.hasOwnProperty("id")) {
          // Updating existing post
          const docRef = doc(db, "posts", post.id);
          await updateDoc(docRef, {
            ...post,
            timestamp: serverTimestamp(),
          });
          toast.success("Post has been updated 😃", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 500,
          });
        } else {
          // Creating new post
          const collectionRef = collection(db, "posts");
          await addDoc(collectionRef, {
            ...post,
            timestamp: serverTimestamp(),
            user: user.uid,
            avatar: user.photoURL,
            username: user.displayName,
          });
          toast.success("Post has been made 😃", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 500,
          });
        }
        setPost({ description: "" });
        route.push("/");
      } catch (error) {
        console.error("Error submitting post: ", error);
        toast.error("Something went wrong. Please try again.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 500,
        });
      }
    },
    [post, user, route]
  );

  // User authentication and post loading all done in this hook
  useEffect(() => {
    if (loading) return;

    if (!user) {
      route.push("/auth/login");
    } else if (routeData.id) {
      setPost({ description: routeData.description, id: routeData.id });
    }
  }, [user, loading, routeData, route]);

  return (
    <>
      {/* if loading render loading spinner otherwise render post page */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="my-20 p-12 shadow-lg rounded-lg max-w-md mx-auto">
          <form onSubmit={submitPost}>
            <h1 className="text-2xl font-bold">
              {post.hasOwnProperty("id")
                ? "Edit your post"
                : "Create a new post"}
            </h1>
            <div className="py-2">
              <h3 className="text-lg font-medium py-2">Description</h3>
              <textarea
                value={post.description}
                onChange={(e) =>
                  setPost((prev) =>
                    prev.description !== e.target.value
                      ? { ...prev, description: e.target.value }
                      : prev
                  )
                }
                className="bg-gray-800 h-48 w-full text-white rounded-lg p-2 text-sm"
              ></textarea>
              <p
                className={`text-cyan-600 font-medium text-sm ${
                  post.description.length > 300 ? "text-red-600" : ""
                }`}
              >
                {post.description.length}/300
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white font-medium p-2 my-2 rounded-lg text-sm"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Post;
