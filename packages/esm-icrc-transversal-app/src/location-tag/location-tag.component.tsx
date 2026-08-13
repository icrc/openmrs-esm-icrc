import React from 'react';

import { Tag } from '@carbon/react';
import { useSession } from '@openmrs/esm-framework';
import { useHsuIdIdentifier } from './location-tag.resource';

interface LocationTagProps {
  patient: any;
  patientUuid: string;
}

const LocationTag: React.FC<LocationTagProps> = ({ patient, patientUuid }) => {
  const { sessionLocation } = useSession();
  const { hsuIdentifier } = useHsuIdIdentifier(patientUuid);

  if (hsuIdentifier && sessionLocation.uuid != hsuIdentifier.location.uuid) {
    return (
      <Tag type="gray" size="md">
        {hsuIdentifier.location.display}
      </Tag>
    );
  }
};

export default LocationTag;
