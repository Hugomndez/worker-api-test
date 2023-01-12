import { Router } from 'itty-router';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const router = Router();

//Define a simple data set for our API
const animals = [
  {
    id: 1,
    name: 'cow',
    type: 'mammal',
  },
  {
    id: 2,
    name: 'falcon',
    type: 'bird',
  },
  { id: 3, name: 'salmon', type: 'fish' },
];

// Register the route to return all the animals

router.get('/animals', req => {
  return new Response(JSON.stringify(animals));
});

// Register the  route to return an animal by ID
router.get('/animals/:id', req => {
  const { params, query } = req;

  let animal = animals.find(a => a.id === Number(params?.id));

  return new Response(JSON.stringify(animal));
});

// Return 404 for everything else
router.all('*', req => new Response('Not Found', { status: 404 }));
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await router.handle(request);
  },
};
