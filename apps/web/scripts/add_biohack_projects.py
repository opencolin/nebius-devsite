#!/usr/bin/env python3
# One-shot: add the NextGen BioAgents Hackathon submissions (Nucleate NY, Jun 6 2026)
# to the Directus `projects` collection. GitHub -> repo_url, demo/video -> demo_url.
# Slides (Google Slides / Canva / OneDrive / Figma) are intentionally skipped.
import json, re, urllib.request, os

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

BASE_TAGS = ['biohack', 'bioagents', 'hackathon']

# (slug, title, tagline, description, builder, repo, demo, track_tag, award, members)
R = [
 # --- Track 01: Clinical Decision Support ---
 ('biohack-phoenix','Phoenix','Agentic evidence engine for clinical trial rescue',
  'Uncovers new commercial opportunities for clinical trials by operating in biological program space rather than indication space, delivering broader coverage in days at a fraction of the cost.',
  'Shaivpidadi','https://github.com/Shaivpidadi/Phoenix','https://drive.google.com/file/d/127eJD3y17pYmqP0oSo5wEx9izhqhkPu4/view','clinical-decision-support','runner-up',1),
 ('biohack-trialsense','TrialSense','Trial matching that makes sense',
  'Helps clinical trial coordinators find and rank eligible patients for a study. Enter an NCT ID or ClinicalTrials.gov URL and the app fetches eligibility, scores patients against inclusion/exclusion criteria, and returns a ranked list with match details and PCP contact info.',
  'Linh Chu',None,'https://drive.google.com/file/d/12Bd0F2W0oIq2TPMb0XZdJ3p2MU7aqUdR/view','clinical-decision-support',None,3),
 ('biohack-sentinel','Sentinel','Finding patients for trials from their wrist',
  'Uses Apple Watch biometric data to surface hidden disease indications and find eligible patients for clinical trials.',
  'Atharv Jayprakash',None,None,'clinical-decision-support',None,1),
 ('biohack-covalence','Covalence','Agentic bi-directional clinical trial & decision support',
  'A bi-directional agentic system that matches patients to trials based on patient records, surfacing missing data instead of guessing. Provides potential missed diagnoses, predicts whether a patient is likely to meet unspecified criteria, and logs the agent’s entire thought process for audit.',
  'Jihyun Park',None,'https://drive.google.com/file/d/1gMNEklr-Kl5kzJIpr-Tu0AYUBco2NnlC/view','clinical-decision-support',None,2),
 ('biohack-lindr','Lindr','Find the trial that fits',
  'An AI-powered clinical trial matching platform for physicians. Ingests patient EHR data and ClinicalTrials.gov protocols, surfaces a ranked list of matched trials in the doctor’s workflow, and learns from each physician’s decisions to improve match quality over time.',
  'Bonnie',None,'https://www.youtube.com/watch?v=qvpGziGL7lw','clinical-decision-support',None,1),
 ('biohack-hera','Hera','The latest research in your hands',
  'A multi-agent medical research assistant built on Google’s ADK that turns a patient story into a cited, patient-readable research brief in minutes. A SequentialAgent chains intake → research → topics → synthesis while a ParallelAgent fans out paper search, researcher matching, trials lookup, and grounded search.',
  'Jesse Linson',None,'https://www.loom.com/share/ee9b6bdfbadb4269a7d2a97a3d6176f9','clinical-decision-support',None,1),
 ('biohack-gutguru','GutGuru','The observation layer your physician was missing',
  'A clinical insight layer that gives doctors a clearer picture of gut health over time. Anchors lab panels against a dense daily symptom series on one timeline. Built with Python, Notion as the data layer, open models via Nebius for narration, and PubMed for real citations.',
  'Luay Younus',None,'https://gutguru.health/','clinical-decision-support',None,1),
 # --- Track 02: Autonomous Research ---
 ('biohack-neurodiscover-ai','NeuroDiscover AI','Mining evidence for direction',
  'A multi-agent research engine for pharma translational and commercial strategy teams. Reads across papers, trials, grants, and preprints; finds hidden patient subgroups; maps them to treatment mechanisms; and outputs an auditable, ranked shortlist of subgroup-to-mechanism-to-treatment hypotheses with NIH-style specific aims.',
  'Alia Merchant',None,'https://www.youtube.com/watch?v=QAdsreJ_ryw','autonomous-research',None,5),
 ('biohack-synthesisos','SynthesisOS','Turn existing literature into hypotheses without pressing a button',
  'An autonomous biomedical research agent that ingests papers from Semantic Scholar, PubMed, and arXiv and builds a live knowledge graph of genes, pathways, and diseases. Detects structural gaps, generates testable hypotheses with scored evidence, and produces funder-ready investment briefs with an exportable audit log.',
  'Aryan Acharya',None,'https://www.youtube.com/watch?v=4BreIGvsUvM','autonomous-research',None,1),
 ('biohack-scientific-consensus-engine','Scientific Consensus Engine','Adversarial multi-agent hypothesis debate powered by Nebius',
  'Agents continuously ingest papers, patents, and preprints; identify knowledge gaps; generate novel hypotheses; and update conclusions as new data emerges. A multi-agent debate arena argues for and against a hypothesis using real literature, with a Consensus Hardening Protocol for traceable, auditable conclusions.',
  'Shyam Desigan',None,'https://www.youtube.com/watch?v=muyhof_k0mc','autonomous-research',None,1),
 ('biohack-arclight-bio','Arclight Bio','All experts at the table',
  'An AI-native commercial development platform. Upload a patient cohort and clinical question and 30+ autonomous agents run a two-phase pipeline from anchor populations through a 50→20→3 hypothesis funnel to IND-ready assessments, querying live PubMed, trials, patents, and FDA data at every step.',
  'nayanikar','https://github.com/nayanikar/arclightbio','https://www.youtube.com/watch?v=mJ6OcfUtvMU','autonomous-research',None,1),
 ('biohack-strata','Strata','Molecular subgroup discovery engine',
  'Uses methylation data to determine differential drug sensitivity, with an agent interface over the underlying pretrained model.',
  'Lapintam','https://github.com/Lapintam/Biohack_626','https://www.youtube.com/watch?v=Z7XIFzzO6N4','autonomous-research',None,1),
 ('biohack-phasezero','PhaseZero','Pharma portfolio insurance before the wet lab',
  'An asynchronous multi-agent engine that ingests temporal publication momentum, clinical trial pipelines, and regulatory precedents to map cumulative uncertainty across the entire drug lifecycle.',
  'arshleenn-kaurr','https://github.com/arshleenn-kaurr/phasezero',None,'autonomous-research',None,1),
 # --- Track 03: Omics ---
 ('biohack-histogen','HistoGen','Enabling tumor boards with AI-assisted pathology-derived data',
  'A Claude agent that turns routinely available clinical data and H&E pathology slides into a virtual molecular tumor board. Derives costly molecular layers — multiplex-immunofluorescence-like marker maps and spatial transcriptomics — then integrates them with DNA mutation data to help clinicians reason beyond mutation status alone.',
  'aonkondey01','https://github.com/aonkondey01/HistoGEN-NucleateNY-NextGen-BioAgents-Hackathon','https://www.youtube.com/watch?v=10ENSYom6g4','omics','winner',1),
 ('biohack-genofit','GenoFit','Your genes, your data, your edge',
  'An intelligent health dashboard that merges a static genetic blueprint with dynamic wearable data to create a living digital twin, delivering personalized and actionable biological insights.',
  'krxstxna','https://github.com/krxstxna/NewBiohack','https://www.youtube.com/watch?v=f2fnwVhWc-o','omics',None,1),
 ('biohack-genomicwatch','GenomicWatch','Ending the information blackout between appointments',
  'A proactive surveillance agent that monitors genomic databases and literature nightly for patients with a genetic variant report (especially a VUS). Queries PubMed, ClinVar, and ClinicalTrials.gov, scores evidence with the ERAA framework, and notifies patients within 24 hours of critical findings in plain language.',
  'Ryan German',None,'https://www.youtube.com/watch?v=gkHZQoySPeo','omics',None,1),
 ('biohack-hsence','Hsence','AI-powered hormonal intelligence platform',
  'Turns continuous multimodal health data — wearables, labs, EHR, and daily behavioral signals — into a longitudinal hormonal profile. Uses agents to detect early risk signals and generate personalized, evidence-based interventions for women navigating menopause, fertility, PCOS, and related conditions.',
  'AlbinaKrasykova','https://github.com/AlbinaKrasykova/Hsence-','https://www.youtube.com/watch?v=fD7urtnrFYQ','omics',None,1),
 ('biohack-organoid-grader','Brain Organoid Morphological Classifier','Automated QC for stem-cell-derived brain organoids',
  'Organoid-Grader classifies brightfield brain organoid images as pass or fail based on morphological features (tissue uniformity, necrotic core, Feret diameter, cyst formation). Combines literature-informed rule-based grading with a Random Forest classifier trained on the Schroter et al. dataset (~1,400 images).',
  'shirazbheda','https://github.com/shirazbheda/organoid.grader',None,'omics',None,None),
 # --- Track 04: Lab Automation ---
 ('biohack-brewmind','BrewMind','Biodesign, accelerated',
  'From a plain-language brief to a validated, lab-ready ingredient discovery proposal — in minutes, not months.',
  'Helen Zhang',None,'https://www.loom.com/share/122883fe3e4f43c1a662dd130b250ea3','lab-automation',None,1),
 ('biohack-blue','Blue','Personalized skincare planning for sensitive skin',
  'A personalized skincare planning platform for people with sensitive skin. Using facial analysis, skin assessments, ingredient intelligence, and personalized profiles, Blue creates tailored skincare plans designed around each individual’s needs, sensitivities, concerns, and goals.',
  'Weilan',None,'https://www.loom.com/share/8b05c80f2db6417e8ac0ec10c5fe26ed','lab-automation',None,1),
 # --- Track 05: Regulatory & Documentation ---
 ('biohack-pbj','PB&J','Predicates, Building, and Journey — navigating 510(k) submissions',
  'An agent to evaluate potential predicates, generate an eSTAR-ready 510(k) application, and pre-empt potential FDA inquiries to save time and cost during medical-device development.',
  'antmbraun','https://github.com/antmbraun/NextGen-BioAgents-Hackathon-2026','https://www.youtube.com/watch?v=MI3TOhdBtPA','regulatory','3rd',1),
 ('biohack-submissionai','SubmissionAI','Data provenance & compliance automation for Phase 2→3 transitions',
  'A five-agent system that automates regulatory compliance for pharmaceutical IND submissions, targeting the Phase 2→3 transition where 70% of programs fail. Deploys LangGraph agents (Content Analyzer, Data Provenance Tracker, SAP Validator, FDA Conformance Checker, Report Generator); a synthetic Phase 3 trial reached 94% compliance in under 60 seconds.',
  'Bruce Wang',None,'https://drive.google.com/file/d/1ac3-3JQaR0KSfuC6HTDvqJuYeUA9S3NM/view','regulatory',None,1),
 ('biohack-qualforge','MRK III — QUALForge','GMP qualification binder, automated',
  'An agentic copilot that turns an equipment brochure into a complete, e-signable GMP qualification binder — URS → IQ → OQ → PQ → RTM → VSR — in an afternoon instead of a week. A multi-agent pipeline drafts every document in dependency order under a deterministic rulebook, with a human SME signing every page.',
  'Kevin Ortiz',None,'https://www.youtube.com/watch?v=Ygk9orQC0Wc','regulatory',None,3),
]

records = []
for slug, title, tagline, desc, builder, repo, demo, track, award, members in R:
    rec = {
        'slug': slug,
        'title': title,
        'tagline': tagline,
        'description': desc + ' Submitted to the NextGen BioAgents Hackathon (Nucleate NY × Nebius, Jun 2026).',
        'builder_handle': builder,
        'tags': BASE_TAGS + [track],
        'product_focus': ['tokenfactory'],
        'hackathon': 'none',
        'featured': False,
    }
    if repo:
        rec['repo_url'] = repo
    if demo:
        rec['demo_url'] = demo
    if award:
        rec['award'] = award
    if members:
        rec['members'] = members
    records.append(rec)

print(f'Prepared {len(records)} projects ({sum(1 for r in records if "repo_url" in r)} with repo, {sum(1 for r in records if "demo_url" in r)} with demo).')

body = json.dumps(records).encode()
req = urllib.request.Request(f'{DURL}/items/projects', data=body, method='POST',
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())
    created = resp.get('data', [])
    print(f'CREATED {len(created)} projects')
    for c in created:
        print('  +', c.get('slug'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode()[:2000])
