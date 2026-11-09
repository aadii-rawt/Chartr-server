
import crypto from "crypto";

export const sha512 = (value) =>
  crypto.createHash("sha512").update(value).digest("hex");

// Generate PayU checkout hash
export const generatePaymentHash = (data) => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = data;

  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
  ].join("|") + `||||||${process.env.PAYU_SALT}`;

  return sha512(hashString);
};

// Verify PayU response hash
export const verifyResponseHash = (data) => {
  const {
    status,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
    hash,
    additionalCharges,
    additional_charges,
    splitInfo,
  } = data;

  const extraCharges = additionalCharges || additional_charges;

  const hashString = [
    ...(extraCharges ? [extraCharges] : []),
    process.env.PAYU_SALT,
    status,
    splitInfo || "",
    "",
    "",
    "",
    "",
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join("|");

  const calculatedHash = sha512(hashString);

  if (!hash || !/^[a-f0-9]{128}$/i.test(hash)) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, "hex"),
    Buffer.from(hash, "hex")
  );
};

// Sign payment details so they cannot be modified
export const signPayment = (payload) => {
  const encoded = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", process.env.PAYMENT_SIGNING_SECRET)
    .update(encoded)
    .digest("hex");

  return `${encoded}.${signature}`;
};

export const verifyPaymentSignature = (token) => {
  const [encoded, signature] = (token || "").split(".");

  if (!encoded || !signature) return null;

  const expected = crypto
    .createHmac("sha256", process.env.PAYMENT_SIGNING_SECRET)
    .update(encoded)
    .digest();

  let received;

  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return null;
  }

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString()
    );

    // Payment initiation expires after 30 minutes.
    if (Date.now() - payload.createdAt > 30 * 60 * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
