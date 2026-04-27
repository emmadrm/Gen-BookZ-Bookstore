import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";

const Library = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3000/library/${user.id}`)
      .then((res) => res.json())
      .then(({ books }) => {
        setBooks(books || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="library-loading">Φόρτωση βιβλιοθήκης...</p>;

  return (
    <main className="">
      {books.length === 0 ? (
        <div className="library-empty">
          <p className="text-black">Δεν έχετε αγοράσει κανένα βιβλίο ακόμα.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center  mt-2">
          {books.map((book) => (
            <div
              key={book.bookKey}
              className="cursor-pointer w-1/2 flex items-center gap-3 p-4 rounded-xl border border-black bg-gray-300 hover:bg-gray-400 transition"
              onClick={() =>
                navigate(`/library/${encodeURIComponent(book.bookKey)}`, {
                  state: { book },
                })
              }
            >
              <FaBook size={32} />

              <div className="flex flex-col">
                <span>{book.title}</span>
                <span>{book.author}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Library;
