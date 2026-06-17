import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { UserButton } from "@clerk/react";
import Logo from "../../assets/Logoo.png"; 
import ManageBooks from "./ManageBooks.jsx";
import Analytics from "./Analytics.jsx";
import Comments from "./Comments.jsx";
import Reviews from "./Reviews.jsx";
import "../../index.css"; 

function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("books");
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const clerkId = sessionStorage.getItem("clerkId");
    if (!clerkId) return;

    fetch(`http://localhost:3000/author/${clerkId}/dashboard`)
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch((err) => console.error("Failed to load dashboard data:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "books":
        return <ManageBooks initialBooks={dashboardData?.books} />;
      case "analytics":
        return <Analytics dashboardData={dashboardData} />;
      case "comments":
        return <Comments initialComments={dashboardData?.questions} />;
      case "reviews":
        return <Reviews initialReviews={dashboardData?.reviews} />;
      default:
        return <ManageBooks initialBooks={dashboardData?.books} />;
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      
      
      <header className="header-main">
        <div className="top-bar">
          <div className="top-bar-content">
            <div className="contact-info">
              <span>Τηλ. Εξυπηρέτησης: 210 1234567 </span>
            </div>
          </div>
        </div>

        <div className="main-header">
          <div className="logo-group">
            <div style={{ display: "flex", alignItems: "center" }}>
              <img alt="Gen BookZ logo" className="logo" src={Logo} />
              <div className="logo-container user-links">
                <h1 className="title">
                  <span>Gen</span> Book<span>Z</span>
                </h1>
              </div>
            </div>
          </div>

          
          <div className="search-container">
            <form className="search-box" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Αναζήτηση στα βιβλία σας (με τίτλο, ISBN)..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </form>
          </div>

          
          <div className="header-actions" style={{ justifyContent: "flex-end", minWidth: "80px" }}>
            <div className="action-icon">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50",
                  },
                }}
              />
            </div>
          </div>
        </div>

        
        <nav className="nav-bar" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <ul className="nav-links" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", listStyle: "none", margin: 0, padding: 0, width: "100%", maxWidth: "1200px" }}>
            <li>
              <button
                onClick={() => setActiveTab("books")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  padding: "15px 10px",
                  borderBottom: activeTab === "books" ? "3px solid #e67e22" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                ΔΙΑΧΕΙΡΙΣΗ ΒΙΒΛΙΩΝ
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("analytics")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  padding: "15px 10px",
                  borderBottom: activeTab === "analytics" ? "3px solid #e67e22" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                ΣΤΑΤΙΣΤΙΚΑ
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("comments")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  padding: "15px 10px",
                  borderBottom: activeTab === "comments" ? "3px solid #e67e22" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                ΣΧΟΛΙΑ & ΕΡΩΤΗΣΕΙΣ
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("reviews")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  padding: "15px 10px",
                  borderBottom: activeTab === "reviews" ? "3px solid #e67e22" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                ΚΡΙΤΙΚΕΣ
              </button>
            </li>
          </ul>
        </nav>
      </header>

      
      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        {renderContent()}
      </main>

    </div>
  );
}

export default AuthorDashboard;