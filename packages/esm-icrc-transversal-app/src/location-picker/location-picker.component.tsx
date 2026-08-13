import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search, RadioButton, RadioButtonGroup, RadioButtonSkeleton } from '@carbon/react';
import styles from './location-picker.styles.scss';
import { useLocationByUuid, useLocations } from './location-picker.resource';

interface LocationPickerProps {
  selectedLocation?: { uuid: string; name: string };
  defaultLocationUuid?: string;
  locationTag?: string;
  locationsPerRequest?: number;
  onChange: (location?: { uuid: string; name: string }) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  defaultLocationUuid,
  locationTag,
  locationsPerRequest = 50,
  onChange,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>('');

  let defaultLocation = useLocationByUuid(defaultLocationUuid).location;

  const {
    locations: fetchedLocations,
    isLoading,
    hasMore,
    loadingNewData,
    setPage,
  } = useLocations(locationTag, locationsPerRequest, searchTerm);

  const locations = useMemo(() => {
    if (defaultLocation && !searchTerm) {
      return [defaultLocation, ...fetchedLocations?.filter(({ resource }) => resource.id !== defaultLocationUuid)];
    }
    return fetchedLocations;
  }, [defaultLocation, defaultLocationUuid, fetchedLocations, searchTerm]);

  const search = (location: string) => {
    onChange();
    setSearchTerm(location);
  };

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingIconRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingNewData) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((page) => page + 1);
          }
        },
        {
          threshold: 1,
        },
      );
      if (node) observer.current.observe(node);
    },
    [loadingNewData, hasMore, setPage],
  );

  const reloadIndex = hasMore ? locations.length - locationsPerRequest / 2 : -1;

  return (
    <div>
      <Search
        autoFocus
        labelText={t('searchForLocation', 'Search for a location')}
        id="search-1"
        placeholder={t('searchForLocation', 'Search for a location')}
        onChange={(event) => search(event.target.value)}
        name="searchForLocation"
        size="lg"
      />
      <div className={styles.searchResults}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
          </div>
        ) : (
          <>
            <div className={styles.locationResultsContainer}>
              {locations?.length > 0 ? (
                <RadioButtonGroup
                  valueSelected={selectedLocation?.uuid}
                  orientation="vertical"
                  name="Login locations"
                  onChange={(uuid) => {
                    const selectedLocation = locations.find((loc) => loc.resource.id === uuid);
                    onChange(
                      selectedLocation
                        ? { uuid: selectedLocation.resource.id, name: selectedLocation.resource.name }
                        : undefined,
                    );
                  }}
                >
                  {locations.map((entry, i) => (
                    <RadioButton
                      className={styles.locationRadioButton}
                      key={entry.resource.id}
                      id={entry.resource.id}
                      name={entry.resource.name}
                      labelText={<span ref={i === reloadIndex ? loadingIconRef : null}>{entry.resource.name}</span>}
                      value={entry.resource.id}
                    />
                  ))}
                </RadioButtonGroup>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.locationNotFound}>{t('noResultsToDisplay', 'No results to display')}</p>
                </div>
              )}
            </div>
            {loadingNewData && (
              <div className={styles.loadingIcon}>
                <InlineLoading description={t('loading', 'Loading')} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
