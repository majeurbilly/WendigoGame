export interface ScrapeJob {
  name: string;
  targets: string[];
  metricsPath?: string;
}

export interface PrometheusConfig {
  scrapeIntervalSeconds: number;
  evaluationIntervalSeconds: number;
  scrapeJobs: ScrapeJob[];
}

export function renderPrometheusYaml(cfg: PrometheusConfig): string {
  const jobs = cfg.scrapeJobs
    .map((job) => {
      const lines = [
        `  - job_name: ${job.name}`,
        `    static_configs:`,
        `      - targets: [${job.targets.map((t) => `"${t}"`).join(', ')}]`,
      ];
      if (job.metricsPath) lines.push(`    metrics_path: ${job.metricsPath}`);
      return lines.join('\n');
    })
    .join('\n\n');

  return [
    `global:`,
    `  scrape_interval: ${cfg.scrapeIntervalSeconds}s`,
    `  evaluation_interval: ${cfg.evaluationIntervalSeconds}s`,
    ``,
    `scrape_configs:`,
    jobs,
    ``,
  ].join('\n');
}
