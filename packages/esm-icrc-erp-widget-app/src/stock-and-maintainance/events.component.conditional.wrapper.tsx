import React from 'react';
import StockMaintenanceTable from './events.component';
import { fetchGlobalProperty } from '@icrc/esm-icrc-transversal-app/src/reports-widget/reports-widget.resource';
import { useConfig } from '@openmrs/esm-framework';

const StockMaintenanceTableWrapper = () => {
  const [erpEnabled, setErpEnabled] = React.useState<null | string>();
  const config = useConfig();

  React.useEffect(() => {
    if (config.erpStartedGlobalProperty) {
      const property = sessionStorage.getItem(config.erpStartedGlobalProperty);
      if (property) {
        setErpEnabled(property);
      } else {
        const abortController = new AbortController();
        fetchGlobalProperty(abortController, config.erpStartedGlobalProperty).then((response) => {
          if (response.status === 200) {
            setErpEnabled(
              response.data.results.map((globalProperty) => {
                sessionStorage.setItem(config.erpStartedGlobalProperty, globalProperty.value);
                return globalProperty.value;
              })[0],
            );
          }
        });
      }
    }
  }, [config]);

  if (erpEnabled !== 'true') {
    return <></>;
  }

  return <StockMaintenanceTable />;
};

export default StockMaintenanceTableWrapper;
