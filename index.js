#!/usr/bin/env node
import fetch from "node-fetch"
import { spawn } from "child_process"

// ===== CONFIG =====
const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
const proxy = "https://auth.roproxy.com"
const birthday = "2000-01-01"

// ===== ARGS =====
const args = process.argv.slice(2)

if (args[0] !== "scan") {
  console.log(`
Usage:
  redux scan <length> <amount> [webhook]

Example:
  redux scan 5 100
`)
  process.exit(0)
}

const length = Number(args[1])
const amount = Number(args[2])
const webhook = args[3] || null

if (length < 3 || length > 20) {
  console.log("❌ Length must be 3–20")
  process.exit(1)
}

if (!amount || amount < 1) {
  console.log("❌ Amount must be a number")
  process.exit(1)
}

// ===== OPEN NEW WINDOW =====
if (!process.env.REDUX_CHILD) {
  spawn("cmd.exe", ["/k", `set REDUX_CHILD=1 && redux scan ${length} ${amount} ${webhook || ""}`], {
    detached: true,
    stdio: "ignore"
  })
  process.exit(0)
}

// ===== STATE =====
let scanned = 0
let found = 0

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
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `✅ AVAILABLE: **${username}**`
    })
  })
}

async function checkUsername(username) {
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
    console.log(`\n✅ HIT → ${username}`)
    await sendWebhook(username)
  }

  process.stdout.write(
    `\r🔍 ${scanned}/${amount} | ✅ Found: ${found}`
  )
}

// ===== MAIN =====
console.log(`🚀 Redux Scanner`)
console.log(`🔢 Length: ${length}`)
console.log(`🎯 Amount: ${amount}`)
console.log(`🔔 Webhook: ${webhook ? "ON" : "OFF"}\n`)

for (let i = 0; i < amount; i++) {
  await checkUsername(randomUsername(length))
  await new Promise(r => setTimeout(r, 700))
}

console.log(`\n\n🏁 Done`)
console.log(`📊 Scanned: ${scanned}`)
console.log(`✅ Found: ${found}`)
process.exit(0)
