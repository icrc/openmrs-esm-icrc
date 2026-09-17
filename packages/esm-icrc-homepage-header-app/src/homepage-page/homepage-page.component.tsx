import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
//import styles from './home-page-widgets.scss';

interface HomePageWidgetsProps {}

const HomePageWidgets: React.FC<HomePageWidgetsProps> = () => {
  return <ExtensionSlot name="homepage-widgets-slot" />;
};

export default HomePageWidgets;
