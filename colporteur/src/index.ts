import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

const PROTO_PATH = path.join(__dirname, '..', '..', 'mi8', 'proto', 'news.proto')
const MI8_ADDRESS = process.env.MI8_ADDRESS || 'localhost:50051'

const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false })
const proto = grpc.loadPackageDefinition(packageDef) as any
const client = new proto.mi8.NewsService(MI8_ADDRESS, grpc.credentials.createInsecure())

const sampleNews = [
  {
    name: 'Berlin Innovation Hub Opens New Campus',
    source: 'Tech Weekly',
    date: new Date().toISOString(),
    tags: ['innovation'],
    city: 'Berlin',
    country: 'Germany',
  },
  {
    name: 'Paris Cultural Festival Draws Record Crowds',
    source: 'Le Monde',
    date: new Date().toISOString(),
    tags: ['culture', 'entertainment'],
    city: 'Paris',
    country: 'France',
  },
  {
    name: 'Tokyo Healthcare Breakthrough in Cancer Research',
    source: 'Japan Times',
    date: new Date().toISOString(),
    tags: ['healthcare', 'innovation'],
    city: 'Tokyo',
    country: 'Japan',
  },
  {
    name: 'Crime Rate Drops in Berlin City Center',
    source: 'Berlin Daily',
    date: new Date().toISOString(),
    tags: ['crime'],
    city: 'Berlin',
    country: 'Germany',
  },
  {
    name: 'Paris Hosts International Music Festival',
    source: 'France Info',
    date: new Date().toISOString(),
    tags: ['culture', 'entertainment'],
    city: 'Paris',
    country: 'France',
  },
]

function createNews(news: (typeof sampleNews)[0]): Promise<void> {
  return new Promise((resolve, reject) => {
    client.createNews(news, (err: Error | null, response: any) => {
      if (err) {
        reject(err)
        return
      }
      console.log(`Created news: "${response.news.name}" in ${response.news.city}`)
      resolve()
    })
  })
}

async function main() {
  console.log(`Connecting to MI8 at ${MI8_ADDRESS}...`)

  for (const news of sampleNews) {
    await createNews(news)
  }

  console.log('All news sent to MI8.')
  client.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
