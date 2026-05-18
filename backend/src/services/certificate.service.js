import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import { Certificate } from "../models/Certificate.js";
import { config } from "../config/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { logActivity } from "./activity.service.js";

fs.mkdirSync(config.generatedDir, { recursive: true });

export async function issueCertificate({ proof, user }) {
  const existing = await Certificate.findOne({ proofId: proof._id });
  if (existing) return existing;

  const certificateNumber = `CP-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  const fileName = `${certificateNumber}.pdf`;
  const filePath = path.join(config.generatedDir, fileName);

  await generatePdf({
    filePath,
    certificateNumber,
    proof,
    user,
  });

  const certificate = await Certificate.create({
    proofId: proof._id,
    userId: user._id,
    certificateNumber,
    filePath,
  });

  await logActivity({
    userId: user._id,
    action: "certificate_issued",
    resourceType: "certificate",
    resourceId: certificate._id,
    metadata: { certificateNumber, proofId: proof._id },
  });

  return certificate;
}

function generatePdf({ filePath, certificateNumber, proof, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const primaryColor = "#0A2540"; // Deep Navy
    const accentColor = "#D4AF37"; // Gold/Bronze
    const textColor = "#333333";
    const lightText = "#666666";

    // Draw Outer and Inner Borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke(primaryColor);
    
    doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
       .lineWidth(1)
       .stroke(accentColor);

    // Top Logo (Vector Seal)
    const centerX = doc.page.width / 2;
    doc.circle(centerX, 100, 35).lineWidth(2).stroke(primaryColor);
    doc.circle(centerX, 100, 30).lineWidth(1).stroke(accentColor);
    doc.font("Helvetica-Bold").fontSize(28).fillColor(primaryColor).text("CP", centerX - 25, 87, { width: 50, align: "center" });

    // Certificate Header
    doc.font("Times-Bold").fontSize(28).fillColor(primaryColor).text("CERTIFICATE OF REGISTRATION", 0, 160, { align: "center" });
    doc.fontSize(16).fillColor(accentColor).text("Intellectual Property Rights (IPR)", 0, 195, { align: "center" });

    // Attestation Text
    doc.font("Times-Italic").fontSize(14).fillColor(textColor).text(
      "This document formally certifies the registration of the intellectual property described below on the decentralized ledger.", 
      100, 240, 
      { align: "center", width: doc.page.width - 200 }
    );

    // Decorative Divider
    doc.moveTo(100, 300).lineTo(doc.page.width - 100, 300).lineWidth(1).stroke(accentColor);

    // Registration Details
    let startY = 340;
    const addRow = (label, value, font = "Helvetica") => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text(label, 90, startY);
      doc.font(font).fontSize(11).fillColor(textColor).text(value, 260, startY, { width: 245, breakWord: true });
      const height = doc.heightOfString(value, { width: 245, font: font, fontSize: 11 });
      startY += Math.max(height, 14) + 20;
    };

    addRow("Certificate Number:", certificateNumber);
    addRow("Date of Registration:", new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    addRow("Registered Owner:", `${user.name} (${user.email})`);
    addRow("Title of Work:", proof.title);
    addRow("File Name:", proof.fileName);
    addRow("Cryptographic Hash (SHA-256):", proof.contentHash, "Courier");
    addRow("IPFS Content Identifier (CID):", proof.ipfsCid, "Courier");
    if (proof.blockchainTxHash) {
      addRow("Blockchain Transaction Hash:", proof.blockchainTxHash, "Courier");
    }

    // Bottom Divider
    startY += 10;
    doc.moveTo(100, startY).lineTo(doc.page.width - 100, startY).lineWidth(1).stroke(accentColor);
    
    startY += 30;
    
    // Footer / Seal of Authenticity
    doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("ChainProof AI Validation", 90, startY);
    doc.font("Helvetica").fontSize(9).fillColor(lightText).text(
      "This is a digitally generated certificate anchored to decentralized storage. It attests that the specified hash was registered at the stated time. Verify authenticity at chainproof.ai", 
      90, startY + 15, { width: 250 }
    );

    // Bottom Right Vector Seal
    const sealX = doc.page.width - 130;
    const sealY = startY + 25;
    doc.circle(sealX, sealY, 30).lineWidth(2).stroke(accentColor);
    doc.circle(sealX, sealY, 25).lineWidth(1).stroke(primaryColor);
    doc.font("Times-Bold").fontSize(9).fillColor(primaryColor).text("VERIFIED", sealX - 25, sealY - 12, { width: 50, align: "center" });
    doc.font("Times-Roman").fontSize(7).text("SECURE", sealX - 25, sealY + 2, { width: 50, align: "center" });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

export async function getCertificateForUser(certificateId, userId) {
  const cert = await Certificate.findOne({ _id: certificateId, userId });
  if (!cert) throw new AppError("Certificate not found", 404);
  return cert;
}
