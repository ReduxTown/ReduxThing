#!/usr/bin/env node

// ===== CONFIG =====
let scanned = 0
let found = 0
let running = true

const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
const proxy = "https://auth.roproxy.com"
const birthday = "2000-01-01"

// ===== IMPORTS =====
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

// ===== UTIL =====
function randomUsername(length = 5) {
  let name = ""
  for (let i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random() * chars.length)]
  }
  return name
}

async function checkUsername(username) {
  try {
    const res = await fetch(`${proxy}/v1/usernames/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
      console.log(`✅ AVAILABLE → ${username}`)
    } else {
      console.log(`❌ TAKEN → ${username}`)
    }

  } catch (err) {
    console.log("⚠️ Error:", err.message)
  }
}

// ===== LOOP =====
async function startScan() {
  console.log("🚀 ReduxThing Username Scanner Started\n")

  while (running) {
    const user = randomUsername(5)
    await checkUsername(user)

    process.stdout.write(
      `\r🔍 Scanned: ${scanned} | ✅ Found: ${found}`
    )

    await new Promise(r => setTimeout(r, 800)) // rate limit
  }
}

startScan()

// ===== CTRL+C HANDLER =====
process.on("SIGINT", () => {
  running = false
  console.log("\n\n🛑 Scan stopped")
  console.log(`📊 Final → Scanned: ${scanned} | Found: ${found}`)
  process.exit()
})
