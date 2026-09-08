import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "@clerk/react";

const StarRating = ({ value, onChange }) => (
  <div className="star-rating flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => onChange && onChange(star)}
        style={{
          cursor: onChange ? "pointer" : "default",
          color: star <= value ? "#f59e0b" : "#d1d5db",
          fontSize: "24px",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const BookForum = () => {
  const { bookKey } = useParams();
  const { state } = useLocation();
  const { user } = useUser();
  const book = state?.book;

  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const decodedKey = decodeURIComponent(bookKey);

  const fetchForum = () => {
    fetch(`http://localhost:3000/book/${encodeURIComponent(bookKey)}/forum`)
      .then((res) => res.json())
      .then(({ reviews, questions }) => {
        setReviews(reviews || []);
        setQuestions(questions || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchForum();
  }, [bookKey]);

  const handleReviewSubmit = async () => {
    if (!newRating || !newReview.trim()) return;
    setSubmitting(true);

    const res = await fetch("http://localhost:3000/book/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookKey: decodedKey,
        rating: newRating,
        content: newReview,
        clerkId: user.id,
      }),
    });

    const { review } = await res.json();
    setReviews((prev) => [review, ...prev]); 
    setNewRating(0);
    setNewReview("");
    setSubmitting(false);
  };

  const handleQuestionSubmit = async () => {
    if (!newQuestion.trim()) return;
    setSubmitting(true);

    const res = await fetch("http://localhost:3000/book/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookKey: decodedKey,
        content: newQuestion,
        clerkId: user.id,
      }),
    });

    const { question } = await res.json();
    setQuestions((prev) => [question, ...prev]); 
    setNewQuestion("");
    setSubmitting(false);
  };

  const isReviewValid = newReview.trim().length > 0 || newRating > 0;
  const isQuestionValid = newQuestion.trim().length > 0;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Book Header */}
      <header className="border-b border-gray-100 pb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {book?.title || decodedKey}
        </h1>
        <p className="text-xl text-gray-500 italic">
          {book?.author || "Άγνωστος Συγγραφέας"}
        </p>
      </header>

      {/* Input Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Review Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-semibold text-black mb-6 flex justify-center gap-2">
            Κριτικές
          </h2>
          <div className="space-y-4">
            <StarRating value={newRating} onChange={setNewRating} />
            <textarea
              placeholder="Πείτε μας τη γνώμη σας για το βιβλίο..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all duration-200 min-h-[120px] resize-none text-gray-700"
            />
            <button
              onClick={handleReviewSubmit}
              disabled={submitting || !isReviewValid}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                isReviewValid
                  ? "bg-amber-500 hover:bg-amber-600 shadow-md transform hover:-translate-y-0.5 active:scale-95"
                  : "bg-gray-200 cursor-not-allowed text-gray-400"
              }`}
            >
              {submitting ? "Υποβολή..." : "Υποβολή Κριτικής"}
            </button>
          </div>
        </section>

        {/* Question Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-semibold text-black mb-6">Ερωτήσεις</h2>
          <div className="space-y-4 mt-5">
            <textarea
              placeholder="Έχετε κάποια απορία;"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all duration-200 min-h-[120px] resize-none text-gray-700"
            />
            <button
              onClick={handleQuestionSubmit}
              disabled={submitting || !isQuestionValid}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                isQuestionValid
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-md transform hover:-translate-y-0.5 active:scale-95"
                  : "bg-gray-200 cursor-not-allowed text-gray-400"
              }`}
            >
              {submitting ? "Υποβολή..." : "Υποβολή Ερώτησης"}
            </button>
          </div>
        </section>
      </div>

      {/* Reviews List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-black border-b border-gray-100 pb-3">
          Όλες οι Κριτικές{" "}
          <span className="text-sm font-normal text-gray-400">
            ({reviews.length})
          </span>
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Δεν υπάρχουν κριτικές ακόμα. Γίνετε ο πρώτος!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {r.user?.name || "Ανώνυμος"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("el-GR")}
                  </span>
                </div>
                <StarRating value={r.rating} />
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Questions List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-black border-b border-gray-100 pb-3">
          Όλες οι Ερωτήσεις{" "}
          <span className="text-sm font-normal text-gray-400">
            ({questions.length})
          </span>
        </h2>

        {questions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Δεν υπάρχουν ερωτήσεις ακόμα.
          </p>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {q.user?.name || "Ανώνυμος"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(q.createdAt).toLocaleDateString("el-GR")}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{q.content}</p>

                {/* Answers */}
                {q.answers?.length > 0 && (
                  <div className="mt-4 ml-4 border-l-2 border-indigo-100 pl-4 space-y-3">
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
                      Απαντήσεις
                    </p>
                    {q.answers.map((a) => (
                      <div key={a.id} className="bg-indigo-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-indigo-700">
                            {a.user?.name || "Ανώνυμος"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(a.createdAt).toLocaleDateString("el-GR")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default BookForum;
