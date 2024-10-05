import Head from "next/head";
import Message from "/components/message";
import { useEffect, useState } from "react";
import { db } from "/utils/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { MdOutlineComment } from "react-icons/md";

export default function Home() {
  // create a state with all posts
  const [allPosts, setAllPosts] = useState([]);

  // to get all post by their timestamp in descending order
  const getPosts = async () => {
    const collectionRef = collection(db, "posts");
    const q = query(collectionRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  };

  // to call get posts
  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      <Head>
        <title>Message Board</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="my-12 text-lg font-medium">
        <h2>See what other people are saying</h2>
        {allPosts.map((post) => (
          <Message key={post.id} {...post}>
            <Link href={{ pathname: `/${post.id}`, query: { ...post } }}>
              <button className="text-black-600 flex items-center justify-center gap-2 py-2 text-lg">
                <MdOutlineComment className="text-2xl" />
                {post.comments?.length > 0 ? post.comments?.length : 0} comments
              </button>
            </Link>
          </Message>
        ))}
      </div>
    </div>
  );
}
