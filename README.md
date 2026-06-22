# CloudPulse — AWS Observability System

CloudPulse is a lightweight, event-driven observability pipeline that converts AWS Lambda execution logs into structured metrics and computes latency percentiles (p50, p95, p99).

It is designed to demonstrate how production observability systems like Datadog and CloudWatch Metrics work internally.

---

## 🚀 Problem

AWS Lambda generates fragmented logs that are difficult to use for reliable metric computation.

---

## 💡 Solution

CloudPulse converts each Lambda invocation into a structured event, enabling deterministic and queryable metrics.

---

## 🧱 Architecture

Lambda → CloudWatch Logs → Ingestion Lambda → DynamoDB → CLI Analytics Engine

---

## 🎯 Key Design Principle

> One Lambda invocation = One structured metric record

This eliminates log parsing and ensures consistent analytics.

---

```md id="fix2"
## 📊 Data Model (DynamoDB)

```json
{
  "pk": "SERVICE#lambda-name",
  "sk": "TIME#timestamp#requestId",
  "durationMs": 42,
  "billedMs": 100,
  "memoryMb": 128,
  "requestId": "abc-123",
  "timestamp": "ISO-8601"
}

⚙️ CLI Usage

node cloudpulse-cli/index.js stats /aws/lambda/<function-name>

🛠 Tech Stack

AWS Lambda • CloudWatch Logs • DynamoDB • Node.js

🧠 Key Insight

Observability systems are not log processors — they are event modeling systems.

📈 What This Project Demonstrates

Event-driven architecture
AWS serverless design
Time-series data modeling
Distributed systems thinking
Backend system design fundamentals

🚀 Scaling Plan

Add streaming ingestion (Kinesis)
Add pre-aggregation layer
Split hot/cold storage
Add dashboard layer (Grafana / QuickSight)

---
💼 Resume Summary

Built an AWS serverless observability pipeline that converts Lambda logs into structured events and computes latency percentiles using a Node.js analytics engine. Designed a DynamoDB time-series schema and eliminated log parsing by enforcing event-driven ingestion.


