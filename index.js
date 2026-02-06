#!/usr/bin/env node

// ===== IMPORTS =====
import fetch from "node-fetch"

// ===== CONFIG =====
const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
const proxy = "https://auth.roproxy.com"
const birthday = "2000-01-01"

// ===== STATE =====
let scanned = 0
let found = 0
let running = false

// ===== ARGS =====
const args = process.argv.slice(2)

if (args[0] !== "scan") {
  console.log(`
Usage:
  redux scan <length> [webhook]

Examples:
  redux scan 5
  redux scan 6 https://discord.com/api/webhooks/XXXX
`)
  process.exit(0)
}

let length = parseInt(args[1])
let webhook = args[2] || null

if (isNaN(length) || length < 3 || length > 20) {
  console.log("❌ Length must be between 3 and 20")
  process.exit(1)
}

// ===== UTILS =====
function randomUsername(len) {
  let name = ""
  for (let i = 0; i < len; i++) {
    name += chars[Math.floor(Math.random() * chars.length)]
  }
  return name
}

async function sendWebhook(username) {
  if (!webhook) return
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "✅ Username Available",
          description: `\`${username}\``,
          color: 65280,
          footer: { text: "ReduxThing Scanner" }
        }]
      })
    })
  } catch {}
}

async function checkUsername(username) {
  try {
    const res = await fetch(`${proxy}/v1/usernames/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        birthday,
        context: "Signup"
      })
    })

    const data = await res.json()
    scanned++

    if (data.code === 0) {
      found++
      console.log(`\n✅ AVAILABLE → ${username}`)
      await sendWebhook(username)
    }

    process.stdout.write(
      `\r🔍 Scanned: ${scanned} | ✅ Found: ${found}`
    )

  } catch {
    process.stdout.write(
      `\r⚠️ Error | Scanned: ${scanned} | Found: ${found}`
    )
  }
}

// ===== MAIN LOOP =====
async function start() {
  running = true
  scanned = 0
  found = 0

  console.log(`🚀 Redux Scanner Started`)
  console.log(`🔢 Length: ${length}`)
  console.log(`🔔 Webhook: ${webhook ? "ON" : "OFF"}\n`)

  while (running) {
    await checkUsername(randomUsername(length))
    await new Promise(r => setTimeout(r, 750))
  }
}

start()

// ===== CLEAN EXIT (FIXES RERUN ISSUE) =====
process.on("SIGINT", () => {
  running = false
  console.log("\n\n🛑 Scan stopped")
  console.log(`📊 Final → Scanned: ${scanned} | Found: ${found}`)
  process.exit(0)
})
