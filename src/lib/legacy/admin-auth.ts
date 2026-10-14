import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { connectLegacyDB } from "./connection";
import { getLegacyModels, toLegacyId, type LegacyAdmin } from "./models";

function normalizeAdminEmail(email: string): string {
  const trimmed = email.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return `${trimmed.toLowerCase()}@dmxlogistics.com.ng`;
}

function tokenSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.LEGACY_JWT_SECRET ??
      process.env.NEXTAUTH_SECRET ??
      process.env.JWT_SECRET ??
      "dmx-legacy-local-secret",
  );
}

export interface LegacyAdminSession {
  admin: {
    id: string;
    email: string;
    name: string;
    roleGroup: string;
    branchId: string | null;
    status: string;
  };
  accessToken: string;
}

export async function verifyLegacyAdminCredentials(
  email: string,
  password: string,
): Promise<LegacyAdminSession | null> {
  const conn = await connectLegacyDB();
  if (!conn) {
    throw new Error("LEGACY_MONGO_URI is not configured");
  }

  const { Admin } = getLegacyModels(conn);
  const EmailAddress = normalizeAdminEmail(email);
  const admin = await Admin.findOne({ EmailAddress }).lean<LegacyAdmin | null>();

  if (!admin?.Password) return null;

  const passwordValid = await compare(password, admin.Password);
  if (!passwordValid) return null;

  const id = toLegacyId(admin._id);
  if (!id) return null;

  const accessToken = await new SignJWT({
    legacyAdminId: id,
    email: admin.EmailAddress,
    roleGroup: admin.RoleGroup ?? "Admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(tokenSecret());

  return {
    accessToken,
    admin: {
      id,
      email: admin.EmailAddress,
      name: admin.Name ?? admin.EmailAddress,
      roleGroup: admin.RoleGroup ?? "Admin",
      branchId: toLegacyId(admin.Branch),
      status: admin.Status ?? "ACTIVE",
    },
  };
}

