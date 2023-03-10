/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Import request using an alias to avoid collisions with Cloudflare's implementation of Request in the fetch method
import { Router, IRequest } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const ANIMALS_KV_KEY_ID = 'all-animals';

// Register the route to return all the animals

router.get('/animals', async (req: IRequest, env: Env) => {
  let animals = await getAllAnimals(env);

  return new Response(JSON.stringify(animals));
});

// Register the  route to return an animal by ID
router.get('/animals/:id', async (req: IRequest, env: Env) => {
  let animals = await getAllAnimals(env);

  let animal = animals.find(({ id }) => id === req.params?.id);

  return new Response(JSON.stringify(animal));
});

// Register the route to create an animal
router.post('/animals', async (req: IRequest, env: Env) => {
  let content = await req.json?.();

  if (content == undefined) {
    return new Response('Please provide a body');
  }

  content['id'] = uuidv4();

  let animal = await addAnimal(content, env);

  return new Response(JSON.stringify(animal));
});

// Register the route to delete an animal
router.delete('/animals/:id', async (req: IRequest, env: Env) => {
  let animals = await getAllAnimals(env);

  let newAnimals = animals.filter(({ id }) => id !== req.params?.id);

  await updateAnimals(newAnimals, env);

  return new Response(JSON.stringify(newAnimals));
});

// Return 404 for everything else
router.all('*', req => new Response('Not Found', { status: 404 }));

export async function getAllAnimals(env: Env): Promise<any[]> {
  let animals = await env.ANIMALS.get(ANIMALS_KV_KEY_ID);

  if (animals === null) {
    return [];
  }

  return JSON.parse(animals);
}

export async function updateAnimals(animals: any[], env: Env) {
  await env.ANIMALS.put(ANIMALS_KV_KEY_ID, JSON.stringify(animals));
}

export async function addAnimal(animal: Object, env: Env) {
  let animals = await getAllAnimals(env);

  animals.push(animal);

  await updateAnimals(animals, env);

  return animal;
}
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  //This will be auto-populated with the KV Namespace that is bound in the wrangler.toml
  //and exposes all the methods you'll need (get, put, list etc.)
  // MY_KV_NAMESPACE: KVNamespace;
  ANIMALS: KVNamespace;

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
    return await router.handle(request, env);
  },
};
