import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Read Env vars manually so we don't need 'dotenv'
let envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve('.env');
}

if (!fs.existsSync(envPath)) {
  console.error("Cannot find .env or .env.local file. Please run this script from the root goMed folder.");
  process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.");
  process.exit(1);
}

// 2. Configuration
const NUM_LOBBIES = 5;
const BOTS_PER_LOBBY = 20;

console.log(`\nStarting Load Test`);
console.log(`----------------------------------------`);
console.log(`Lobbies: ${NUM_LOBBIES}`);
console.log(`Bots per Lobby: ${BOTS_PER_LOBBY}`);
console.log(`Total Connections: ${NUM_LOBBIES * BOTS_PER_LOBBY}`);
console.log(`----------------------------------------\n`);

let totalAnswersExpected = NUM_LOBBIES * (BOTS_PER_LOBBY - 1);
let totalAnswersReceived = 0;
let latencies = [];

// Fallback for older Node versions without native WebSocket
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    const ws = await import('ws');
    globalThis.WebSocket = ws.default || ws;
  } catch (e) {
    console.error("Your Node version doesn't have native WebSockets.");
    console.error("Please run: npm install ws");
    process.exit(1);
  }
}

async function runLobby(lobbyIndex) {
  const lobbyId = `test_lobby_${lobbyIndex}_${Date.now()}`; // Unique lobby ID
  const clients = [];

  // Create client instances for this lobby
  for (let i = 0; i < BOTS_PER_LOBBY; i++) {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    clients.push(client);
  }

  let channels = [];
  
  return new Promise((resolve) => {
      let connectionsEstablished = 0;

      clients.forEach((client, idx) => {
        const isHost = idx === 0; // Bot 1 is the Host
        const channel = client.channel(lobbyId, {
            config: { broadcast: { self: false } }
        });

        if (isHost) {
            // The Host listens for answers from the 19 students
            channel.on('broadcast', { event: 'ANSWER' }, (payload) => {
                const receiveTime = Date.now();
                const sendTime = payload.payload.sendTime;
                const latency = receiveTime - sendTime;
                
                latencies.push(latency);
                totalAnswersReceived++;

                // If this is the absolute last answer expected across ALL lobbies
                if (totalAnswersReceived === totalAnswersExpected) {
                    console.log(`\nLoad Test Complete! All ${totalAnswersExpected} answers received.`);
                    const avg = latencies.reduce((a,b)=>a+b,0) / latencies.length;
                    const max = Math.max(...latencies);
                    const min = Math.min(...latencies);
                    
                    console.log(`\nRESULTS:`);
                    console.log(`Total Concurrent Connections: ${NUM_LOBBIES * BOTS_PER_LOBBY}`);
                    console.log(`Average Propagation Latency:  ${avg.toFixed(2)} ms`);
                    console.log(`Slowest Answer Received In:   ${max} ms`);
                    console.log(`Fastest Answer Received In:   ${min} ms\n`);
                    process.exit(0);
                }
            });
        } else {
            // The Students wait for the START_QUESTION signal from the Host
            channel.on('broadcast', { event: 'START_QUESTION' }, () => {
                // Instantly simulate tapping the answer button
                channel.send({
                    type: 'broadcast',
                    event: 'ANSWER',
                    payload: { sendTime: Date.now() }
                });
            });
        }

        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                connectionsEstablished++;
                // Once everyone in this specific lobby is connected, resolve this lobby's promise
                if (connectionsEstablished === BOTS_PER_LOBBY) {
                    process.stdout.write(`Lobby ${lobbyIndex} ready (${BOTS_PER_LOBBY}/20 bots)\n`);
                    resolve({ hostChannel: channels[0] });
                }
            }
        });

        channels.push(channel);
      });
  });
}

async function main() {
    console.log("Connecting bots to Supabase Realtime (this might take a few seconds)...\n");
    
    // Setup all 5 lobbies simultaneously
    const lobbyPromises = [];
    for(let i=1; i<=NUM_LOBBIES; i++) {
        lobbyPromises.push(runLobby(i));
    }

    const hostData = await Promise.all(lobbyPromises);
    console.log(`\nAll ${NUM_LOBBIES * BOTS_PER_LOBBY} bots successfully connected!`);
    console.log("3... 2... 1... Firing Simultaneous Quizzes!\n");
    
    // Buffer to ensure all connections are completely stabilized
    await new Promise(r => setTimeout(r, 1500));

    // Command all 5 Hosts to broadcast START_QUESTION at the exact same millisecond
    hostData.forEach(({ hostChannel }) => {
        hostChannel.send({
            type: 'broadcast',
            event: 'START_QUESTION',
            payload: { timestamp: Date.now() }
        });
    });
}

main();
