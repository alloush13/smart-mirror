import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

export function loadProto(protoPath: string) {
  const packageDef = protoLoader.loadSync(
    path.join(process.cwd(), protoPath),
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
    },
  );

  return grpc.loadPackageDefinition(packageDef) as any;
}