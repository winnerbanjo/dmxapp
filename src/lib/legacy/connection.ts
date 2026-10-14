import mongoose, { type Connection } from "mongoose";
import dns from "dns";

const LEGACY_MONGO_URI =
  process.env.MONGO_URI ||
  process.env.LEGACY_MONGO_URI ||
  process.env.MONGODB_URI;

function getDirectReplicaSetUri(srvUri?: string): string | null {
  if (!srvUri) return null;
  const match = srvUri.match(/mongodb\+srv:\/\/([^@]+)@/);
  if (!match) return null;
  const auth = match[1];
  return `mongodb://${auth}@ac-abtqvub-shard-00-00.o3vlztg.mongodb.net:27017,ac-abtqvub-shard-00-01.o3vlztg.mongodb.net:27017,ac-abtqvub-shard-00-02.o3vlztg.mongodb.net:27017/DMX-Logistics?ssl=true&replicaSet=atlas-132tv6-shard-0&authSource=admin`;
}

const resolver = new dns.Resolver();
try {
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignored if not permitted
}

function customLookup(
  hostname: string,
  options: unknown,
  callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
) {
  const cb = typeof options === "function" ? options : callback;
  const opts =
    typeof options === "object" && options !== null
      ? (options as { all?: boolean })
      : {};

  resolver.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      if (opts.all) {
        return cb(
          null,
          addresses.map((a) => ({ address: a, family: 4 }))
        );
      }
      return cb(null, addresses[0], 4);
    }
    dns.lookup(hostname, options as any, cb as any);
  });
}

interface LegacyMongooseCache {
  conn: Connection | null;
  promise: Promise<Connection | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var legacyMongoose: LegacyMongooseCache | undefined;
}

const cached: LegacyMongooseCache =
  global.legacyMongoose ?? { conn: null, promise: null };

if (!global.legacyMongoose) {
  global.legacyMongoose = cached;
}

async function tryConnect(uri: string, useLookup = false): Promise<Connection> {
  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 8_000,
    bufferCommands: false,
    ...(useLookup ? { lookup: customLookup as any } : {}),
  };
  return mongoose.createConnection(uri, options).asPromise();
}

export async function connectLegacyDB(): Promise<Connection | null> {
  if (cached.conn && cached.conn.readyState === 1) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. Try primary configured URI
      if (LEGACY_MONGO_URI) {
        try {
          return await tryConnect(LEGACY_MONGO_URI);
        } catch (srvErr) {
          console.warn("[LegacyDB] Primary URI failed, trying custom DNS lookup:", srvErr);
          try {
            return await tryConnect(LEGACY_MONGO_URI, true);
          } catch (dnsErr) {
            console.warn("[LegacyDB] Custom DNS lookup failed, falling back to direct replica set:", dnsErr);
          }
        }
      }

      // 2. Direct replica set fallback
      const directUri = getDirectReplicaSetUri(LEGACY_MONGO_URI);
      if (directUri) {
        try {
          return await tryConnect(directUri, true);
        } catch (directErr) {
          console.error("[LegacyDB] Direct replica set connection failed:", directErr);
          throw directErr;
        }
      }
      throw new Error("Unable to establish legacy database connection");
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
