import * as grpc from '@grpc/grpc-js'
import { createGrpcServer } from './server'
import { ArrayNewsRepository } from './repositories/ArrayNewsRepository'
import { RedisNewsRepository } from './repositories/RedisNewsRepository'

const PORT = process.env.PORT || '50051'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const repository = REDIS_URL
  ? new RedisNewsRepository(REDIS_URL)
  : new ArrayNewsRepository()

const server = createGrpcServer(repository)

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`MI8 gRPC server running on port ${port}`)
  }
)
