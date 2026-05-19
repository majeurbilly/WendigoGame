import * as fs from 'node:fs';
import * as path from 'node:path';
import * as pulumi from '@pulumi/pulumi';

interface PrometheusConfigInputs {
  configPath: string;
  content: string;
  reloadUrl: string;
}

async function writeAndReload(inputs: PrometheusConfigInputs): Promise<void> {
  fs.mkdirSync(path.dirname(inputs.configPath), { recursive: true });
  fs.writeFileSync(inputs.configPath, inputs.content, 'utf8');

  try {
    const res = await fetch(`${inputs.reloadUrl}/-/reload`, { method: 'POST' });
    if (!res.ok) {
      console.warn(
        `Prometheus reload returned ${res.status}: restart the container to pick up changes.`,
      );
    }
  } catch {
    console.warn('Prometheus not reachable: restart the container to pick up config changes.');
  }
}

const prometheusConfigImpl: pulumi.dynamic.ResourceProvider = {
  async create(inputs: PrometheusConfigInputs) {
    await writeAndReload(inputs);
    return { id: inputs.configPath, outs: inputs };
  },

  async update(_id: string, _olds: PrometheusConfigInputs, news: PrometheusConfigInputs) {
    await writeAndReload(news);
    return { outs: news };
  },

  async diff(_id: string, olds: PrometheusConfigInputs, news: PrometheusConfigInputs) {
    const changed =
      olds.content !== news.content ||
      olds.configPath !== news.configPath ||
      olds.reloadUrl !== news.reloadUrl;
    return { changes: changed };
  },

  async delete() {
    // Leave the file in place; Prometheus still needs it to run
  },
};

export interface PrometheusConfigResourceArgs {
  configPath: pulumi.Input<string>;
  content: pulumi.Input<string>;
  reloadUrl: pulumi.Input<string>;
}

export class PrometheusConfigResource extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    args: PrometheusConfigResourceArgs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super(prometheusConfigImpl, name, args, opts);
  }
}
