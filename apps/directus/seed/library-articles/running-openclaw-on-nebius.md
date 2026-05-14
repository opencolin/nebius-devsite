# Running OpenClaw on Nebius
## 30-Minute Workshop Presentation

**Event:** ClawCamp Workshop Series
**Duration:** 30 minutes (15 min presentation + 15 min hands-on)
**Level:** Beginner
**Prerequisites:** Laptop with browser, Nebius account (free trial), Node.js 18+

---

## SLIDE 1: Title

**Running OpenClaw on Nebius**
From zero to a live AI agent in 15 minutes

ClawCamp Workshop
claw.camp/curriculum/agent-inference

---

## SLIDE 2: The Problem

**Running AI agents is expensive and complicated**

- A Mac Mini for local inference: $1,000+
- Exposes your home network
- Runs ONE agent at a time
- No scaling, no redundancy, no sleep

**What if you could run 100 agents for the cost of one Mac Mini?**

---

## SLIDE 3: Liberate Your OpenClaw

**You don't need to use Claude or OpenAI.**

OpenClaw works with ANY OpenAI-compatible model provider. Today we'll use **Nebius Token Factory** — open-source models, pay-per-token, no GPU reservation.

| Provider | Models | Pricing |
|----------|--------|---------|
| **Nebius Token Factory** | Kimi K2.5, Llama 3.3 70B, DeepSeek-R1, Qwen3, GLM-5 | Pay per token |
| Hugging Face | GLM-5, thousands more | $2/mo free credits |
| Local (llama.cpp) | Any GGUF model | Free (your hardware) |

**Today's focus: Token Factory. Fast, cheap, production-ready.**

---

## SLIDE 4: The Architecture

**Orchestration and inference are separate.**

```
Your Agent (OpenClaw)          Token Factory (Nebius)
┌─────────────────────┐       ┌─────────────────────┐
│  Agent logic (CPU)  │──────▶│  Model inference     │
│  Tool calling       │  API  │  (GPU)               │
│  WebSocket gateway  │◀──────│  Llama / GLM / Qwen  │
└─────────────────────┘       └─────────────────────┘
     Runs anywhere               Pay per token
     $0.01/hr                    No GPU needed
```

Your agent runs on cheap CPU. The expensive GPU work goes through Token Factory's API.

---

## SLIDE 5: Three Ways to Deploy

| Method | Time | Best For |
|--------|------|----------|
| **npm install** | 5 min | Local dev, fastest start |
| **Docker** | 10 min | Isolated, repeatable, server deploys |
| **Nebius Serverless** | 20 min | Production, auto-scaling, zero-ops |

**We'll start with npm (fastest), then show Docker and Serverless.**

---

## SLIDE 6: Step 1 — Get Your Token Factory API Key (2 min)

1. Go to **console.nebius.com**
2. Navigate to **Token Factory** in the sidebar
3. Click **Create API Key**
4. Copy the key

Set it in your terminal:
```bash
export NEBIUS_API_KEY="your-key-here"
```

To persist across sessions, add it to your shell profile:
```bash
echo 'export NEBIUS_API_KEY="your-key-here"' >> ~/.zshrc  # macOS
echo 'export NEBIUS_API_KEY="your-key-here"' >> ~/.bashrc  # Linux
```

**This key gives you access to models including Kimi K2.5, Llama 3.3 70B, DeepSeek-R1, and Qwen3. Never commit this key to git.**

---

## SLIDE 7: Step 2 — Install OpenClaw (1 min)

```bash
npm install -g @openclaw/cli
```

Verify:
```bash
openclaw --version
```

That's it. No Docker, no containers, no VMs (yet).

---

## SLIDE 8: Step 3 — Connect to Token Factory (2 min)

**Option A: Quick onboard (CLI)**

```bash
openclaw onboard --non-interactive \
  --auth-choice custom-api-key \
  --custom-base-url "https://api.tokenfactory.nebius.com/v1/" \
  --custom-model-id "meta-llama/Llama-3.3-70B-Instruct-fast" \
  --custom-api-key "$NEBIUS_API_KEY" \
  --secret-input-mode plaintext \
  --custom-compatibility openai
```

**Option B: Config file (recommended for production)**

Edit `~/.openclaw/openclaw.json`:

