
import express from "express";
import crypto from "crypto";

import {
  sha512,
  generatePaymentHash,
  verifyResponseHash,
  signPayment,
  verifyPaymentSignature,
} from "../utils/payu.js";

const router = express.Router();

const PAYU_KEY = process.env.PAYU_KEY;

const FRONTEND_URL = process.env.FRONTEND_URL;

const PAYU_PAYMENT_URL =
  process.env.PAYU_ENV === "production"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";

const PAYU_VERIFY_URL =
  process.env.PAYU_ENV === "production"
    ? "https://info.payu.in/merchant/postservice.php?form=2"
    : "https://test.payu.in/merchant/postservice.php?form=2";

// 1. Initiate payment
router.post("/initiate", async (req, res) => {
  try {
    const {
      planName,
      amount,
      userId,
      username,
      email,
      phone,
    } = req.body;

    if (
      !planName ||
      !userId ||
      !username ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        message: "Missing payment details",
      });
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    const formattedAmount = numericAmount.toFixed(2);

    const txnid =
      `CHARTR${Date.now()}${crypto.randomBytes(3).toString("hex")}`;

    const productinfo = `${planName} Plan`;

    const udf1 = userId;
    const udf2 = planName;

    const paymentData = {
      key: PAYU_KEY,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname: username,
      email,
      udf1,
      udf2,
      udf3: "",
      udf4: "",
      udf5: "",
    };

    const hash = generatePaymentHash(paymentData);

    const proof = signPayment({
      txnid,
      amount: formattedAmount,
      planName,
      userId,
      createdAt: Date.now(),
    });

    const params = {
      ...paymentData,
      phone,
      hash,

      surl: `${process.env.BACKEND_URL}/api/payu/callback`,
      furl: `${process.env.BACKEND_URL}/api/payu/callback`,
    };

    return res.json({
      action: PAYU_PAYMENT_URL,
      params,
      proof,
    });
  } catch (error) {
    console.error("PayU initiation error:", error);

    return res.status(500).json({
      message: "Unable to initiate payment",
    });
  }
});

// 2. PayU redirects here after payment

router.post("/callback", (req, res) => {
  try {
    const data = req.body;

    const validHash = verifyResponseHash(data);

    if (!validHash) {
      return res.redirect(
        `${FRONTEND_URL}/renew?payment=invalid`
      );
    }

    const status =
      data.status === "success" ? "success" : "failed";

    return res.redirect(
      `${FRONTEND_URL}/renew?payment=${status}&txnid=${encodeURIComponent(data.txnid)}`
    );

  } catch (error) {
    console.error("PayU callback error:", error);

    return res.redirect(
      `${FRONTEND_URL}/renew?payment=invalid`
    );
  }
});


// 3. Verify payment directly with PayU
router.post("/verify", async (req, res) => {
  try {
    const { txnid, proof } = req.body;

    const payment = verifyPaymentSignature(proof);

    if (!payment || payment.txnid !== txnid) {
      return res.status(400).json({
        message: "Invalid or expired payment proof",
      });
    }

    const verifyHash = sha512(
      `${PAYU_KEY}|verify_payment|${txnid}|${process.env.PAYU_SALT}`
    );

    const body = new URLSearchParams({
      key: PAYU_KEY,
      command: "verify_payment",
      var1: txnid,
      hash: verifyHash,
    });

    const response = await fetch(PAYU_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("PayU verification request failed");
    }

    const result = await response.json();

    const transaction =
      result.transaction_details?.[txnid];

    if (!transaction) {
      return res.status(404).json({
        status: "pending",
        message: "Transaction not found",
      });
    }

    const amountMatches =
      Number(transaction.amt).toFixed(2) === payment.amount;

    const isSuccessful =
      String(result.status) === "1" &&
      transaction.status === "success" &&
      amountMatches;

    if (!amountMatches) {
      return res.status(400).json({
        status: "invalid",
        message: "Transaction amount mismatch",
      });
    }

    return res.json({
      verified: isSuccessful,
      status: transaction.status,
      txnid,
      amount: payment.amount,
      planName: payment.planName,
      userId: payment.userId,
    });
  } catch (error) {
    console.error("PayU verification error:", error);

    return res.status(500).json({
      message: "Unable to verify payment",
    });
  }
});

export default router;
