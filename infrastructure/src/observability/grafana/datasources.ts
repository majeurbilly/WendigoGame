import * as grafana from '@pulumiverse/grafana';
import { lokiUrl, prometheusUrl } from '../../config';
import { grafanaOpts } from '../../utils';

export function createDatasources(provider: grafana.Provider) {
  const prometheus = new grafana.oss.DataSource(
    'prometheus',
    {
      name: 'Prometheus',
      type: 'prometheus',
      url: prometheusUrl,
      isDefault: true,
    },
    grafanaOpts(provider),
  );

  const loki = new grafana.oss.DataSource(
    'loki',
    {
      name: 'Loki',
      type: 'loki',
      url: lokiUrl,
    },
    grafanaOpts(provider),
  );

  return { prometheus, loki };
}
