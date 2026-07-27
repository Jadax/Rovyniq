import { ClamAvDaemonScanner, clamAvConfigFromEnvironment } from "./clamav-scanner.ts";
import { EncryptedS3ObjectStorage, objectStorageConfigFromEnvironment } from "./encrypted-storage.ts";
import { PostgresDocumentPersistence, PostgresTenantDatabase, postgresConfigFromEnvironment } from "./postgres.ts";
import { DocumentIngestionService } from "../../../packages/document-ingestion/src/service.ts";

export function ingestionRuntimeFromEnvironment(environment: NodeJS.ProcessEnv) {
  const database = postgresConfigFromEnvironment(environment); const storage = objectStorageConfigFromEnvironment(environment); const scanner = clamAvConfigFromEnvironment(environment);
  if (!database || !storage || !scanner) return null;
  const persistence = new PostgresDocumentPersistence(new PostgresTenantDatabase(database));
  const encryptedStorage = new EncryptedS3ObjectStorage(storage);
  return { service: new DocumentIngestionService({ storage: encryptedStorage, persistence, workspaces: persistence }), scanner: new ClamAvDaemonScanner(scanner), reader: encryptedStorage };
}
