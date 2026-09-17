import React from 'react';
import { UserHasAccess } from '@openmrs/esm-framework';

interface GenericActionButtonProps {
  privilege?: string;
  handleClick: () => void;
  title?: string;
}

const GenericActionButton: React.FC<GenericActionButtonProps> = ({ privilege, handleClick, title }) => {
  const button = (
    <li className="cds--overflow-menu-options__option">
      <button
        className="cds--overflow-menu-options__btn"
        role="menuitem"
        title={title}
        data-floating-menu-primary-focus
        onClick={handleClick}
        style={{
          maxWidth: '100vw',
        }}
      >
        <span className="cds--overflow-menu-options__option-content">{title}</span>
      </button>
    </li>
  );

  return privilege ? <UserHasAccess privilege={privilege}> {button} </UserHasAccess> : <>{button}</>;
};

export default GenericActionButton;
