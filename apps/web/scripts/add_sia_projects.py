#!/usr/bin/env python3
# One-shot: add the Self-Improving AI (SIA) Agents hackathon submissions
# (AGI House SF x Nebius) to the Directus `projects` collection as community apps.
# Curated from each repo's GitHub metadata + the getoatmeal submission pitches.
import json, re, urllib.request, sys, os

env = {}
try:
    with open('.env.local') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env[k] = v.strip().strip('"').strip("'")
except FileNotFoundError:
    pass

DURL = (os.environ.get('DIRECTUS_URL_OVERRIDE') or env.get('DIRECTUS_URL', '')).rstrip('/')
TOKEN = os.environ.get('DIRECTUS_TOKEN_OVERRIDE') or env.get('DIRECTUS_ADMIN_TOKEN', '')
print('DIRECTUS host:', re.sub(r'https?://([^/]+).*', r'\1', DURL))

TAGS = ['self-improving-ai', 'agents', 'hackathon']
GH = 'https://github.com/'

# (slug, title, tagline, builder_handle, repo_path, product_focus, extra_tags, stars, demo)
ROWS = [
    ('sia-janusql', 'JanuSQL',
     'A self-improving text-to-SQL agent that rewrites its own harness across generations — 75.8%->93.3% execution accuracy with the model held fixed.',
     'Kush614', 'Kush614/sia-self-improving-text-to-sql', ['aicloud'], ['text-to-sql'], 0, None),
    ('sia-haggle', 'SIA Haggle',
     'Predicts the final price of a Craigslist negotiation from a truncated transcript, running on the Nebius Token Factory API.',
     'Leapfrogger-ai', 'Leapfrogger-ai/oss-sia-haggle', ['tokenfactory'], ['negotiation'], 0, None),
    ('sia-verifier-optimizer', 'SIA Verifier / Optimizer Lab',
     'An interactive verifier/optimizer lab for studying Self-Improving AI Goodhart failures.',
     'skyzer', 'skyzer/self-improving-agent-verifier-optimizer', ['aicloud'], ['evaluation', 'goodhart', 'verifier-design'], 0, None),
    ('sia-sec-filings-qa', 'SEC 10-K / 10-Q Q&A Agent',
     'A self-improving agent for question-answering over SEC 10-K / 10-Q filings.',
     'CuriousDima', 'CuriousDima/sec-10k-10q-qa', ['aicloud'], ['rag', 'finance'], 0, None),
    ('sia-improvement-research', 'SIA-Improvement',
     'An autonomous research framework for fine-tuning MoE language models, orchestrated by four collaborating agents from Claude Code.',
     'dronomyio', 'dronomyio/SLA-improvement', ['aicloud'], ['fine-tuning', 'moe'], 0, None),
    ('sia-humor-enhancer', 'AI Humor Enhancer',
     'A self-improving AI that benchmarks and enhances humor.',
     'actionstockplus-ui', 'actionstockplus-ui/ia-humor-benchmarks', ['aicloud'], ['benchmark'], 0, None),
    ('sia-framework', 'SIA — Self-Improving AI Framework',
     'A framework to autonomously improve the performance of any AI model or agent on a benchmark task. The reference framework for the SIA Agents hackathon (Hexolabs).',
     'francisco-perez-sorrosal', 'francisco-perez-sorrosal/sia', ['aicloud'], ['framework'], 0, 'https://hexolabs.com/'),
    ('sia-premise', 'Premise',
     'A stigmergic agent language for coordinating self-improving agents.',
     'SubThought', 'SubThought/Premise', ['aicloud'], ['agent-language'], 9, None),
    ('sia-sentience', 'Sentience',
     'Building sentient beings — a self-improving agent experiment.',
     'SubThought', 'SubThought/Sentience', ['aicloud'], [], 2, None),
    ('sia-lever', 'SIA Lever',
     'Optimize your optimizer — a lever for self-improving AI harnesses.',
     'mdkrasnow', 'mdkrasnow/sia-lever', ['aicloud'], ['optimization'], 0, None),
    ('sia-localtinker', 'LocalTinker',
     'A local harness for tinkering with self-improving agents.',
     'tmc', 'tmc/localtinker', ['aicloud'], [], 1, None),
    ('sia-mlx-go', 'MLX-Go SIA (Apple Silicon)',
     'Self-Improving AI on Apple Silicon via MLX and Go.',
     'tmc', 'tmc/mlx-go-sia', ['aicloud'], ['apple-silicon', 'mlx'], 0, None),
    ('sia-sentinel', 'Sentinel',
     'A self-improving agent for authenticity detection.',
     'ankitshah009', 'ankitshah009/sentinel_self_improving_authenticity', ['aicloud'], ['authenticity'], 0, None),
    ('sia-kernel', 'SIA Kernel',
     'A kernel for orchestrating Self-Improving AI agents.',
     'whatdhack', 'whatdhack/SIAKernel', ['aicloud'], [], 0, None),
    ('sia-darwinian', 'Darwinian SIA',
     'An evolutionary approach to Self-Improving AI agents.',
     'kshivam4781', 'kshivam4781/DarwinianSIA', ['aicloud'], ['evolutionary'], 0, None),
    ('sia-ai-trader', 'AI Trader',
     'A self-improving AI trading agent.',
     'KaushikSiva', 'KaushikSiva/ai-trader', ['aicloud'], ['trading'], 0, None),
    ('sia-self-improvement-agent', 'Self-Improvement Agent',
     'A self-improving AI agent built for the SIA Agents hackathon.',
     'TatianaUshakova', 'TatianaUshakova/self-improvement-agent-hackathon', ['aicloud'], [], 0, None),
    # Bare forks of the base SIA framework (no custom repo metadata) — included
    # for completeness, distinguished by builder.
    ('sia-agent-hsehskad', 'SIA Agent — hsehskad',
     'A Self-Improving AI Agents hackathon submission built on the SIA framework.',
     'hsehskad', 'hsehskad/sia', ['aicloud'], [], 0, None),
    ('sia-agent-rayshine', 'SIA Agent — rayshineeeee',
     'A Self-Improving AI Agents hackathon submission built on the SIA framework.',
     'rayshineeeee', 'rayshineeeee/sia', ['aicloud'], [], 0, None),
    ('sia-agent-ayaelnakeb', 'SIA Agent — ayaelnakeb',
     'A Self-Improving AI Agents hackathon submission built on the SIA framework.',
     'ayaelnakeb', 'ayaelnakeb/sia', ['aicloud'], [], 0, None),
]

records = []
for slug, title, tagline, builder, repo, pf, extra, stars, demo in ROWS:
    rec = {
        'slug': slug,
        'title': title,
        'tagline': tagline,
        'description': tagline + ' Submitted to the Self-Improving AI (SIA) Agents Emergency Hackathon by AGI House SF & Nebius.',
        'builder_handle': builder,
        'repo_url': GH + repo,
        'tags': TAGS + extra,
        'product_focus': pf,
        'stars': stars,
        'hackathon': 'none',
        'featured': False,
    }
    if demo:
        rec['demo_url'] = demo
    records.append(rec)

body = json.dumps(records).encode()
req = urllib.request.Request(f'{DURL}/items/projects', data=body, method='POST',
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=40) as r:
        resp = json.loads(r.read())
    created = resp.get('data', [])
    print(f'CREATED {len(created)} projects')
    for c in created:
        print('  +', c.get('slug'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode()[:1500])
