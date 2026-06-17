import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { prisma } from "./db.js";

dotenv.config({ path: "./.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Αυξάνουμε το όριο στα 50mb για να χωράνε οι εικόνες Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Endpoint για την αποθήκευση απαντήσεων σε ερωτήσεις
app.post("/book/answer", async (req, res) => {
  try {
    const { questionId, content, clerkId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const answer = await prisma.answer.create({
      data: { content, questionId, userId: user.id }
    });
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent AND save a pending order
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, cart, userEmail, userName } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });

    // Save order as PENDING — will be confirmed on success
    await prisma.order.create({
      data: {
        paymentIntentId: paymentIntent.id,
        userEmail,
        userName,
        totalAmount: amount / 100,
        status: "PENDING",
        items: {
          create: cart.map((item) => ({
            bookKey: item.key || item.id || "",
            title: item.title || "Unknown Title",
            author: Array.isArray(item.author_name)
              ? item.author_name[0] // OpenLibrary search result format
              : item.author || "Unknown Author",
            price: item.price,
          })),
        },
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Called from PaymentSuccess page to confirm and retrieve order
app.post("/confirm-order", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Verify with Stripe that payment actually succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Mark order as completed and return it
    const order = await prisma.order.update({
      where: { paymentIntentId },
      data: { status: "COMPLETED" },
      include: { items: true },
    });

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Save user after role selection
app.post("/users/save", async (req, res) => {
  try {
    const { clerkId, email, name, role } = req.body;

    if (!clerkId || !email || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { role, name, email }, // update in case they changed role
      create: { clerkId, email, name, role },
    });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* Delete user on sign out
app.delete("/users/delete", async (req, res) => {
  try {
    const { clerkId } = req.body;

    // Find the user first to get their email and id
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.json({ success: true });

    const orders = await prisma.order.findMany({
      where: { userEmail: user.email },
      select: { id: true },
    });

    const orderIds = orders.map((o) => o.id);

    // Delete in order: children first, then parents
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { userEmail: user.email } });

    // Finally delete the user
    await prisma.user.delete({ where: { clerkId } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}); */

// Delete user on sign out - ΔΙΟΡΘΩΘΗΚΕ: Πλέον δεν σβήνει παραγγελίες ούτε τον χρήστη
app.delete("/users/delete", async (req, res) => {
  // Απλώς επιστρέφουμε επιτυχία για να μην "σκάει" το frontend αν το καλέσει
  sessionStorage.clear();
  res.json({ success: true, message: "Ασφαλής αποσύνδεση. Τα δεδομένα διατηρήθηκαν." });
});

// Check if user already has a role saved
app.get("/users/:clerkId", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });
    res.json({ user }); // null if not found
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all completed orders with books for a user
app.get("/library/:clerkId", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const orders = await prisma.order.findMany({
      where: { userEmail: user.email, status: "COMPLETED" },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Flatten to unique books across all orders
    const booksMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!booksMap.has(item.bookKey)) {
          booksMap.set(item.bookKey, {
            bookKey: item.bookKey,
            title: item.title,
            author: item.author,
            price: item.price,
            purchasedAt: order.createdAt,
          });
        }
      });
    });

    res.json({ books: Array.from(booksMap.values()) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews and questions for a specific book
app.get("/book/:bookKey/forum", async (req, res) => {
  try {
    const bookKey = decodeURIComponent(req.params.bookKey);

    const reviews = await prisma.review.findMany({
      where: { bookKey },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const questions = await prisma.question.findMany({
      where: { bookKey },
      include: {
        user: { select: { name: true } },
        answers: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ reviews, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/author/:clerkId/dashboard", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ΔΙΟΡΘΩΘΗΚΕ: Φιλτράρισμα με βάση το λεκτικό όνομα του συγγραφέα (user.name)
    const books = await prisma.book.findMany({ 
      where: { 
        author: { equals: user.name, mode: 'insensitive' } 
      } 
    });
    const bookKeys = books.map((b) => b.bookKey);

    // 2. Φέρνουμε τα αντικείμενα που έχουν πουληθεί μαζί με τις πληροφορίες της παραγγελίας (για την ημερομηνία)
    const soldItems = await prisma.orderItem.findMany({
      where: { 
        bookKey: { in: bookKeys },
        order: { status: "COMPLETED" } 
      },
      include: { order: true }
    });

    // 3. Υπολογισμός πωλήσεων ανά βιβλίο
    const salesByBook = {};
    soldItems.forEach((it) => {
      if (!salesByBook[it.bookKey]) salesByBook[it.bookKey] = { sales: 0, revenue: 0 };
      salesByBook[it.bookKey].sales += 1;
      salesByBook[it.bookKey].revenue += it.price || 0;
    });

    let totalSales = 0;
    let totalEarnings = 0;
    books.forEach((b) => {
      totalSales += salesByBook[b.bookKey]?.sales || 0;
      totalEarnings += salesByBook[b.bookKey]?.revenue || 0;
    });

    const booksWithStats = books.map((b) => {
      const sales = salesByBook[b.bookKey]?.sales || 0;
      return {
        ...b,
        sales,
        revenue: salesByBook[b.bookKey]?.revenue || 0,
        percentage: totalSales > 0 ? Math.round((sales / totalSales) * 100) : 0
      };
    });

    const topBooks = booksWithStats.sort((a, c) => (c.sales || 0) - (a.sales || 0));

    const recentTransactions = soldItems
      .slice(0, 10)
      .map((it) => ({ 
        id: it.id.slice(-6).toUpperCase(), 
        book: it.title, 
        amount: `${it.price.toFixed(2)} €`,
        date: it.order?.createdAt ? new Date(it.order.createdAt).toLocaleDateString('el-GR') : "-",
        format: "E-book"
      }));

    const uniqueBookKeys = Array.from(new Set(bookKeys.filter(Boolean)));
    let reviews = [];
    let questions = [];

    const bookKeyToTitle = {};
    books.forEach(b => { bookKeyToTitle[b.bookKey] = b.title; });

    if (uniqueBookKeys.length > 0) {
      const dbReviews = await prisma.review.findMany({
        where: { bookKey: { in: uniqueBookKeys } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      reviews = dbReviews.map(r => ({ ...r, bookTitle: bookKeyToTitle[r.bookKey] || "Άγνωστο" }));

      const dbQuestions = await prisma.question.findMany({
        where: { bookKey: { in: uniqueBookKeys } },
        include: { 
          user: { select: { name: true } },
          answers: true 
        },
        orderBy: { createdAt: "desc" },
      });
      questions = dbQuestions.map(q => ({ ...q, bookTitle: bookKeyToTitle[q.bookKey] || "Άγνωστο" }));
    }

    res.json({
      totalSales,
      totalEarnings,
      topBooks,
      recentTransactions,
      books: booksWithStats,
      reviews,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Αναζήτηση τοπικών βιβλίων συγγραφέων
app.get("/search/local", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get books for author by clerkId (Φιλτράρισμα με βάση το Όνομα)
app.get("/author/:clerkId/books", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const books = await prisma.book.findMany({ 
      where: { 
        author: { equals: user.name, mode: 'insensitive' } 
      }, 
      orderBy: { createdAt: "desc" } 
    });
    res.json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create a book (author determined by clerkId)
// Δημιουργία βιβλίου (επιτρέπει πλέον χειροκίνητο Συγγραφέα)
app.post("/books", async (req, res) => {
  try {
    const { clerkId, title, isbn, price, category, coverUrl, description, author } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const bookKey = `bk_${Date.now()}`;
    const book = await prisma.book.create({
      data: {
        bookKey,
        title,
        isbn,
        price: price ? Number(price) : undefined,
        category,
        coverUrl,
        description,
        // Αν ο admin/συγγραφέας έγραψε όνομα, βάζουμε αυτό, αλλιώς το fullName του προφίλ
        author: author ? author.trim() : (user.name || ""),
        authorId: user.id,
      },
    });

    res.json({ book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a book by bookKey
app.delete("/books/:bookKey", async (req, res) => {
  try {
    const { bookKey } = req.params;
    const { clerkId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const book = await prisma.book.findUnique({ where: { bookKey } });
    if (!book) return res.status(404).json({ error: "Book not found" });
    
    const isOwner = book.authorId === user.id || book.author.toLowerCase() === user.name.toLowerCase();
    if (!isOwner) return res.status(403).json({ error: "Not allowed" });

    await prisma.book.delete({ where: { bookKey } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a book (only author)
// Update a book
app.patch("/books/:bookKey", async (req, res) => {
  try {
    const { bookKey } = req.params;
    const { clerkId, title, isbn, price, category, coverUrl, description } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const book = await prisma.book.findUnique({ where: { bookKey } });
    if (!book) return res.status(404).json({ error: "Book not found" });
    
    // ΔΙΟΡΘΩΘΗΚΕ: Έλεγχος δικαιώματος με βάση ID ή Όνομα
    const isOwner = book.authorId === user.id || book.author.toLowerCase() === user.name.toLowerCase();
    if (!isOwner) return res.status(403).json({ error: "Not allowed" });

    const updated = await prisma.book.update({
      where: { bookKey },
      data: {
        title,
        isbn,
        price: price ? Number(price) : undefined,
        category,
        coverUrl,
        description,
      },
    });
    res.json({ book: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Post a review
app.post("/book/review", async (req, res) => {
  try {
    const { bookKey, rating, content, clerkId } = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const review = await prisma.review.create({
      data: { bookKey, rating, content, userId: user.id },
      include: { user: { select: { name: true } } },
    });

    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a question
app.post("/book/question", async (req, res) => {
  try {
    const { bookKey, content, clerkId } = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const question = await prisma.question.create({
      data: { bookKey, content, userId: user.id },
      include: { user: { select: { name: true } } },
    });

    res.json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//ADMIN PANEL ΛΕΙΤΟΥΡΓΙΕΣ

app.get("/admin/stats", async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count({ where: { status: "COMPLETED" } });
    
    const revenueData = await prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueData._sum.totalAmount || 0;

    // Υπολογισμός Best Sellers από τα order items των ολοκληρωμένων παραγγελιών
    const soldItems = await prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED" } }
    });

    const salesByBook = {};
    soldItems.forEach(item => {
      if (!salesByBook[item.bookKey]) {
        salesByBook[item.bookKey] = { title: item.title, sales: 0, revenue: 0 };
      }
      salesByBook[item.bookKey].sales += 1;
      salesByBook[item.bookKey].revenue += item.price;
    });

    const bestSellers = Object.values(salesByBook)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Τα κορυφαία 5 βιβλία

    res.json({
      success: true,
      totalUsers,
      totalOrders,
      totalRevenue,
      bestSellers
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: Λήψη όλων των βιβλίων ---
app.get("/admin/books", async (req, res) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: Διαγραφή οποιουδήποτε βιβλίου ---
app.delete("/admin/books/:bookKey", async (req, res) => {
  try {
    const { bookKey } = req.params;
    await prisma.book.delete({ where: { bookKey } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: Επεξεργασία οποιουδήποτε βιβλίου ---
app.patch("/admin/books/:bookKey", async (req, res) => {
  try {
    const { bookKey } = req.params;
    const { title, isbn, price, category, coverUrl, description } = req.body;
    
    const updated = await prisma.book.update({
      where: { bookKey },
      data: {
        title,
        isbn,
        price: price ? Number(price) : undefined,
        category,
        coverUrl,
        description,
      },
    });
    res.json({ book: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: Λήψη όλων των παραγγελιών του συστήματος ---
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/admin/comments", async (req, res) => {
  try {
    // Σχολιασμοί
    const reviews = await prisma.review.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Ερωτήσεις
    const questions = await prisma.question.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews, questions });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
});

// Διαγραφή Κριτικής (Review)
app.delete("/admin/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({
      where: { id: id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Σφάλμα διαγραφής review:", error);
    res.status(500).json({ error: error.message });
  }
});

// Διαγραφή Ερώτησης (Question)
app.delete("/admin/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({
      where: { id: id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Σφάλμα διαγραφής question:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
