import React from 'react';
import styles from './total-sessions-card.scss';
import { Tile } from '@carbon/react';

interface TotalSessionsCardProps {
  title: string;
  value: string | number;
  icon?: any;
}

const TotalSessionsCard: React.FC<TotalSessionsCardProps> = ({ title, value, icon }) => {
  return (
    <div>
      <Tile className={`${styles.tileContainer}`}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{title}</label>
          </div>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{icon}</label>
          </div>
        </div>
        <div>
          <h3 className={styles.totalsValue}>{value}</h3>
        </div>
      </Tile>
    </div>
  );
};

export default TotalSessionsCard;
