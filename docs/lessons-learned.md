# CloudPulse — Lessons Learned

## 🧠 1. Data modeling is more important than code
Most complexity came from defining what a “request” actually is. Once I defined it as a single Lambda invocation, the system became deterministic.

---

## 🧠 2. Log-based thinking does not scale conceptually
Initially I treated logs as the source of truth, which led to brittle parsing logic. Moving to event-based modeling simplified the entire pipeline.

---

## 🧠 3. Ingestion must normalize, not interpret
The ingestion layer should only:
- transform
- normalize
- persist

It should NOT compute analytics.

---

## 🧠 4. Separation of concerns is critical
Clear system boundaries improved design:
- ingestion → writes structured events
- storage → holds truth
- analytics → computes metrics

---

## 🧠 5. Real-world observability is event-driven
Modern systems like Datadog, OpenTelemetry, and CloudWatch Metrics rely on structured events rather than raw logs.

---

## 🧠 Key Insight

Observability systems are not log processors — they are event modeling systems.