```json5
{
  models: {
    mode: "merge",
    providers: {
      nebius: {
        baseUrl: "https://api.tokenfactory.nebius.com/v1/",
        apiKey: "${NEBIUS_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "moonshotai/Kimi-K2.5",
            name: "Kimi K2.5",
            contextWindow: 128000,
            maxTokens: 32000
          },
          {
            id: "meta-llama/Llama-3.3-70B-Instruct-fast",
            name: "Llama 3.3 70B",
            contextWindow: 128000,
            maxTokens: 32000
          },
          {
            id: "deepseek-ai/DeepSeek-R1-0528",
            name: "DeepSeek R1",
            reasoning: true,
            contextWindow: 128000,
            maxTokens: 32000
          }
        ]
      }
    }
  },
  agents: {
    defaults: {
      model: { primary: "nebius/moonshotai/Kimi-K2.5" },
      models: {
        "nebius/moonshotai/Kimi-K2.5": { alias: "kimi" },
        "nebius/meta-llama/Llama-3.3-70B-Instruct-fast": { alias: "llama70b" },
        "nebius/deepseek-ai/DeepSeek-R1-0528": { alias: "deepseek" }
      }
    }
  }
}
```

**Key details:**
- `mode: "merge"` keeps built-in providers while adding Nebius
- `apiKey: "${NEBIUS_API_KEY}"` reads from your environment variable
- `api: "openai-completions"` — Token Factory is OpenAI-compatible
- Model aliases let you switch fast: `/model kimi` or `/model llama70b`

---

## SLIDE 9: Step 4 — Start and Verify (1 min)

Start the gateway:
```bash
openclaw start
```

Open your browser: **`http://localhost:18789`**

Verify models are loaded:
```
/models        # List all available models
/model kimi    # Switch to Kimi K2.5
/status        # Check current model and connection
```

Test the connection directly:
```bash
curl -H "Authorization: Bearer $NEBIUS_API_KEY" \
  https://api.tokenfactory.nebius.com/v1/models
```

Your agent is live. Connected to Kimi K2.5 on Nebius. No GPU on your machine.

---

## SLIDE 10: Model Selection

Pick the right model for your use case:

| Model | ID | Speed | Best For |
|-------|----|-------|----------|
| **Llama 3.3 70B** | `meta-llama/Llama-3.3-70B-Instruct-fast` | Fast | General agents, tool calling |
| **Kimi K2.5** | `moonshotai/Kimi-K2.5` | Fast | Great all-rounder, recommended |
| **DeepSeek-R1** | `deepseek-ai/DeepSeek-R1-0528` | Medium | Reasoning, complex chains |
| **GLM-5** | `zai-org/GLM-5` | Very Fast | High throughput, simple tasks |
| **Qwen3** | `Qwen/Qwen3-30B-A3B` | Fast | Code generation, multilingual |

Switch models anytime:
```bash
openclaw config set agents.defaults.model.primary "moonshotai/Kimi-K2.5"
```

---

## SLIDE 11: Is Docker Right for Me?

**Use Docker when:**
- You want an isolated, throwaway environment
- You're deploying to a server
- You need repeatable builds

**Skip Docker when:**
- You want the fastest local dev cycle
- You're just prototyping

### Docker Quick Start

```bash
# Clone and build
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Automated setup (handles everything)
export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
./scripts/docker/setup.sh
```

Or manual:
```bash
docker build -t openclaw:local -f Dockerfile .
docker compose up -d openclaw-gateway
```

Access at `http://127.0.0.1:18789/`

Health check:
```bash
curl -fsS http://127.0.0.1:18789/healthz
curl -fsS http://127.0.0.1:18789/readyz
```

---

## SLIDE 12: Docker + Token Factory

Connect your Docker container to Nebius. Two options:

**Option A: Mount your config file**
If you already have `~/.openclaw/openclaw.json` configured (from Slide 8), Docker picks it up automatically via the volume mount.

**Option B: Onboard inside the container**
```bash
docker compose run --rm --no-deps --entrypoint node \
  openclaw-gateway dist/index.js onboard \
  --auth-choice custom-api-key \
  --custom-base-url "https://api.tokenfactory.nebius.com/v1/" \
  --custom-model-id "meta-llama/Llama-3.3-70B-Instruct-fast" \
  --custom-api-key "$NEBIUS_API_KEY" \
  --custom-compatibility openai
```

**Your agent runs in Docker. Inference runs on Nebius GPUs. Best of both worlds.**

---

## SLIDE 13: Structured Tool Calling

The real power: **JSON mode for reliable tool calling.**

