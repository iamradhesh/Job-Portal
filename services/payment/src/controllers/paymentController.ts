import { error } from "console";
import { instance } from "../index.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import crypto from "crypto"


export const checkOut = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new ErrorHandler(401, "Unauthorized");
  }

  const user_id = req.user.user_id;

  const [user] = await sql`
    SELECT subscription FROM users WHERE user_id = ${user_id}
  `;

  if (
    user?.subscription &&
    new Date(user.subscription).getTime() > Date.now()
  ) {
    throw new ErrorHandler(400, "You already have an active subscription");
  }

  const AMOUNT = 119 * 100; // ₹119 in paise

  const options = {
    amount: AMOUNT,
    currency: "INR",
    receipt: `sub_${user_id}_${Date.now()}`,
    notes: {
      user_id: user_id.toString(),
      purpose: "subscription",
    },
  };

  const order = await instance.orders.create(options);

  // ✅ Store order in DB immediately
  await sql`
    INSERT INTO payments 
      (user_id, razorpay_order_id, amount, currency, status)
    VALUES 
      (${user_id}, ${order.id}, ${AMOUNT}, 'INR', 'created')
  `;

  res.status(201).json({ order });
});



export const paymentVerification = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      throw new ErrorHandler(401, "Unauthorized");
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ErrorHandler(400, "Missing payment details");
    }

    // ✅ Lock payment row (prevents double processing)
    const [payment] = await sql`
      SELECT * FROM payments 
      WHERE razorpay_order_id = ${razorpay_order_id}
      FOR UPDATE
    `;

    if (!payment) {
      throw new ErrorHandler(404, "Payment record not found");
    }

    if (payment.status === "paid") {
      throw new ErrorHandler(400, "Payment already processed");
    }

    // ✅ Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET as string)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await sql`
        UPDATE payments 
        SET status = 'failed' 
        WHERE razorpay_order_id = ${razorpay_order_id}
      `;
      throw new ErrorHandler(400, "Payment verification failed");
    }

    // ✅ Fetch current subscription
    const [user] = await sql`
      SELECT subscription FROM users 
      WHERE user_id = ${req.user.user_id}
    `;

    const baseTime =
      user?.subscription && new Date(user.subscription).getTime() > Date.now()
        ? new Date(user.subscription).getTime()
        : Date.now();

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(baseTime + THIRTY_DAYS);

    // ✅ Update payment
    await sql`
      UPDATE payments
      SET 
        razorpay_payment_id = ${razorpay_payment_id},
        razorpay_signature = ${razorpay_signature},
        status = 'paid',
        subscription_expiry = ${expiryDate},
        updated_at = NOW()
      WHERE razorpay_order_id = ${razorpay_order_id}
    `;

    // ✅ Update user
   const updatedUser = await sql`
      UPDATE users
      SET subscription = ${expiryDate}
      WHERE user_id = ${req.user.user_id}
    `;

    res.status(200).json({
      message: "Subscription activated successfully",
      expiryDate,
      updatedUser
    });
  }
);

