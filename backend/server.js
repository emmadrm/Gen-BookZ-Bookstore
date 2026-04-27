import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { prisma } from "./db.js";

dotenv.config({ path: "./.env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());
app.use(cors());

app.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
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

// Delete user on sign out
app.delete("/users/delete", async (req, res) => {
  try {
    const { clerkId } = req.body;

    // Find the user first to get their email and id
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.json({ success: true }); // already gone

    // Find all orders for this user
    const orders = await prisma.order.findMany({
      where: { userEmail: user.email },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    // Delete in order: children first, then parents
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { userEmail: user.email } });
    await prisma.answer.deleteMany({ where: { userId: user.id } });
    await prisma.review.deleteMany({ where: { userId: user.id } });

    // Delete questions and their answers
    const questions = await prisma.question.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const questionIds = questions.map((q) => q.id);
    await prisma.answer.deleteMany({
      where: { questionId: { in: questionIds } },
    });
    await prisma.question.deleteMany({ where: { userId: user.id } });

    // Finally delete the user
    await prisma.user.delete({ where: { clerkId } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
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

app.listen(3000, () => console.log("Server running on port 3000"));