```json
{
  "tool": "get_weather",
  "arguments": {
    "city": "Oakland",
    "units": "fahrenheit"
  }
}
```

Token Factory supports JSON mode natively — no prompt engineering hacks.

Works with Kimi K2.5, Llama 3.3, and DeepSeek-R1.

---

## SLIDE 14: Going to Production (Nebius Serverless)

When you're ready to deploy for real:

```bash
# Install Nebius CLI
curl -sSL https://storage.ai.nebius.cloud/ncp/install.sh | bash

# Deploy OpenClaw on Serverless
nebius msp serverless v1alpha1 endpoint create \
  --name openclaw-agent \
  --image openclaw/gateway:latest \
  --memory 512MB
```

**Auto-scales to zero when idle. Spins up on demand. No VM management.**

---

## SLIDE 15: Cost Breakdown

| Usage | Tokens/day | Cost/day | Cost/month |
|-------|-----------|----------|------------|
| Light (100 msgs) | ~500K | $0.15 | $4.50 |
| Medium (1K msgs) | ~5M | $1.50 | $45 |
| Heavy (10K msgs) | ~50M | $15 | $450 |

Compare: A single H100 GPU = **$2-3/hour** = **$1,500-2,200/month**

**Token Factory: pay per token, not per hour.**

---

## SLIDE 16: Security Checklist

Before going live:

- [ ] Set a gateway token (auth for all connections)
- [ ] Bind to loopback in dev, 0.0.0.0 in production behind a proxy
- [ ] Enable HTTPS via reverse proxy (nginx/Caddy)
- [ ] Set API budget caps in Token Factory
- [ ] Use network security groups to restrict port access
- [ ] For Docker: container runs as non-root user `node` (uid 1000)

---

## SLIDE 17: Troubleshooting Quick Reference

| Problem | Fix |
|---------|-----|
| Gateway won't start | Check port 18789: `lsof -i :18789` |
| Token Factory 401 | Verify API key: `curl -H "Authorization: Bearer $KEY" https://api.tokenfactory.nebius.com/v1/models` |
| "model not allowed" | Add model to `agents.defaults.models` allowlist (see Slide 8) |
| Model not in `/models` | Verify model exists in BOTH `models.providers[].models[]` AND the allowlist |
| Wrong model called | Check `id` matches Token Factory exactly (e.g., `moonshotai/Kimi-K2.5`) |
| Docker OOM (exit 137) | Increase memory to 2GB minimum |
| Slow responses | Try Kimi K2.5: `/model kimi` |
| Connection refused | Check bind address and firewall rules |

---

## SLIDE 18: What You Built Today

1. Installed OpenClaw (npm or Docker)
2. Connected to Nebius Token Factory (open-source models)
3. Selected a model and configured tool calling
4. Understand three deployment methods (npm, Docker, Serverless)
5. Know how to go from prototype to production

**Your agent is live. No Claude API key needed. No OpenAI. Just open-source models on Nebius.**

---

## SLIDE 19: Resources

| Resource | Link |
|----------|------|
| OpenClaw Docs | docs.openclaw.ai |
| Docker Install | docs.openclaw.ai/install/docker |
| Token Factory Docs | docs.tokenfactory.nebius.com |
| Token Factory Cookbook | github.com/nebius/token-factory-cookbook |
| ClawCamp Tutorials | claw.camp/curriculum |
| Agent Inference Workshop | claw.camp/curriculum/agent-inference |
| Discord | discord.gg/clawcamp |

---

## SLIDE 20: Next Steps

**Beginner:**
- Deploy via Web Console (20 min) — claw.camp/curriculum/deploy-console
- Deploy with Install Scripts (15 min) — claw.camp/curriculum/deploy-scripts

**Intermediate:**
- Deployment Patterns & Troubleshooting (45 min) — claw.camp/curriculum/deploy-patterns
- Private Agents for sensitive data (55 min) — claw.camp/curriculum/private-agents

**Advanced:**
- Agent Lifecycle & Fine-Tuning (70 min) — claw.camp/curriculum/agent-lifecycle
- Robotics with Solo CLI (75 min) — claw.camp/curriculum/robotics

---

## SLIDE 21: Thank You

**Running OpenClaw on Nebius**
From zero to a live AI agent in 15 minutes

Open-source models. Pay-per-token. No vendor lock-in.

Questions? Find us at:
- claw.camp
- discord.gg/clawcamp
- hello@claw.camp

**Join the personal AI revolution.**
